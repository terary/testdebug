"use strict";
/**
 * Simple demonstration - server two endpoints.
 *      /opreturn/:opreturn   -> returns transaction data for given op_return
 *      /opreturn/:opreturn   -> returns transaction data for given op_return (hex)
 * 
 */

const { Pool  } = require('pg')
const configs = require('../config/');
const SQLStatements = require('./sql/sql-statements');
const Queries = SQLStatements.queries;
const SQLExec = SQLStatements.exec;
const pool = new Pool(configs.psql);
const express = require('express')
const theServer = express()

 const getOpReturn = function (req,res,next,encoding){
    const opRecord = {
        opReturn: req.params.opreturn
    }
    const query = Queries.selectOpReturn(opRecord,encoding); 
    SQLExec.queryAsPromised(pool,query)
    .then(r=>{
        res.send({rows: r.rows } );
    }).catch(e => {
        next(e)
    });
 }

theServer.get('/opreturn/:opreturn', function(res,req,next) {getOpReturn(res,req,next,'escape')} )
theServer.get('/opreturnHex/:opreturn', function(res,req,next) {getOpReturn(res,req,next,'hex')} )



module.exports = theServer; 
