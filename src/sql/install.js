"use strict";

/*
    The obvious.
    Definitions of database objects.
*/

const installSQL = (dbName,userName) =>{
return `
    DROP VIEW  IF EXISTS vwOpReturnsDecoded;    
    DROP TABLE IF EXISTS dictionary;
    DROP TABLE IF EXISTS opreturns;
    DROP TABLE IF EXISTS opReturnIndexLog; 
    -------------------- 

    CREATE  TABLE opreturns (
        blockheight BIGINT,  
        blockhash BYTEA,
        transhash BYTEA,
        opreturn BYTEA
        --, PRIMARY KEY ( blockhash, transhash)  -- production yes, dev no
    );
    -- CREATE INDEX ON opreturns (opreturn);
    -- GRANT ALL PRIVILEGES ON TABLE opreturns TO ${userName};

    CREATE  TABLE opReturnIndexLog (
        blockheight BIGINT PRIMARY KEY,
        blockhash BYTEA  ,
        transCount INT,
        opReturnCount INT
        --, PRIMARY KEY ( blockhash, transhash)  -- production yes, dev no
    );
    -- GRANT ALL PRIVILEGES ON TABLE opReturnIndexLog TO ${userName};
    
    -------------     
	CREATE TABLE dictionary (
		key VARCHAR(255) PRIMARY KEY,
		value VARCHAR(255),
		description  VARCHAR(255)
	);
   
   -----------------
   CREATE VIEW vwOpReturnsDecoded AS
    SELECT blockheight,  encode(blockhash, 'hex') as blockhash_hex,  encode(transhash, 'hex') as transhash_hex,  
    encode(opreturn, 'hex') as opreturn_hex, encode(opreturn, 'escape') as opreturn_escape
    FROM opreturns; 
    -----------------
	INSERT INTO dictionary (key, value, description) 
    VALUES ('APP_BIRTH_DATE',now(),'Sanity value ');
    ----------------
    INSERT INTO opreturns (blockheight, blockhash, transhash, opreturn)   
    VALUES( -1,  decode('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF','hex') ,  decode('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF','hex') , decode('Terary Awesome Opreturn', 'escape')) RETURNING *;

    `;
}

module.exports.installSQL  = installSQL; 