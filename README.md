### Install
**1.  Install required modules**
```bash
npm install
```

**2. Update Configs appropriately ( config/deploy.js )**

```json
    psql: {
        host: 'localhost',
        database: 'exodusiodb',
        port: 5432,
        user: 'exodusioun',
        password: 'terary',
      },
    bitcoinClient : {
      host: 'localhost', 
      network: "testnet", 
      username: 'terary',
      password: 'NEhvMh_8LEoQp4dt9iG_eBXdxLKiXPUtZub1gcs6Tco='
      //port:"18333",
      // headers: true
    },
    thisApp: {
      minBlockHeight:1000000,
      blockchainHeightCheckInterval: 15 * minutes
    }

```
**3  Run the database install script**
```bash
npm run indexer-install
```
**4 Run www (for endpoint)**
```bash
npm run www
```
Pre-installed block records can be seen
http://localhost:3000/opreturn/Terary%20Awesome%20Opreturn
http://localhost:3000/opreturnHex/54657261727920417765736f6d65204f7072657475726e



**5 Run indexer**
```bash
npm run indexer
```

