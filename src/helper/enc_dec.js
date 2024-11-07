const bcrypt = require("bcrypt");
const crypto = require("crypto");
const saltRounds = 10; // Number of salt rounds (higher is slower but more secure)

class EncryptDecrypt { }
EncryptDecrypt.hash_password = async (password) => {
    const hashedpassword = await bcrypt.hash(password, saltRounds);
    return hashedpassword;
};

EncryptDecrypt.compare_passwords = async (plainpassword, hashedpassword) => {
    const isMatch = await bcrypt.compare(plainpassword, hashedpassword);
    return isMatch;
};

EncryptDecrypt.encryptData = async (data, key, iv) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}

EncryptDecrypt.decryptData = async (encryptedData, key, iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}

module.exports = EncryptDecrypt;
