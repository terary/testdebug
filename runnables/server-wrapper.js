"use strict";



const port = 3000;
const theServer = require('../src/server');


theServer.listen(port, () => console.log(`Example app listening on port ${port}!`))