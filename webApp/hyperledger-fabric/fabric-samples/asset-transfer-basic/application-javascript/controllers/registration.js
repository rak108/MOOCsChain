const User = require("../models/users");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const gway = require('../index')
const eccrypto = require("eccrypto");

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

let gateway = undefined;

async function registerUserinLedger(sigma, encryptedData, PubKey, registrationTime) {
    try {   
            if (gateway == undefined){
            gateway = await initGateway();
            }
            
            console.log(sigma, encryptedData, PubKey, registrationTime);

            const network = await gateway.getNetwork(channelName);
            const registerEntitiesContract = network.getContract(chaincodeName, 'registerEntitiesContract');

            console.log('------------Register Entitities Contract----------')
            console.log('\n--> Submit Transaction: InitLedger, function initializes the ledger');
            await registerEntitiesContract.evaluateTransaction('InitLedger');
            console.log('<==Instantiated RegisterEntities Chaincode==>');

            console.log('\n--> Evaluate Transaction: queryRegistrations, function returns an ELR with a given sigma value in a course');
            result = await registerEntitiesContract.evaluateTransaction('queryRegistrations', sigma);
            console.log(`*** Result: ${(result)}`);

            if (`${result}` !== '') {
                return 0;
            }

            console.log('\n--> Submit Transaction: updateRegistrationInformation, creates/updates registration information with curr_id, new_id, encrypted_details, pubK, expiryTime arguments');
            result = await registerEntitiesContract.submitTransaction('updateRegistrationInformation', '', sigma, encryptedData, PubKey, registrationTime);
            console.log('*** Result: committed');
            if (`${result}` !== '') {
                console.log(`*** Result: ${prettyJSONString(result)}`);
            }

            return 1;

        } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

async function loginUserinLedger(sigma) {
    try {   
            if (gateway == undefined){
            gateway = await initGateway();
            }
            
            const network = await gateway.getNetwork(channelName);

            const registerEntitiesContract = network.getContract(chaincodeName, 'registerEntitiesContract');

            console.log('------------Register Entitities Contract----------')
            console.log('\n--> Submit Transaction: InitLedger, function initializes the ledger');
            await registerEntitiesContract.evaluateTransaction('InitLedger');
            console.log('<==Instantiated RegisterEntities Chaincode==>');

            console.log('\n--> Evaluate Transaction: queryRegistrations, function returns an ELR with a given sigma value in a course');
            result = await registerEntitiesContract.evaluateTransaction('queryRegistrations', sigma);
            console.log(`*** Result: ${(result)}`);    

            return result;

        } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}


function generateAccessToken(sigma) {
    return jwt.sign(sigma, "MYSECRET", { expiresIn: '1d' });
}

exports.getLogin = (req, res) => {
    res.render("login", { title: "Login" });
}

exports.getRegister = (req, res) => {
    res.clearCookie("moocs");
    res.render("register", { title: "Register" });
}

exports.postLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.name;

    let info = { email: email, password: password };

    console.log(info);

    let hmac = crypto.createHmac("sha256", Buffer.from(JSON.stringify(info), 'base64'));
    hmac.update('0');
    let sigma = hmac.digest('base64');

    console.log(sigma)


    isUser = await loginUserinLedger(sigma);

    if(isUser) {
        let token = generateAccessToken({ moocs: sigma });
        res.cookie('moocs', token, { maxAge: 60000 }).redirect("/lms/");
    }
    else {
        res.render("login", { title: "Error!" });
    }
}

exports.postRegister = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.name;

    let info = { email: email, password: password };

    console.log("hi",info);

    encInfo = { email: email, password: password, name: username };

    const encryptedData = await eccrypto.encrypt(publicKeyA, Buffer.from(encInfo.toString()))

    let encPriv = encryptedData.toString("base64");
    let hmac = crypto.createHmac("sha256", Buffer.from(JSON.stringify(info), 'base64'));
    hmac.update('0');
    let sigma = hmac.digest('base64');
    console.log(sigma);
    PubKey = encPriv + sigma;
    registrationTime = new Date().toISOString();

    registeredUser = await registerUserinLedger(sigma, encryptedData.toString(), PubKey, registrationTime);

    if(registeredUser != 0) {
        let token = generateAccessToken({ moocs: sigma });
        res.cookie('moocs', token, { maxAge: 60000 }).redirect("/lms/");
    }
    else {
        res.render("register", { title: "Error! User already exists!" });
    }
}