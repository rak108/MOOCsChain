'use strict';

const storageELRContract = require('./lib/chaincode').storageELRContract;
const registerEntitiesContract = require('./lib/chaincode').registerEntitiesContract;

module.exports.storageELRContract = storageELRContract;
module.exports.registerEntitiesContract = registerEntitiesContract;
module.exports.contracts = [storageELRContract, registerEntitiesContract];
