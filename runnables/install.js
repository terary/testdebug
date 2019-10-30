"use strict"

const configs = require('../config/');
const { Pool } = require('pg')
const SQL = require('../src/sql/install');
// const Queries = SQLStatements.queries;
// const SQLExec = SQLStatements.exec;
const pool = new Pool(configs.psql);

const buildTablesSQL = SQL.installSQL(configs.psql.database,configs.psql.user);

pool.query(buildTablesSQL)
.then(response=>{
    console.log('Built tables and things');
    pool.end();
}).catch( e => {
    console.log(e)
})




