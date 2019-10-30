"use strict";
const util = require('util');
const EventEmitter  = require('events');
const BitcoinClient = require('bitcoin-core');
const KNOWN_ERRORS = require('./BtError').KNOWN_ERRORS;
const BtError = require('./BtError').BtError;

const AS_JSON = true; // argument for bitcoin client

const transToOpReturn = (trans) => {
    const OP_RETURN = trans.vout.reduce((acc,cur,idx,arr) => {
        if(cur.scriptPubKey.asm.indexOf('OP_RETURN') !== -1 ){
            return  cur.scriptPubKey.asm.replace('OP_RETURN','').trim();
        } 
        return acc;   
    }, undefined)
    return {transHash: trans.hash,  OP_RETURN};
}



class OpReturnGetter extends EventEmitter {
    // emits:
    //      opReturnFetchComplete
    constructor(bitcoinClientConfigs){
        super();

        bitcoinClientConfigs.headers = false; // true cause the response to be something other than expected
        this._bitcoinClient = new BitcoinClient(bitcoinClientConfigs);
    

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

    _fetchRawTransactions(blockHash, blockHeight, TXIDs){
        const blockOpReturns = {blockHeight, blockHash, opReturns:[], totalTrans:undefined}
 
        if( !TXIDs || !Array.isArray(TXIDs)){
            //throw new BtError('FAILED_BT_OP_BATCH_GETRAWTRANSACTION_EXPECTED_ARRAY');
            return this.emit('errorWrapper', 'FAILED_BT_OP_BATCH_GETRAWTRANSACTION_EXPECTED_ARRAY');

            //return this.emit('opReturnFetchComplete', blockOpReturns);
        }


        const batchTx = TXIDs.map(t=>{
            return {method:'getrawtransaction', parameters: [t, AS_JSON] }
        })
        // batchTx.push({method: 'getrawtransaction', parameters: ['9ea55bb90186b49ddab3c1d192fa1c0d911c8300de6cc7fcf8db8570898a27aa', true] });

        // const batchTx = []
        // batchTx.push({method: 'getrawtransaction', parameters: ['842c5d149b7654eee9fea29166f06493f201ccff98d78fe84770b325ea958e8b', true] });
        // batchTx.push({method: 'getrawtransaction', parameters: ['61c07a5cbbf4cb97288d5a719b5b371d32022d94c7207aa53374d68c47df5614', true] });
        // batchTx.push({method: 'getrawtransaction', parameters: ['5a8d8aebf733ec280d86787927eb76db2fc7381e13ca85422cfee94297f6f551', true] });
        
        this._bitcoinClient.command(batchTx)
        .then((TXs) => {
 
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

        })
        .catch(e=>{
            const btError =new BtError('FAILED_BT_OP_BATCH_GETRAWTRANSACTION',e);
            btError.message = `Working on blockHash: '${blockHash}' ${btError.message}`;
            return this.emit('errorWrapper',btError);                
        });
    }
    getBlockCount(){
        return this._bitcoinClient.getBlockCount();
    }

    getBlockHash(blockHeight){
        
        const self =this;
        this._bitcoinClient.getBlockHash(blockHeight)
        .then((block) => { 

            // could chain this 
            
            //const blk =   blockWrapper;  // verify this will always be 0 position
            // self._fetchRawTransactions(blockHash,blk.height, blk.tx)
            // self._fetchRawTransactions(blockHash,block.height, block.tx)
            // console.log(block);
            return this.process_block_id(block)
        }).catch((e) => {
            this.emit('errorWrapper', 'FAILED_BT_OP_GETBLOCKHASH', e);
        });        		        
    }

    process_block_id(blockHash) {
        const self =this;
        //********************************** */
        // bitcoinClient.getBlock('00000000000c0311be97e9097cb0e43c8f9af94ec30774ca9e93064b813ccbdb')
        this._bitcoinClient.getBlock(blockHash)
        .then((block) => { 
            //const blk =   blockWrapper;  // verify this will always be 0 position
            // self._fetchRawTransactions(blockHash,blk.height, blk.tx)
            self._fetchRawTransactions(blockHash,block.height, block.tx)

    
        }).catch((e) => {
            this.emit('errorWrapper', 'FAILED_BT_OP_GETBLOCK', e);
        });
    
        //********************************** */
    }

}


module.exports =function(configs) {
        return new OpReturnGetter(configs)
};