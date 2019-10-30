"use strict";
const isTest = __dirname.indexOf('/mypart/tmc/tmp/verify-git') !== -1;
const isDev= __dirname.indexOf('/mypart/tmc/clients/exodus.io/psql-deps-final') !== -1;
const isDeploy = !isTest && !isDev ;

if(isTest ){
  console.log(`'Running with 'test' configs`)
  module.exports  =require('./test');
} else if (isDev) {
  console.log(`'Running with 'dev' configs`)
  module.exports  =require('./dev');
}else {
  console.log(`'Running with 'deploy' configs`)
  module.exports  =require('./deploy');
}
