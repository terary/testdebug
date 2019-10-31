"use strict";

/*
    SQL statements and pg helper functions.
*/


const assert = require('assert');
const fieldPosDictionary  = ['key', 'value', 'description'];

const queries = {}
const exec = {}

const separateKeyValue = (obj) => {
    const fieldNames =[], values=[];
    Object.entries(obj).forEach(( [key,value] )=>{
        fieldNames.push(key);
        values_x.push(value);
    });
    const positions = fieldNames.map((val, idx )=>{
        return '$' + (idx+1)
    })
    return {
        fieldNames,
        values,
        positions,
    }

}


const  updateQuery = (tableName, idFieldName, fieldNames, record ) =>{
    const fields = [];
    record_id =  record[idFieldName];
    delete record[idFieldName]; 
   const {fldNames, values, positions} = separateKeyValue(record);

    assert(record_id);

    fieldNames.forEach( (fname,i) => {
        if(fname in record) {
            fields.push(`${fname}=$${positions[i]}`);
        }
    });
    values.push(record_id)

    return {
        text: ` UPDATE ${tableName} SET ${fields.join(', ')} WHERE ${idFieldName} = $${values.length} RETURNING * `,
        values: values
    }    
}

const deleteQuery = (tableName, idFieldName,  idFieldValue ) => {
//    assert( ! Number.isNaN(Number(idFieldValue)));
    assert(idFieldValue);
    return {
        text: ` DELETE FROM ${tableName}  WHERE ${idFieldName} = $1 RETURNING * `,
        values: [idFieldValue]
    }    
}

queries.deleteDictionary = (record) => {
    return deleteQuery('dictionary','key', record['key']);
}

queries.selectLastIndexedBlock = () =>{
    return {
        text: ` SELECT MAX(blockheight) as lastblockhieght FROM opReturnIndexLog `
        // values: [idFieldValue]       
    }
}
queries.selectDictionaryByKey = ( record ) =>{
    return {
        text: ` SELECT *  FROM dictionary WHERE key = $1 ; `,
         values: [record['key']]       
    }
}


queries.selectOpReturn = ( record, decode = 'escape' ) =>{
    
    return {
        text: ` SELECT blockheight,  encode(blockhash, 'hex') as blockhash_hex,  
                    encode(transhash, 'hex') as transhash_hex,  
                    encode(opreturn, 'hex') as opreturn_hex, encode(opreturn, 'escape') as opreturn_escape 
                FROM opreturns WHERE opReturn = decode($1, '${decode}')  ; `,
         values: [record['opReturn']]       
    }
}



queries.updateDictionary = (record) => {
    return updateQuery('dictionary','key', fieldPosDictionary,record);
}

queries.insertDictionary = (dictionaryItem) => {
    const s = dictionaryItem;
    return {
        text: ' INSERT INTO dictionary (key, value, description)   VALUES( $1, $2, $3) RETURNING *',
        values: [s['key'], s['value'], s['description']]
      }    
}


queries.insertOpReturnIndexLog = (record) => {
    const r = record;
    return {
        text: ' INSERT INTO opReturnIndexLog (blockheight, blockhash,transCount, opReturnCount)   VALUES( $1, $2, $3, $4) ',
        values: [r['blockheight'], r['blockhash'], r['transCount'], r['opReturnCount'] ]
    }
}
queries.insertOpReturn = (record) => {
    const r = record;
    return {
        text: ' PERFORM insertOpreturns($1, $2, $3, $4)',
        values: [r['blockheight'], r['blockhash'], r['transhash'], r['opreturn'] ]
      }
}
queries.insertOpReturn_old = (record) => {
    const r = record;
    return {
        text: ' INSERT INTO opreturnsX (blockheight, blockhash, transhash, opreturn)   VALUES( $1, $2, $3, $4) RETURNING *',
        values: [r['blockheight'], r['blockhash'], r['transhash'], r['opreturn'] ]
      }
}

const defaultCallBack  = (err, result) => {
    if (err) {
      console.log('Error:',err);
    } //handle error
    else {
      console.log('row 0:', result)
    }
}

  
exec.queryWithCallback = (client, query, cb=defaultCallBack) => {
    client.query(query  , cb);
}

exec.queryAsPromised = (client, query) =>{
    return client.query(query );
}



module.exports.queries = queries;
module.exports.exec = exec;