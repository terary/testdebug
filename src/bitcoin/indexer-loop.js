
const WORKER_STATES = { 'IDLE': 'IDLE', 'IN_PROGRESS':'IN_PROGRESS'}
class IndexWorker {
    
    constructor(){
        this._state =  WORKER_STATES['IDLE'];
        this._workFunction = ()=>{};
        this._blockHeights = {
            currentIndex: undefined,
            blockchainHeight: undefined,
            __lastKnownDB: undefined, 
            finished: function() {
                return this.currentIndex>=this.blockchainHeight
            }
        } 
    }
    setWorkFunction(fn){
        this._workFunction=fn;
    }
    get isInitialized(){
        return this._isInitialized;
    }
//    this._worker.setIndexs(blockChainHeight, initialHieght)
    initialize(dbBlockHeight,blockchainHeight){
        if(! this.isInitialized) {
            this._blockHeights.blockchainHeight = blockchainHeight;
            this._blockHeights.currentIndex = dbBlockHeight; 
            this._isInitialized = true;
        }
    }
    adjustBlockchainHeight(blockchainHeight){
        this._blockHeights.blockchainHeight = blockchainHeight;
        // this._blockHeights.currentIndex = initialHieght||this._blockHeights.currentIndex;

    }
    isIdle(){
        return this._state ===  WORKER_STATES['IDLE']; 
    }
    _setState(state){
        this._state = WORKER_STATES[state] || 'undetermined' 
    }
    _doWork(){
        const self = this;
        // console.log('\t\tStarted Work');

        if(this._blockHeights.finished()){
            //console.log('\t\tNo more work to be done - staying idle');
            this._setState('IDLE');
        }else {
            this._workFunction(++this._blockHeights.currentIndex,this._blockHeights.blockchainHeight  )    
        }
    }
    finishedWork(){
        this._setState('IDLE');
    }
    startWork(){

        if(this.isIdle()){
            this._setState('IN_PROGRESS');
            this._doWork();            
        }else {
            console.log('\t\tWorking currently busy - ignoring  new work request')
        }
    }

}




class IndexerLoop {
    constructor(){
        this.INDEX_ADJUST_CLICK = 1000 * 60 * 10; // 10 minutes
        //this._intervalHanddle = this._nonce();
        this._worker = new IndexWorker();
        this._isInitialized = false;
        this._intervalHandle = undefined;
        this._interval = undefined; // choke if not initialized

        // let blockchainHeight = 15;
        // let dbLastIndexed = 3;
        // this._worker.setIndexes(blockchainHeight, dbLastIndexed)
    }
    // setIndexes(blockchaingHeight, dbLastIndexed) {
    //     this._worker.setIndexes(blockchaingHeight, dbLastIndexed);
    //     /// and doWork?
    // }
    // _nonce(){
    //     const self = this;
    //     return setInterval(function(){
    //         self.checkBlockHeight()
    //     },this.INDEX_ADJUST_CLICK);
    // }
    get worker(){
        return this._worker;
    }
    // startWork(){
    //     //console.log(`\tDo work little worker`)
    //     this._worker.startWork() ;
    // }
    // finishedWork(){
    //     //console.log(`\tAll done little worker`)
    //     this._worker.finishedWork() ;
    // }
    // setWorkFunction(fn){
    //     this._worker.setWorkFunction(fn);
    // }
    // setBlockHeightCheckFunction(fn){
    //     this._checkblockHeightFunction =fn;
    // }
    initialize(fn,interval) {
        if(!this._isInitialized) {
            // ------------------
            this._checkblockHeightFunction =fn;
            this._interval = interval
            const self = this;
            this._intervalHandle= setInterval(function(){
                self.checkBlockHeight()
            },this._interval);
            // ----------------------
            this._isInitialized = true;
        }
    }
    checkBlockHeight() {
        this._checkblockHeightFunction(this.setIndexes)
        // const self =this;
        // console.log('Checking Block height')
        // new Promise((resolve,reject)=>{
        //     setTimeout(function(){
        //         return resolve();
        //     },1750)
        // }).then( ()=>{
        //     const newHeight = self._worker._blockHeights.blockchainHeight + 3;
        //     self.adjustBlockHeights(newHeight)
        // }).catch(() => {
        //     // opps - just a model.
        // })


    }

    // adjustBlockHeights(blockchainHeight){
    //     this._worker.setIndexes(blockchainHeight)
    // }



}

module.exports = new IndexerLoop();