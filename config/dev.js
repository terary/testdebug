


"use strict"
/*
// CREATE DATABASE exodusiodb
// CREATE ROLE exodusioun;
// password: terary  (use \password command to set password (or encrypt))
// ALTER ROLE exodusioun WITH LOGIN;
// CREATE TABLE dictionary ( key VARCHAR(255) PRIMARY KEY NOT NULL, value VARCHAR(255) NOT NULL, description VARCHAR(255)  NOT NULL DEFAULT '');

config = {
  user?: string, // default process.env.PGUSER || process.env.USER
  password?: string, //default process.env.PGPASSWORD
  database?: string, // default process.env.PGDATABASE || process.env.USER
  port?: number, // default process.env.PGPORT
  connectionString?: string // e.g. postgres://user:password@host:5432/database
  ssl?: any, // passed directly to node.TLSSocket
  types?: any, // custom type parsers
  statement_timeout: number, // number of milliseconds before a query will time out default is no timeout
}

*/



const configs = {
    psql: {
        host: 'localhost',
        // host: undefined,
        database: 'exodusiodb',
        port: 5432,
        user: 'exodusioun',
        password: 'terary',
      },
    bitcoinClient : {
      host: 'localhost', 
      network: "testnet", 
      username: 'terary',
      password: 'NEhvMh_8LEoQp4dt9iG_eBXdxLKiXPUtZub1gcs6Tco=',
      //port:"18333",
      // headers: true
    }
    
}


module.exports = configs;

const x = 3;
