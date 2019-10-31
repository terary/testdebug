"use strict";

const configs = require('../../config')
const bitcoinConfig = Object.assign({},configs.bitcoinClient);
const opReturnGetter = require('../../src/bitcoin/op-return-getter')(bitcoinConfig);
const rawTransTestData = require('../data/raw-transactions').rawTransactions;

describe('TheOpReturnGetter', () => {
    const expectedKeys = ['blockHeight', 'blockHash', 'opReturns', 'totalTrans'];
    beforeEach(()=>{
        opReturnGetter.removeAllListeners('opReturnFetchComplete')  
    })
    test("Should be Singleton of 'TheOpReturnGetter' ", () => {
        expect(opReturnGetter.constructor.name).toBe('OpReturnGetter') 
    });
    test("Sanity check - this is what it looks like when all goes well",  (done ) => {
        opReturnGetter.on('opReturnFetchComplete',function(data){
            //expect(Object.keys(data)).arrayContaining(expectedKeys);
            expect(Object.keys(data)).toEqual(
                expect.arrayContaining(expectedKeys),
              );
            done();
        })
        opReturnGetter.processBlockByHash('00000000000c0311be97e9097cb0e43c8f9af94ec30774ca9e93064b813ccbdb');
    });
    describe('_fetchRawTransactions',()=>{
        test.skip('Should not cause error if given bad parameters ', (done) => {
            opReturnGetter.on('opReturnFetchComplete',function(data){
                const props = Object.keys(data);
                expect(props).toEqual(
                    expect.arrayContaining(expectedKeys),
                  );
                done();
            })
            opReturnGetter._fetchRawTransactions()
        });
        test.todo(' - Stress different args - bad trans id, no blockhash etc,  testing not done because of time constraints');
    })
    describe('error conditions', ( ) =>{ 
        let badConfigs;
        beforeEach( ()=>{
            badConfigs = Object.assign({},configs.bitcoinClient);
        })
        test(`Should emit error with code 'FAILED_BT_OP_GETBLOCK' when connected wrong port (originalCode= 'ECONNRESET')`, (done) => { 
            badConfigs.port = '18333';
            const badGetter = require('../../src/bitcoin/op-return-getter')(badConfigs);
            badGetter.on('error', err => {
                console.log("This is an Error");
                expect(err.code).toBe('FAILED_BT_OP_GETBLOCK');
                expect(err.originalError.code).toBe('ECONNRESET');
                done()
            });
            badGetter.processBlockByHash('00000000000c0311be97e9097cb0e43c8f9af94ec30774ca9e93064b813ccbdb');
        });
        test(`Should emit error with code 'FAILED_BT_OP_GETBLOCK' when connected wrong username (originalCode= 401) `, (done) => { 
            badConfigs.username = '18333';
            const badGetter = require('../../src/bitcoin/op-return-getter')(badConfigs);
            badGetter.on('error', err => {
                console.log("This is an Error");
                expect(err.code).toBe('FAILED_BT_OP_GETBLOCK');
                expect(err.originalError.code).toEqual(401);
                done()
            });
            badGetter.processBlockByHash('00000000000c0311be97e9097cb0e43c8f9af94ec30774ca9e93064b813ccbdb');
        });
        test(`Should emit error with code 'FAILED_BT_OP_GETBLOCK' when submitted bad block hash `, (done) => { 
            const badGetter = require('../../src/bitcoin/op-return-getter')(badConfigs);
            
            badGetter.on('error', err => {
                console.log("This is an Error");
                expect(err.code).toBe('FAILED_BT_OP_GETBLOCK');
                done()
            });
            badGetter.processBlockByHash('NOT_REAL_BLOCK_HASH');
        });
        test(`Should emit error with code 'FAILED_BT_OP_BATCH_GETRAWTRANSACTION' when calling _fetchRawTransactions `, (done) => { 
            //
            const badGetter = require('../../src/bitcoin/op-return-getter')(badConfigs);
            const privateTestsFunctions = badGetter.privateTestFunctions;
            badGetter.on('opReturnFetchComplete',function(data){
                const props = Object.keys(data);
                expect(props).toEqual(
                    expect.arrayContaining(expectedKeys),
                  );
                done();
            })
           badGetter.on('error', err => {
                console.log("This is an Error");
                expect(err.code).toBe('FAILED_BT_OP_BATCH_GETRAWTRANSACTION');
                done()
            });
            //privateTestFunctions.fetchRawTransactions
            privateTestsFunctions.fetchRawTransactions.call(badGetter,'NOT_REAL_BLOCK_HASH','NOT_REAL_BLOCK_HEIGHT',  ['NOT_REAL_TX_HASH'])
        });
        test(`Should emit error with code 'FAILED_BT_OP_BATCH_GETRAWTRANSACTION' when calling _fetchRawTransactions `, (done) => { 
            //
            const badGetter = require('../../src/bitcoin/op-return-getter')(badConfigs);
            const privateTestsFunctions = badGetter.privateTestFunctions;
           badGetter.on('error', err => {
                expect(err.code).toBe('FAILED_BT_OP_BATCH_GETRAWTRANSACTION_EXPECTED_ARRAY');
                done()
            });
            //privateTestFunctions.fetchRawTransactions
            privateTestsFunctions.fetchRawTransactions.call(badGetter,'NOT_REAL_BLOCK_HASH','NOT_REAL_BLOCK_HEIGHT',  'NOT_REAL_TX_HASH')
        });
        test(`Should emit error with code 'FAILED_BT_OP_BATCH_GETRAWTRANSACTION' when calling _fetchRawTransactions `, (done) => { 
            const badTxHash = '9ea55bb90186b49ddab3c1d192fa1c0d911c8300de6cc7fcf8db8570898a27a'
            const badGetter = require('../../src/bitcoin/op-return-getter')(badConfigs);
            const privateTestsFunctions = badGetter.privateTestFunctions;
           badGetter.on('error', err => {
                expect(err.code).toBe("FAILED_BT_OP_BATCH_GETRAWTRANSACTION");
                done()
            });
            //privateTestFunctions.fetchRawTransactions
            privateTestsFunctions.fetchRawTransactions.call(badGetter,'NOT_REAL_BLOCK_HASH','NOT_REAL_BLOCK_HEIGHT', [ badTxHash])
        });


        

    })
    describe('transToOpReturn', () => {
        test(`Should find in any vout position #1`, () => {
            const expectedOpReturn = "00007ef90002d6fd40ea98dcdfb778828790c15871ac99037a955dec18133fa3d43b30b8eaa3721e5f1994055bd7afc40a48a4e95db5ba470405f5e15ee6a9ccaefe9f1def97e3b8b2fd70ac171c8ec8";
            const privateTestsFunctions = opReturnGetter.privateTestFunctions;
            const opReturns = privateTestsFunctions.transToOpReturn(rawTransTestData.opReturnPos0);
            expect(opReturns.OP_RETURN).toBe(expectedOpReturn);
        })
        test(`Should find in any vout position #1`, () => {
            const expectedOpReturn = "aa21a9edf27ff9095c0c36e0141a32dc503640ac1bf3e06c83ba0f94a4ceed9c0da4c5d7";
            const privateTestsFunctions = opReturnGetter.privateTestFunctions;
            const opReturns = privateTestsFunctions.transToOpReturn(rawTransTestData.opReturnPos1);
            expect(opReturns.OP_RETURN).toBe(expectedOpReturn);
        })
        test(`Should return 'undefined' if op OP_RETURN found`, () => {
            const expectedOpReturn = undefined;
            const privateTestsFunctions = opReturnGetter.privateTestFunctions;
            const opReturns = privateTestsFunctions.transToOpReturn(rawTransTestData.noOpReturn);
            expect(opReturns.OP_RETURN).toBeUndefined()
        })

    })


})


