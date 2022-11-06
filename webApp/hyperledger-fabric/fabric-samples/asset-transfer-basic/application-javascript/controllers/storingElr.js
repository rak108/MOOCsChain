const crypto = require('crypto');
const eccrypto = require("eccrypto");

const { create } = require('ipfs-http-client');
const ipfs = create('http://localhost:5001');

const P = 11;

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';


function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

var privateKeyA = eccrypto.generatePrivate();
var publicKeyA = eccrypto.getPublic(privateKeyA);

async function initGateway(){

        const ccp = buildCCPOrg1();

        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

        const wallet = await buildWallet(Wallets, walletPath);

        await enrollAdmin(caClient, wallet, mspOrg1);

        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

        const gateway = new Gateway();

        try {
            await gateway.connect(ccp, {
                wallet,
                identity: org1UserId,
                discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
            });
        return gateway;
        } catch (error) {
        console.error(`Error in connecting to gateway for Org1: ${error}`);
        process.exit(1);
    }

}

const uploadELR = async (elrTime, content) => {
    const elr = { timestamp: Buffer.from(elrTime), content: Buffer.from(content) };
    const elrAdded = await ipfs.add(elr);
    console.log(elrAdded['path']);
    return elrAdded['path'];
}

const retrieveELR = async (elrStoredHash) => {
    return await axios.get('https://gateway.ipfs.io/ipfs/' + elrStoredHash).then(res => {
        console.log(res.data);
        return res.data;
    }).catch(err => {
        console.log(err.message);
    });
}

let gateway = undefined;

async function addElrInLedger(sigma, elr_Content, course_id) {
    elr_Time = new Date().toISOString();
    const elrStoredHash = await uploadELR(elr_Content, elr_Time);
    console.log(`Path: ${ elrStoredHash }`);

    let hmac = crypto.createHmac("sha256", sigma + elr_Content, 'base64');
    hmac.update('0');

    try {   
            if (gateway == undefined) gateway = await initGateway();
            
            const network = await gateway.getNetwork(channelName);
            const storageELRContract = network.getContract(chaincodeName, 'storageELRContract');

            console.log('------------Storage ELR Contract----------')
            console.log('\n--> Evaluate Transaction: InitLedger, function initializes the ledger');
            await storageELRContract.evaluateTransaction('InitLedger');
            console.log('<==Instantiated StorageELR Chaincode==>');


            console.log('\n--> Submit Transaction: addELR, creates ELR of user in course with new_id, IPFS ELR hash value, course_id');
            result = await storageELRContract.submitTransaction('addELR', hmac, sigma, elrStoredHash, course_id);
            console.log('*** Result: committed');
            if (`${result}` !== '') {
                console.log(`*** Result: ${prettyJSONString(result)}`);
            }

            return 1;

        } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

async function queryElrInLedger(sigma, course_id) {

    try {   
            if (gateway == undefined) gateway = await initGateway();
            
            const network = await gateway.getNetwork(channelName);
            const storageELRContract = network.getContract(chaincodeName, 'storageELRContract');

            console.log('------------Storage ELR Contract----------')
            console.log('\n--> Evaluate Transaction: InitLedger, function initializes the ledger');
            await storageELRContract.evaluateTransaction('InitLedger');
            console.log('<==Instantiated StorageELR Chaincode==>');


            console.log('\n--> Submit Transaction: queryELR, retrives all ELRs of user in course with new_id, course_id');
            result = await storageELRContract.evaluateTransaction('queryELR', sigma, course_id);
            console.log('*** Result: committed');
            if (`${result}` !== '') {
                console.log(`*** Result: ${prettyJSONString(result)}`);
            }

            const elrStoredContent = await retrieveELR(result.hash_val);
            result.hash_val = elrStoredContent;
            return result;

        } catch (error) {
            console.error(`******** FAILED to run the application: ${error}`);
        }
}

exports.uploadElr = async (req, res) => {
    let course_id = 25; // TODO: Update hard-coded ID

    console.log('uploadELR (req.sigma) ===> ', req.sigma); // TODO: Remove

    addElrInLedger(req.sigma, req.body.content, course_id).then(() => {
        res.redirect("/lms/elr");
    });
}

exports.retrieveELR = async (req, res) => {
    let course_id = 25; // TODO: Update hard-coded ID
    queryElrInLedger(req.sigma, course_id).then((result) => {
        res.json({ 'elr': result });
    })
}


// function generateAccessToken(sigma) {
//     return jwt.sign(sigma, "MYSECRET", { expiresIn: '1d' });
// }

// exports.getLogin = (req, res) => {
//     res.render("login", { title: "Login" });
// }

// exports.getRegister = (req, res) => {
//     res.clearCookie("moocs");
//     res.render("register", { title: "Register" });
// }

// exports.postELR = async (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const username = req.body.name;

//     let info = { email: email, password: password };

//     let hmac = crypto.createHmac("sha256", Buffer.from(JSON.stringify(info), 'base64'));
//     hmac.update('0');
//     let sigma = hmac.digest('base64');


//     isUser = await loginUserinLedger(sigma);

//     if(isUser != 0) {
//         let token = generateAccessToken({ moocs: sigma });
//         res.cookie('moocs', token, { maxAge: 60000 }).redirect("/lms/");
//     }
//     else {
//         res.render("login", { title: "Error! Incorrect email or password" });
//     }
// }

// exports.postRegister = async (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const username = req.body.name;

//     let info = { email: email, password: password };

//     encInfo = { email: email, password: password, name: username };

//     const encryptedData = await eccrypto.encrypt(publicKeyA, Buffer.from(encInfo.toString()));

//     let encPriv = encryptedData.toString("base64");
//     let hmac = crypto.createHmac("sha256", Buffer.from(JSON.stringify(info), 'base64'));
//     hmac.update('0');
//     let sigma = hmac.digest('base64');
//     PubKey = encPriv + sigma;
//     registrationTime = new Date().toISOString();

//     registeredUser = await registerUserinLedger(sigma, encryptedData.toString(), PubKey, registrationTime);

//     if(registeredUser != 0) {
//         let token = generateAccessToken({ moocs: sigma });
//         res.cookie('moocs', token, { maxAge: 60000 }).redirect("/lms/");
//     }
//     else {
//         res.render("register", { title: "Error! User already exists!" });
//     }
// }