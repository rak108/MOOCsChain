const crypto = require('crypto');
const eccrypto = require("eccrypto");

const { create } = require('ipfs-http-client');
const ipfs = create('http://localhost:5001');
const axios = require('axios');

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

const Course = require('../models/courses');

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

const uploadELR = async (elrTime, elrContent, courseID) => {
    const elr = { timestamp: elrTime, content: elrContent, course_id: courseID };
    const elrAdded = await ipfs.add(JSON.stringify(elr));
    console.log(elrAdded['path']);
    return elrAdded['path'];
}

let gateway = undefined;

async function addElrInLedger(sigma, elr_Content, course_id) {
    let elr_Time = new Date().toISOString();
    const elrStoredHash = await uploadELR(elr_Time, elr_Content, course_id);
    console.log(`Path: ${ elrStoredHash }`);

    let hmac = crypto.createHmac("sha256", sigma + elr_Content + course_id.toString(), 'base64');
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

            let allRequests = JSON.parse(result).map((res) => { return axios.get(`http://localhost:8080/ipfs/${res.hash_val}`) });

            return axios.all(allRequests).then(axios.spread((...responses) => {
                return responses.map((res) => { return res.data });
            }));

        } catch (error) {
            console.error(`******** FAILED to run the application: ${error}`);
        }
}

function queryAllELRsInLedger(sigma) {
    // TODO: Call the blockchain contract
    return [];
}

exports.moocsHome = async (req, res) => {
    Course.find({}).then((all_courses, err) => {
        if(err) res.render("home", { title: "Home", alert: `Error! ${err}`, notice: null, courses: [], registered_course_ids: [] });
        else {
            let courseIds = queryAllELRsInLedger(req.sigma);
            res.render("home", { title: "Home", alert: null, notice: null, courses: all_courses, registered_course_ids: courseIds });
        }
    });
}

exports.uploadElrToLedger = async (req, res) => {
    let course_id = req.body.course_id;

    addElrInLedger(req.sigma, req.body.content, course_id).then(() => {
        res.redirect(`/lms/course/${course_id}`);
    });
}

exports.retrieveELR = async (req, res) => {
    let course_id = req.params.course_id;

    Course.findOne({ id: parseInt(course_id) }).then(async (course, err) => {
        if(err) res.render("course", { title: "Course", alert: `Error loading course details! ${err}`, notice: null, course: null, elrs: [] });
        else if(!course) res.render("course", { title: "Course", alert: "Course does not exist!", notice: null, course: null, elrs: [] });
        else {
            queryElrInLedger(req.sigma, course_id).then((result) => {
                res.render("course", { title: course.name, alert: null, notice: null, course: course, elrs: result });
            });
        }
    });    
}
