'use strict';

// Deterministic JSON.stringify()
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class storageELRContract extends Contract {

    async InitLedger(ctx) {
        console.log("<==Instantiated StorageELR Chaincode==>");
    }

    async addELR(ctx, hmac, sigma, hash_val, course_id) {
        const elr = {
            sigma: sigma,
            hash_val: hash_val,
            course_id: course_id,
        }
        await ctx.stub.putState(hmac, Buffer.from(JSON.stringify(elr)))
        return 1;
    }

    async queryELR(ctx, sigma, course_id) {
        let final_elrs = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        try {
            while (true) {
                let result = await iterator.next();

                if (result.value) {
                    let record;
                    try {
                        record = JSON.parse(result.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        record = strValue;
                    }
                    if (record.sigma == sigma && record.course_id == course_id) final_elrs.push(record);
                }

                if (result.done) {
                    await iterator.close();
                    return final_elrs;
                }
            }
        } catch (err) {
            console.log(err);
        }

        return "ELR not found!";
    }

    async getAllELRs(ctx, sigma) {
        const iterator = await ctx.stub.getStateByRange('', '');
        let final_elrs = [];

        try {
            while (true) {
                let result = await iterator.next();

                if (result.value) {
                    let record;
                    try {
                        record = JSON.parse(result.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        record = strValue;
                    }
                    if (record.sigma == sigma && record.course_id > 0) final_elrs.push(record);
                }

                if (result.done) {
                    await iterator.close();

                    return final_elrs;
                }
            }
        } catch (err) {
            console.log(err);
        }

        return "ELR not found!";
    }
}

class registerEntitiesContract extends Contract {

    async InitLedger(ctx) {
        console.log("<==Instantiated RegisterEntities Chaincode==>");
    }

    async updateRegistrationInformation(ctx, curr_id, new_id, encrypted_details, pubK, expiryTime) {

        const registrationExisting = await ctx.stub.getState(curr_id)
        if (registrationExisting && registrationExisting.length > 0) {
            await ctx.stub.deleteState(curr_id)
        }

        const details = {
            sigma: new_id,
            encrypted_details: encrypted_details,
            owner_key: pubK,
            expiryTime: expiryTime,
        }

        await ctx.stub.putState(new_id, Buffer.from(JSON.stringify(details)))
        return 1;

    }

    async queryRegistrations(ctx, user_id) {
        try {
            const registrationExisting = await ctx.stub.getState(user_id)
            if (registrationExisting && registrationExisting.length > 0) {
                let record = JSON.parse(registrationExisting);
                if (record.sigma == user_id)
                    return record;
            }
        } catch (err) {
            console.log(err);
        }

        return 0;
    }

    async removeRegistration(ctx, curr_id) {

        const registrationExisting = await ctx.stub.getState(curr_id)
        if (registrationExisting && registrationExisting.length > 0) {
            await ctx.stub.deleteState(curr_id)
        }

        return 1;
    }

}

module.exports.storageELRContract = storageELRContract;
module.exports.registerEntitiesContract = registerEntitiesContract;
