'use strict';

const { Contract } = require('fabric-contract-api');

class storageELRContract extends Contract {

    async InitLedger(ctx){
        console.log("<==Instantiated StorageELR Chaincode==>");
    }

    async addELR(ctx, pubK, sigma, hash_val, store_cred, course_id ) {

        const elrExisting = await ctx.stub.getState(pubK)
        if (elrExisting && elrExisting.length > 0){
            console.log("This elr exists!");    
            return 0;
        }
        const elr = {
            sigma: sigma,
            hash_val: hash_val,
            store_cred: store_cred,
            course_id: course_id,
        }
        await ctx.stub.putState(pubK, Buffer.from(JSON.stringify(elr)))
        return 1;
 
    }

    async queryELR(ctx, sigma, course_id) {
  
        const iterator = await ctx.stub.getStateByRange('','');
        let result = await iterator.next();
        let found = false;
        while (!found){
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue; 
            }
            if (record.sigma == sigma && record.course_id == course_id)  
                return record;
            
                result = await iterator.next();         
        }
     
        return "ELR not found!";
    }
}

class registerEntitiesContract extends Contract {

    async InitLedger(ctx){
        console.log("<==Instantiated RegisterEntities Chaincode==>");
    }

    async updateRegistrationInformation(ctx, curr_id, new_id, encrypted_details, pubK, expiryTime ) {

        const registrationExisting = await ctx.stub.getState(curr_id)
        if (registrationExisting && registrationExisting.length > 0){
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
  
        const iterator = await ctx.stub.getStateByRange('','');
        let result = await iterator.next();
        let found = false;
        while (!found){
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue; 
            }
            if (record.sigma == user_id)  
                return record;
            
            result = await iterator.next();
        }
     
        return 0;
    }

    async removeRegistration(ctx, curr_id) {
  
        const registrationExisting = await ctx.stub.getState(curr_id)
        if (registrationExisting && registrationExisting.length > 0){
            await ctx.stub.deleteState(curr_id)
        }

        return 1;
    }
   
}

module.exports = storageELRContract;
// module.exports.registerEntitiesContract = registerEntitiesContract;