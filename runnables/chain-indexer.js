"use strict";

const { Pool, Client } = require('pg')
const configs = require('../config/');
const SQLStatements = require('../dev/sql-statements');
const Queries = SQLStatements.queries;
const SQLExec = SQLStatements.exec;
const pool = new Pool(configs.psql);
const BLOCKCHAIN_HEIGHT_CHECK_INTERVAL = 1000 * 60 *  15;
// const BLOCKCHAIN_HEIGHT_CHECK_INTERVAL =5000 ;
const MINIMUM_BLOCK_INDEX = 1000000
// let CURRENT_INDEXED_BLOCK_HEIGHT = 1383956
// const BLOCKCHAIN_HEIGHT =1584263;//  CURRENT_BLOCK_HEIGHT + 1000;

const discardDbResponse = (err,response)=>{}

  
const bitcoinInterface = require('../src/bitcoin/op-return-getter')(configs.bitcoinClient);
const IndexerLoop = require('../src/bitcoin/indexer-loop');



/// IndexerLoop.setIndexes(BLOCKCHAIN_HEIGHT, CURRENT_INDEXED_BLOCK_HEIGHT);


IndexerLoop.worker.setWorkFunction((currentBlockHeight,  blockchainHeight)=>{ //  blockChainHeight doesn't belong?
    console.log(`\t\tWorker starting on block: ${currentBlockHeight}`)
    bitcoinInterface.getBlockHash( currentBlockHeight)
})

bitcoinInterface.on('opReturnFetchComplete', (data)=> {
    // console.log(data);
    const {blockHeight, blockHash,totalTrans} = data;
    const indexLog  = {
        blockheight: blockHeight,
        blockhash: '\\x' + blockHash ,
        transCount: totalTrans,
        opReturnCount: data.opReturns.length
    }
    const query = Queries.insertOpReturnIndexLog(indexLog) 
    SQLExec.queryWithCallback(pool,query,discardDbResponse );

    const opReturnRecords = data.opReturns.map(tx=>{
        return {
            blockheight:blockHeight,
            blockhash: '\\x' + blockHash,
            transhash: '\\x' + tx.transHash,
            opreturn: '\\x' +   tx.OP_RETURN
        }; 
    }); 

    opReturnRecords.forEach(opRecord=>{
        const query = Queries.insertOpReturn(opRecord) 
        SQLExec.queryWithCallback(pool,query,discardDbResponse);
    
    });

    IndexerLoop.worker.finishedWork()
    IndexerLoop.worker.startWork();
    console.log(`Found: ${opReturnRecords.length} OP_RETURNS, blockheight: ${blockHeight}`);
})

bitcoinInterface.on('error', (err) => {
    console.log('parent  caught error', err);
})


const adjustChainHeights = function(){
    // lets get the party started.
    const daCounts = [];
    daCounts.push(SQLExec.queryAsPromised(pool,Queries.selectLastIndexedBlock()).then(r=>r.rows[0]['lastblockhieght'] ) );
    daCounts.push(bitcoinInterface.getBlockCount());
    Promise.all(daCounts)
    .then(counts =>{
        const blockchainHeight = Math.max(...counts);
        const dbBlockIndexHeight = Math.min(...counts) > MINIMUM_BLOCK_INDEX ? Math.min(...counts) : MINIMUM_BLOCK_INDEX;
        // if( dbBlockIndexHeight< 1000000){
        //     dbBlockIndexHeight = 1000000;
        // }
        if(IndexerLoop.worker.isInitialized){
            IndexerLoop.worker.adjustBlockchainHeight(blockchainHeight);
        } else {
            IndexerLoop.worker.initialize(dbBlockIndexHeight , blockchainHeight  );
        }
        console.log(`Adjusting chainHeights: ${counts} `)

          
        IndexerLoop.worker.startWork();

    }).catch(e=>{
        console.log(e)
    })

}

// IndexerLoop.initialize(fn,INTERVAL)
IndexerLoop.initialize( adjustChainHeights , BLOCKCHAIN_HEIGHT_CHECK_INTERVAL );


adjustChainHeights();

