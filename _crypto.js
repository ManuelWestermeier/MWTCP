const { log } = require("console");
const { generateKeyPairSync, publicEncrypt, privateDecrypt, privateEncrypt } = require("crypto");

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
    },
})


var data = "Heil Hitler";

var enc = publicEncrypt(publicKey, data)

log(enc.toString("binary"))

var dec = privateEncrypt(privateKey, enc.toString("binary"))

log(dec.toString("utf-8"))