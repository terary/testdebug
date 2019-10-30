"use strict";
// const minutes = 60 * 1000;

// const configs =    require('./dev');
const isTest = __dirname.indexOf('/mypart/tmc/tmp/verify-git') !== -1;
const isDev= __dirname.indexOf('/mypart/tmc/clients/exodus.io/psql-deps-final') !== -1;
const isDeploy = !isTest && !isDev ;
if(isTest ){
  console.log(`'Running with 'test' configs`)
  module.exports  =require('./test');
  // configs.psql= {
  //       host: 'localhost',
  //       // host: undefined,
  //       database: 'exodterarydb',
  //       port: 5432,
  //       user: 'exodterary',
  //       password: 'terary',
  //     };
  //     configs.thisApp= {
  //       minBlockHeight:1000000,
  //       blockchainHeightCheckInterval: 1 * minutes
  //     };

} else if (isDev) {
  console.log(`'Running with 'dev' configs`)
  module.exports  =require('./dev');
}else {
  console.log(`'Running with 'deploy' configs`)
  module.exports  =require('./deploy');
}
