"use strict";
const minutes = 60 * 1000;


const configs = {
    psql: {
        host: 'localhost',
        // host: undefined,
        database: 'exodterarydb',
        port: 5432,
        user: 'exodterary',
        password: 'terary',
      },
    bitcoinClient : {
      host: 'localhost', 
      network: "testnet", 
      username: 'terary',
      password: 'NEhvMh_8LEoQp4dt9iG_eBXdxLKiXPUtZub1gcs6Tco='
      //port:"18333",
      // headers: true
    },
    thisApp: {
      minBlockHeight:1000000,
      blockchainHeightCheckInterval: 1 * minutes
    }
    
}


module.exports = configs;
