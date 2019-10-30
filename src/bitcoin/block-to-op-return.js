"use strict";
const EventEmitter  = require('events');
const Path = require('path');
const BitcoinClient = require('bitcoin-core');

class AppEventEmitter extends EventEmitter {};
const appEventEmitter = new AppEventEmitter();

const IS_STAND_ALONE = require.main === module ||  Error('LOADED_AS_MODULE');

// const sendError = process.send ? process.send : process.stderr.write ;
const send = (message)=>{
    if(process.send){
        process.send(message);
    }else {
        process.stdout.write(message);
    }
}
const sendError = (err)=>{
    if(process.send){
        process.send(err);
    }else {
        process.stderr.write(JSON.stringify(err));
    }
}

const usage = `
    ${Path.basename(__filename)} [block_id]
    writes to object {block_id{op_returns[...]}}
    if forked will 'send'
    if called independently will write to stdout 
`

const app = {
    STATE: 'init' , // init, started, ready, teardown 
}
const KnownErrors = {
    BITCOIND_OVERLOAD : `Bitcoind seems to be able to handle so many connections.  
                        If/when exceeded it drops the connection with error message: ...`,
    LOADED_AS_MODULE : `${Path.basename(__filename)} intended to be run as stand alone or forked` + usage, 
}
process.on('uncaughtException', (err, orgin) => {
    const errkey = 'BITCOIND_OVERLOAD';
    let outErr = {}
    if(err.message in KnownErrors ){
        outErr.code = err.message;
        outErr.message = KnownErrors[outErr.code];
    } else {
        outErr.code = '_UNKNOWN_'
        outErr.message =err.message;
        outErr.stack =err.stack;
    }
    sendError(JSON.stringify({error:outErr}))

    process.exit(-1);
});

appEventEmitter.on('knownError',data=>{
    app.STATE = 'error';

    const outErr = {code:'_UNKNOWN_',message:'Unknown'}
    if(err.message in KnownErrors ){
        outErr.code = err.message;
        outErr.message = KnownErrors[outErr.code];
    }
    sendError({error:outErr})

    process.exit(-1);


})




appEventEmitter.on('start',data=>{
    app.STATE = 'stared';
    appEventEmitter.emit('ready');
})
appEventEmitter.on('ready',data=>{
    app.STATE = 'ready';
    const opReturnGetter = TheOpReturnGetter()
    opReturnGetter.fetch_op_returns('00000000000c0311be97e9097cb0e43c8f9af94ec30774ca9e93064b813ccbdb');
    // x.process_block_id('My very own block id');
    // appEventEmitter.emit('teardown');
});

appEventEmitter.on('teardown',data=>{
    app.STATE = 'teardown';
    appEventEmitter.emit('finish');
});


appEventEmitter.on('finish',data=>{
    send("App finished")
    send("\n")
    //send(JSON.stringify(data));
    process.exit(0);
})



`
lost track here -
supoosed to be 1 - hit wonder - no database connection or maintain state 
just read data from bitcoind - return formated bitcoind
because it will use 'events' to send final product - ???
import events?

no tear down - no set-up 
just do -> return
 or do->error
`
class TheOpReturnGetter { 
    constructor(){
        this._blockIDs = [];


        this.bitcoinClient = new Client({ 
            host: 'localhost', 
            network: "testnet", 
            username: 'terary',
            password: 'NEhvMh_8LEoQp4dt9iG_eBXdxLKiXPUtZub1gcs6Tco=',
            headers: true
        });
    

    }
    fetch_op_returns(block_id){
        this._blockIDs.push(block_id);
        this._doWork();
        // this.push(block_id)
    }
    _doWork(){
        const block_id = this._blockIDs.pop();
        //fetch_block(bloc_id);
        // ********************************
        this.bitcoinClient.getBlock('00000000000c0311be97e9097cb0e43c8f9af94ec30774ca9e93064b813ccbdb')
        .then((blockWrapper) => { 
            const blk =   blockWrapper [0];  // verify this will always be 0 position
            console.log(`Have ${blk.tx.length} transactions`);
            const batch = [
                {method: 'getrawtransaction', parameters: ['aac7bc55aef90ac0e14b224dfaa4fbb0f1f6e8fd006a2f54facf31813a99eda4'] },
                {method: 'getrawtransaction', parameters: ['39277904ff6a065b6d257ccbda17a99ef8dcd41ef1866ab957edc45416373ea9',true] },
                {method: 'getrawtransaction', parameters: ['0d0ff6f4c627a4c3ce3b2e0bab7687674f325cf88fb6b6b2a087eb7e085439af'] },
                {method: 'getrawtransaction', parameters: ['ea7accb7f6384d34a732232755fcfdf4933a328095997aa7fe3e702dc6f435b6'] }
            ];
            const batchTx = blk.tx.map(t=>{
                return {method:'getrawtransaction', parameters: [t, AS_JSON] }
            })
            batchTx.push({method: 'getrawtransaction', parameters: ['9ea55bb90186b49ddab3c1d192fa1c0d911c8300de6cc7fcf8db8570898a27aa', true] });
    
            
            
            client.command(batchTx).then((responses) => {
                const ops = responses[0].map(trans=>{
                    // https://bitcoin.stackexchange.com/questions/29554/explanation-of-what-an-op-return-transaction-looks-like
                    // an example of OP_RETURN being in trans.vout[0]
                    if(! trans.vout[1] ) {
                        return 'NO_OP_RETURN';
                    }
                    if( trans.vout[1].scriptPubKey.asm.indexOf('OP_RETURN') === -1 ) {
                        return 'NO_OP_RETURN';
                    }                    
                    return trans.vout[1].scriptPubKey.asm;
                })  
                console.log(ops);
                // responses[0][154].vout[1].scriptPubKey.asm
                // console.log(responses)
            } ).catch(e=>{
                console.log('error:', e)
            });
    
    
        }).catch((e) => { 
            console.log(e) 
        });        
        // ********************************


    }

    
} 



appEventEmitter.emit('start');

