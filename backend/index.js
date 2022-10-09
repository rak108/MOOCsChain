'use strict';

const express = require('express');
const crypto = require('crypto');

const { create } = require('ipfs-http-client');
const axios = require('axios');

const ipfs = create('http://localhost:5001');
const app = express();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var session = require('express-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const testContract = require('MOOCsChain/backend/chaincode');

app.use(session({
    cookie: { maxAge: 60000 },
    keys: ["s3cr3tkey"],
    saveUninitialized: true,
    resave: "true",
    secret: "s3cr3tkey"
}));

const registrationRoutes = require("./routes/registration");
const moocsRoutes = require("./routes/moocs");

app.set("view engine", "ejs");
app.set("views", "views");

app.use("/", registrationRoutes);
app.use("/lms/", moocsRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/moocschain", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => {
        console.log(`---- Server is up and running on port ${PORT} ----`);
    });
}).catch(err => console.log(err));

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
