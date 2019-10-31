"use strict";
const timeLoopFn = ()=> {return 'hello';}
const timeLoopInterval = 1000; 

describe("Indexer-loop",()=>{
    test("(sanity) Should act like glorified setInterval", (done)=>{
        const IndexerLoop = require('../../src/bitcoin/indexer-loop');
        // IndexerLoop.initialize( adjustChainHeights , BLOCKCHAIN_HEIGHT_CHECK_INTERVAL );
        const timeLoopFn =function(){
            expect(1).toBe(1);
            done();
        }
        IndexerLoop.initialize( timeLoopFn , timeLoopInterval );
    });
})

describe("Indexer-loop worker",()=>{
    let IndexerLoop, workCounter, workFn;
    beforeEach(()=>{
        IndexerLoop = require('../../src/bitcoin/indexer-loop');
        workCounter = 0;
        workFn = function(){workCounter++};
        IndexerLoop.worker.setWorkFunction(workFn);
        
    })
    test("(sanity) Should do one increment of work", ()=>{
        IndexerLoop.worker.startWork();
        IndexerLoop.worker.finishedWork();
        expect(workCounter).toBe(1)
    });
    test("Should do one and only one increment of work", ()=>{
        IndexerLoop.worker.startWork();
        IndexerLoop.worker.startWork();
        IndexerLoop.worker.finishedWork();
        expect(workCounter).toBe(1)
    });
    test("Should do two increments of work one after the other (after finished is called)", ()=>{

        IndexerLoop.worker.startWork();
        IndexerLoop.worker.finishedWork();
        IndexerLoop.worker.startWork();
        expect(workCounter).toBe(2)
    });
    test("Calling working 'initialize' has no effect ", ()=>{
        const dbBlockHeight = 3;
        const blockchainHeight = 3;

        const dbBlockHeight2 = 7;
        const blockchainHeight2= 7;

        IndexerLoop.worker.initialize(dbBlockHeight, blockchainHeight);
        expect(IndexerLoop.worker._blockHeights.blockchainHeight ).toBe(blockchainHeight);
        expect(IndexerLoop.worker._blockHeights.currentIndex ).toBe(dbBlockHeight);

        IndexerLoop.worker.initialize(dbBlockHeight2, blockchainHeight2);
        expect(IndexerLoop.worker._blockHeights.blockchainHeight ).toBe(blockchainHeight);
        expect(IndexerLoop.worker._blockHeights.currentIndex ).toBe(dbBlockHeight);

        expect(IndexerLoop.worker._blockHeights.blockchainHeight ).not.toBe(blockchainHeight2);
        expect(IndexerLoop.worker._blockHeights.currentIndex ).not.toBe(dbBlockHeight2);

    });

    test("#adjustBlockchainHeight will set internal blockChain height ", ()=>{
        const dbBlockHeight = 3;
        const blockchainHeight = 3;
        const blockchainHeight2= 7;

        IndexerLoop.worker.initialize(dbBlockHeight, blockchainHeight);
        expect(IndexerLoop.worker._blockHeights.blockchainHeight ).toBe(blockchainHeight);

        IndexerLoop.worker.adjustBlockchainHeight(blockchainHeight2)
        expect(IndexerLoop.worker._blockHeights.blockchainHeight ).toBe(blockchainHeight2);

    });
    test("#internal worker ", ()=>{
        // const doWorkSpy = jest.spyOn(IndexerLoop.worker, '_doWork')

        IndexerLoop.worker.adjustBlockchainHeight(IndexerLoop.worker._blockHeights.currentIndex - 1)
        IndexerLoop.worker.finishedWork();
        IndexerLoop.worker.startWork();
        IndexerLoop.worker.isIdle();

        expect(IndexerLoop.worker.isIdle()).toBe(true);
    });

    test("# _setState - should be undetermined if attempting to set state to unknown state ", ()=>{

        expect(IndexerLoop.worker._setState('IDLE')).toBe('IDLE');
        expect(IndexerLoop.worker._setState('NON STATE')).toBe('undetermined');
        IndexerLoop.worker._setState('IDLE')
    });

    
})

// --------------------------------------------------------------------

// "use strict";

// const { Pool, Client } = require('pg')
// const configs = require('../config/');
// const SQLStatements = require('../src/sql/sql-statements');
// const Queries = SQLStatements.queries;
// const SQLExec = SQLStatements.exec;
// const pool = new Pool(configs.psql);

// const BLOCKCHAIN_HEIGHT_CHECK_INTERVAL = configs.thisApp.blockchainHeightCheckInterval;
// //const BLOCKCHAIN_HEIGHT_CHECK_INTERVAL = 1000 * 60 *  15;
// // const BLOCKCHAIN_HEIGHT_CHECK_INTERVAL =5000 ;

// const MINIMUM_BLOCK_INDEX =configs.thisApp.minBlockHeight  // 1000000
// const discardDbResponse = (err,response)=>{}

  
// const bitcoinInterface = require('../src/bitcoin/op-return-getter')(configs.bitcoinClient);
// const IndexerLoop = require('../src/bitcoin/indexer-loop');




// IndexerLoop.worker.setWorkFunction((currentBlockHeight,  blockchainHeight)=>{ //  blockChainHeight doesn't belong?
//     console.log(`\t\tWorker starting on block: ${currentBlockHeight}`)
//     bitcoinInterface.processBlockByHeight( currentBlockHeight)
// })

// bitcoinInterface.on('opReturnFetchComplete', (data)=> {
//     // console.log(data);
//     const {blockHeight, blockHash,totalTrans} = data;
//     const indexLog  = {
//         blockheight: blockHeight,
//         blockhash: '\\x' + blockHash ,
//         transCount: totalTrans,
//         opReturnCount: data.opReturns.length
//     }
//     const query = Queries.insertOpReturnIndexLog(indexLog) 
//     SQLExec.queryWithCallback(pool,query,discardDbResponse );

//     const opReturnRecords = data.opReturns.map(tx=>{
//         return {
//             blockheight:blockHeight,
//             blockhash: '\\x' + blockHash,
//             transhash: '\\x' + tx.transHash,
//             opreturn: '\\x' +   tx.OP_RETURN
//         }; 
//     }); 

//     opReturnRecords.forEach(opRecord=>{
//         const query = Queries.insertOpReturn(opRecord) 
//         SQLExec.queryWithCallback(pool,query,discardDbResponse);
    
//     });

//     IndexerLoop.worker.finishedWork()
//     IndexerLoop.worker.startWork();
//     console.log(`Found: ${opReturnRecords.length} OP_RETURNS, blockheight: ${blockHeight}`);
// })

// bitcoinInterface.on('error', (err) => {
//     console.log('parent  caught error', err);
// })


// const adjustChainHeights = function(){
//     // lets get the party started.
//     const daCounts = [];
//     daCounts.push(SQLExec.queryAsPromised(pool,Queries.selectLastIndexedBlock()).then(r=>r.rows[0]['lastblockhieght'] ) );
//     daCounts.push(bitcoinInterface.getBlockCountAsPromised());
//     Promise.all(daCounts)
//     .then(counts =>{
//         const blockchainHeight = Math.max(...counts);
//         const dbBlockIndexHeight = Math.min(...counts) > MINIMUM_BLOCK_INDEX ? Math.min(...counts) : MINIMUM_BLOCK_INDEX;
//         // if( dbBlockIndexHeight< 1000000){
//         //     dbBlockIndexHeight = 1000000;
//         // }
//         if(IndexerLoop.worker.isInitialized){
//             IndexerLoop.worker.adjustBlockchainHeight(blockchainHeight);
//         } else {
//             IndexerLoop.worker.initialize(dbBlockIndexHeight , blockchainHeight  );
//         }
//         console.log(`Adjusting chainHeights: ${counts} `)

          
//         IndexerLoop.worker.startWork();

//     }).catch(e=>{
//         console.log(e)
//     })

// }

// // IndexerLoop.initialize(fn,INTERVAL)
// IndexerLoop.initialize( adjustChainHeights , BLOCKCHAIN_HEIGHT_CHECK_INTERVAL );


// adjustChainHeights();

