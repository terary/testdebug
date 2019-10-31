"use strict";
const util = require('util');
const EventEmitter  = require('events');
const BitcoinClient = require('bitcoin-core');
const BtError = require('./BtError').BtError;

const AS_JSON = true; // argument for bitcoin client

/**
 *
 *
 * @param {json} trans transaction description from bitcoin getrawtransaction
 * @returns object with any op_return data {transactionHash: OP_RETURN}
 * 
 * Assumes there will be only one OP_RETURN per transaction
 * 
 */
const transToOpReturn = (trans) => {

    const OP_RETURN = trans.vout.reduce((acc,cur,idx,arr) => {
        if(cur.scriptPubKey.asm.indexOf('OP_RETURN') !== -1 ){
            return  cur.scriptPubKey.asm.replace('OP_RETURN','').trim();
        } 
        return acc;   
    }, undefined)
    return {transHash: trans.hash,  OP_RETURN};
}


/**
 *  Serves as proxy class to require('bitcoin-core');
 * 
 *  Calls  to either processBlockByHash(...) processBlockByHeight(...)
 *  Will eventually lead to event opReturnFetchComplete or error 
 *
 * @class OpReturnGetter
 * @extends {EventEmitter}
 */
class OpReturnGetter extends EventEmitter {
    constructor(bitcoinClientConfigs){
        super();

        const configs = Object.assign({},bitcoinClientConfigs, {headers:false}  );
        //setting true cause the alternative RPC response,
        this._bitcoinClient = new BitcoinClient(configs);
    

        this.on('errorWrapper', function(btErrorCode, error){
            if(!error || !error.isBtError){
                return this.emit('error', new BtError(btErrorCode, error))
           }
           return this.emit('error', error);
        })

        this.privateTestFunctions = {}
        this.privateTestFunctions.transToOpReturn = transToOpReturn;
        this.privateTestFunctions.fetchRawTransactions =this._fetchRawTransactions;
    }

    /**
     * @private
     * @param {string} blockHash - blockHeight for the supplied transaction ids
     * @param {string} blockHeight - blockHeight for the supplied transaction ids
     * @param {[string]} TXIDs - transaction ids to be queried. 
     * @returns - emits: opReturnFetchComplete with {blockHeight, blockHash,totalTrans,  opReturns:: [{transHash,OP_RETURN},...]}
     * @memberof OpReturnGetter
     */
    _fetchRawTransactions(blockHash, blockHeight, TXIDs){
        const blockOpReturns = {blockHeight, blockHash, opReturns:[], totalTrans:undefined}
 
        if( !TXIDs || !Array.isArray(TXIDs)){
            return this.emit('errorWrapper', 'FAILED_BT_OP_BATCH_GETRAWTRANSACTION_EXPECTED_ARRAY');
        }

        const batchTx = TXIDs.map(t=>{
            return {method:'getrawtransaction', parameters: [t, AS_JSON] }
        })
        // const batchTx = []
        // batchTx.push({method: 'getrawtransaction', parameters: ['842c5d149b7654eee9fea29166f06493f201ccff98d78fe84770b325ea958e8b', true] });


        this._bitcoinClient.command(batchTx)
        .then((TXs) => {
        /*        
            Calling batch command [{method: 'getrawtransaction', parameters: [ ... ]}, ... ]
            Add significant overhead.  Definitely an issue.  No time to fix.
            
            ** Find better way **
            Confirmed performance issues not database or call stack.
            Ran same code bypassing on 1000 blocks - finishes 7seconds 
            With this code 2m20s 
        */        
 
            if(util.types.isNativeError(TXs[0]) || TXs[0].constructor.name == 'RpcError' ) {
                throw new BtError('FAILED_BT_OP_BATCH_GETRAWTRANSACTION');
            }

            if( !TXs || !Array.isArray(TXs)){  // none found -- only makes sense this is an error condition
                // not tested
                throw new BtError('FAILED_BT_OP_BATCH_GETRAWTRANSACTION');
            }

            blockOpReturns['opReturns']  = TXs 
                .map(trans => transToOpReturn(trans))
                .filter(t => t.OP_RETURN );
            
            blockOpReturns.totalTrans = TXs.length;

            return this.emit('opReturnFetchComplete', blockOpReturns);
        }).catch( btError =>{
            if(btError.isBtError){
                return this.emit('errorWrapper',btError.code, btError);                
            }
            throw(btError);

        }).catch(e=>{
            const btError =new BtError('FAILED_BT_OP_BATCH_GETRAWTRANSACTION',e);
            btError.message = `Working on blockHash: '${blockHash}' ${btError.message}`;
            return this.emit('errorWrapper',btError);                
        });
    }
    
    /**
     *
     *
     * @returns Promise - resolves with the current blockHeight
     * @memberof OpReturnGetter
     */
    getBlockCountAsPromised(){
        return this._bitcoinClient.getBlockCount();
    }

    /**
     *
     *
     * @param {*} blockHeight
     * @memberof OpReturnGetter 
     * 
     * This will lead to emitting 'opReturnFetchComplete'
     * Fetch transaction OP_RETURN given BlockHeight
     * 
     */
    processBlockByHeight( blockHeight ){
        const self =this;
        this._bitcoinClient.getBlockHash(blockHeight)
        .then((blockHash) => { 
            return this.processBlockByHash(blockHash)
        }).catch((e) => {
            this.emit('errorWrapper', 'FAILED_BT_OP_GETBLOCKHASH', e);
        });        		                
    }

    /**
     *
     *
     * @param {*} blockHash
     * @memberof OpReturnGetter 
     * 
     * This will lead to emitting 'opReturnFetchComplete'
     * Fetch transaction OP_RETURN given BlockHash
     * 
     */
    processBlockByHash(blockHash) {
        const self =this;
        this._bitcoinClient.getBlock(blockHash)
        .then((block) => { 
            self._fetchRawTransactions(blockHash,block.height, block.tx)
        }).catch((e) => {
            this.emit('errorWrapper', 'FAILED_BT_OP_GETBLOCK', e);
        });
    }

}


module.exports =function(configs) {
        return new OpReturnGetter(configs)
};