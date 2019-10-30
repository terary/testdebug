"use strict";

const KNOWN_ERRORS = {
    ECONNRESET : 'Likely misconfigured connection, wrong port, password, username etc.',
    FAILED_BT_OP_GETBLOCK: `Failed to getblock(..) likely misconfigured connnection; bad port, username, etc.`,
    FAILED_BT_OP_BATCH_GETRAWTRANSACTION : 'Failed to do batch getrawtransaction',
    FAILED_BT_OP_BATCH_GETRAWTRANSACTION_EXPECTED_ARRAY: 'Expected array of Transaction Hashes, got something different'
}
module.exports.KNOWN_ERRORS =KNOWN_ERRORS; 

class BtError extends Error{
    constructor(errorCode, originalError = {})  {
        super(errorCode + ' - ' + KNOWN_ERRORS[errorCode]);
        this.code = errorCode;
        this.originalError = {};
        this.originalError.code = originalError.code;
        this.originalError.message = originalError.message;
        this.originalError.stack = originalError.stack;
    }
    get isBtError() {return true;}
}

module.exports.BtError =BtError; 