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
const Discussion = require('../models/discussions');
const Reply = require('../models/replies');

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

var privateKeyA = eccrypto.generatePrivate();
var publicKeyA = eccrypto.getPublic(privateKeyA);

async function initGateway() {

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

const uploadELR = async (elrTime, elrContent, courseID, sigma) => {
    const elr = { timestamp: elrTime, user_id: sigma, course_id: courseID, content: elrContent };
    const elrAdded = await ipfs.add(JSON.stringify(elr));
    return elrAdded['path'];
}

let gateway = undefined;

async function addElrInLedger(sigma, elr_Content, course_id) {
    let elr_Time = new Date().toISOString();
    const elrStoredHash = await uploadELR(elr_Time, elr_Content, course_id, sigma);
    console.log(`Path: ${elrStoredHash}`);

    let hmac = crypto.createHmac("sha256", sigma + course_id.toString() + elr_Content, 'base64');
    hmac.update('0');
    let Hmac = hmac.digest('base64');

    try {
        if (gateway == undefined) gateway = await initGateway();

        const network = await gateway.getNetwork(channelName);
        const storageELRContract = network.getContract(chaincodeName, 'storageELRContract');

        console.log('------------Storage ELR Contract----------')
        console.log('\n--> Evaluate Transaction: InitLedger, function initializes the ledger');
        await storageELRContract.evaluateTransaction('InitLedger');
        console.log('<==Instantiated StorageELR Chaincode==>');


        console.log('\n--> Submit Transaction: addELR, creates ELR of user in course with new_id, IPFS ELR hash value, course_id');
        result = await storageELRContract.submitTransaction('addELR', Hmac, sigma, elrStoredHash, course_id);
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


        console.log('\n--> Evaluate Transaction: queryELR, retrives all ELRs of user (sigma) in course, course_id');
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

async function queryAllELRsInLedger(sigma) {
    try {
        if (gateway == undefined) gateway = await initGateway();

        const network = await gateway.getNetwork(channelName);
        const storageELRContract = network.getContract(chaincodeName, 'storageELRContract');

        console.log('------------Storage ELR Contract----------')
        console.log('\n--> Evaluate Transaction: InitLedger, function initializes the ledger');
        await storageELRContract.evaluateTransaction('InitLedger');
        console.log('<==Instantiated StorageELR Chaincode==>');


        console.log('\n--> Evaluate Transaction: queryAllELRs, retrives all ELRs of user (sigma) in any course');
        result = await storageELRContract.evaluateTransaction('getAllELRs', sigma);
        console.log('*** Result: committed');
        if (`${result}` !== '') {
            console.log(`*** Result: ${prettyJSONString(result)}`);
        }

        let elrs = JSON.parse(result);
        let course_ids_map = new Map();

        elrs.forEach((elr) => {
            let course_id = parseInt(elr.course_id);

            if (!course_ids_map.has(course_id)) {
                course_ids_map.set(course_id, 0);
            }
            else {
                course_ids_map.set(course_id, course_ids_map.get(course_id) + 1);
            }
        });

        return course_ids_map;

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    } 
}

exports.moocsHome = async (req, res) => {
    Course.find({}).then((all_courses, err) => {
        if (err) res.render("home", { title: "Home", alert: `Error! ${err}`, notice: null, courses: [], registered_course_ids: [] });
        else {
        queryAllELRsInLedger(req.sigma).then((result) => {
            res.render("home", { title: "Home", alert: null, notice: null, courses: all_courses, registered_course_ids: result });
        });
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
        if (err) res.render("course", { title: "Course", alert: `Error loading course details! ${err}`, notice: null, course: null, elrs: [], discussions: [], userSigma: req.sigma, replies: [] });
        else if (!course) res.render("course", { title: "Course", alert: "Course does not exist!", notice: null, course: null, elrs: [], discussions: [], userSigma: req.sigma, replies: [] });
        else {
            Discussion.find({ course_id: course._id }).then(async (discussions ,err) => {
                if (err) res.render("course", { title: "Course", alert: `Error loading course discussions! ${err}`, notice: null, course: null, elrs: [], discussions: [], userSigma: req.sigma, replies: [] });
                else {
                    let discussion_ids = discussions.map((disc) => { return disc._id });
                    replies = await Reply.find({ 'discussion_id': { $in: discussion_ids } });

                    queryElrInLedger(req.sigma, course_id).then((result) => {
                        res.render("course", { title: course.name, alert: null, notice: null, course: course, elrs: result, discussions: discussions, userSigma: req.sigma, replies: replies });
                    });
                }
            });
        }
    });
}
