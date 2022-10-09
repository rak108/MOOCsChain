const express = require('express');
const { create } = require('ipfs-http-client');
const axios = require('axios');

const ipfs = create('http://localhost:5001');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    return res.send('MOOCsChain Application -> Current progress only IPFS');
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