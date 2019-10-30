
const installSQL = (dbName,userName) =>{
return `
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
   

	INSERT INTO dictionary (key, value, description) 
	VALUES ('APP_BIRTH_DATE',now(),'Sanity value ');

    `;
}

module.exports.installSQL  = installSQL; 