const crypto = require('crypto');
const md5 = require('md5');

const algorithm = 'aes-256-cbc';
console.log('process.env.SECRET_KEY', process.env.SECRET_KEY);
const key = Buffer.from(process.env.SECRET_KEY); // Should be a 32-byte key for aes-256
const iv = process.env.SECRET_IV; // Should be a 16-byte IV for aes-256-cbc


const encryptphoneNumber = (phoneNumber) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedphoneNumber = cipher.update(phoneNumber, 'utf8', 'hex');
  encryptedphoneNumber += cipher.final('hex');
 // Pad the encrypted phone number to ensure it's at least 128 characters long
  return encryptedphoneNumber;
};

const decryptphoneNumber = (encryptedphoneNumber) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let phoneNumber = decipher.update(encryptedphoneNumber, 'hex', 'utf8');
  phoneNumber += decipher.final('utf8');

  return phoneNumber;
};

module.exports = {
  async beforeCreate(event) {
    console.log('beforeCreate', event.params);
    event.params.data.phoneNumber = encryptphoneNumber(event.params.data.phoneNumber);
  },
  async beforeUpdate(event) {
    console.log('beforeUpdate', event.params.data);
    event.params.data.phoneNumber = encryptphoneNumber(event.params.data.phoneNumber);
  },
  async afterFindMany(event) {
    console.log('afterFindMany', event.result);
    event.result.forEach(item => {
      if (item.phoneNumber) {
        item.phoneNumber = decryptphoneNumber(item.phoneNumber);
        console.log('afterFindMany :', item.phoneNumber);
      }
    });
  },
  async afterFindOne(event) {
    console.log('afterFindOne', event.result);
    if (event.result && event.result.phoneNumber) {
      event.result.phoneNumber = decryptphoneNumber(event.result.phoneNumber);
      console.log('afterFindOne :', event.result.phoneNumber);
    }
  },
};