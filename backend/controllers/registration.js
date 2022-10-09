const User = require("../models/users");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
});

const P = 11;

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
    // const username = req.body.name;

    let info = { email: email, password: password };

    const encryptedData = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(JSON.stringify(info))
    );
    
    /**
     * TODO: Fix below
     * 
     * let sigma = encryptedData * P;
     */

    let sigma = encryptedData.toString("base64");

    // TODO: Call Blockchain

    // TODO: Check if sigma exists in Blockchain
    if(true) {
        // TODO: Put below two lines into a common function
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
    // const username = req.body.name;

    let info = { email: email, password: password };

    const encryptedData = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(JSON.stringify(info))
    );
    
    /**
     * TODO: Fix everything below
     * 
     * sigma = encryptedData * P;
     * const privKey = crypto.createHmac("sha256", (encryptedData | publicKey));
     * PubKey = privKey * P;
     * registrationTime = new Date().toISOString();
     */

    let sigma = encryptedData.toString("base64");
    const privKey = crypto.createHmac("sha256", (encryptedData));
    PubKey = privKey + sigma;
    registrationTime = new Date().toISOString();

    // TODO: Call Blockchain

    // TODO: Replace with validation -> if registration successful, then login and redirect to home page
    if(true) {
        // TODO: Login logic - set cookie
        let token = generateAccessToken({ moocs: sigma });
        res.cookie('moocs', token, { maxAge: 60000 }).redirect("/lms/");
    }
    else {
        res.render("register", { title: "Error!" });
    }
}