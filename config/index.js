"use strict";
const minutes = 60 * 1000;

const configs =    require('./dev');
const isDeployment  =true;

if(isDeployment ){
    configs.psql= {
        host: 'localhost',
        // host: undefined,
        database: 'exodterarydb',
        port: 5432,
        user: 'exodterary',
        password: 'terary',
      };
      configs.thisApp= {
        minBlockHeight:1000000,
        blockchainHeightCheckInterval: 1 * minutes
      };

}
module.exports  = configs;
// bash-4.2$ createuser exodterary --interactive --pwprompt
// Enter password for new role: 
// Enter it again: 
// Shall the new role be a superuser? (y/n) n
// Shall the new role be allowed to create databases? (y/n) y
// Shall the new role be allowed to create more new roles? (y/n) n
// Password: 
// -bash-4.2$ 
