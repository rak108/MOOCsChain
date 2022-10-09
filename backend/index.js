'use strict';

const express = require('express');
const crypto = require('crypto')

const { create } = require('ipfs-http-client');
const axios = require('axios');

const ipfs = create('http://localhost:5001');
const app = express();

// const testContract = require('MOOCsChain/backend/chaincode');

app.use(express.json());

app.get('/', (req, res) => {
    return res.send('MOOCsChain Application');
});

app.post('/uploadElr', async (req, res) => {
    const data = req.body;
    console.log(data);
    const elrStoredHash = await uploadELR(data);
    return res.send(`Path: ${ elrStoredHash }`);
});

const uploadELR = async ({ hashValue, content }) => {
    const elr = { hashValue: hashValue, content: Buffer.from(content) };
    const elrAdded = await ipfs.add(elr);
    console.log(elrAdded['path']);
    return elrAdded['path'];
}

app.get('/retrieveElr', async (req, res) => {
    const data = req.query['elrHash'];
    const elrStoredContent = await retrieveELR(data);
    return res.send(elrStoredContent);
});

const retrieveELR = async (elrStoredHash) => {
    return await axios.get('https://gateway.ipfs.io/ipfs/' + elrStoredHash).then(res => {
        console.log(res.data);
        return res.data;
    }).catch(err => {
        console.log(err.message);
    });
}

app.listen(3000, () => {
    console.log('----Server is up and running on port 3000----');
});

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

const P = 11;
  
const registerEntity = async ( info ) => {
    const encryptedData = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(info)
      );
    
    sigma = encryptedData * P;
    const privKey = crypto.createHmac("sha256", (encryptedData | publicKey));
    PubKey = privKey * P;
    registrationTime = new Date().toISOString()
    // Call Blockchain
    return 1;
}

const saveELRs = async ({ sigma, PubKey, course_id, elrContent }) => {
    const encryptedData = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(elrContent)
      );
    
    const hashValue = crypto.createHmac("sha256", elrContent);

    const elrIPFS = uploadELR(hashValue, encryptedData);
    // Call Blockchain
    return 1;
}

const getELRs = async ({ sigma, course_id }) => {

    const hashValue = crypto.createHmac("sha256", elrContent);

    const elrIPFS = uploadELR(hashValue, encryptedData);
    // Call Blockchain
    return 1;
}

// module.exports.contracts = [ testContract ];