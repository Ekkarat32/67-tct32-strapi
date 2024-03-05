const crypto = require('crypto');

module.exports = {
    async beforeCreate(data) {
        const salt = generateSalt();
        data.params.data.mobile = encryptWithSalt(data.params.data.mobile, salt);
        console.log('before Create is worked!!!', data.params.data);
    },
    async afterCreate(data) {
        // ดึง salt จากข้อมูลที่ถูกเข้ารหัสแล้วใน beforeCreate หรือ beforeUpdate
        const encryptedData = data.params.data.mobile;
        const salt = getSaltFromEncryptedData(encryptedData);
        // ถอดรหัสข้อมูลที่ถูกเข้ารหัสแล้วใน beforeCreate หรือ beforeUpdate
        data.params.data.mobile = decrypt(encryptedData, salt);
        console.log('after Create is worked!!!', data.params.data);
    }
};

// ฟังก์ชันเข้ารหัสข้อมูลเป็น MD5 โดยใช้ "salt" เพื่อเพิ่มความปลอดภัย
const encryptWithSalt = (data, salt) => {
    const hash = crypto.createHash('md5');
    hash.update(data + salt);
    return hash.digest('hex'); // ผลลัพธ์เป็นสตริงฐาน 16 (hexadecimal) ที่มีความยาว 32 ตัวอักษร
}

// ฟังก์ชันสร้าง "salt" สำหรับการเข้ารหัส
const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex'); // ในกรณีนี้เราใช้ขนาด "salt" เป็น 16 ไบต์ (32 ตัวอักษร hex)
}

// ฟังก์ชันในการดึง salt จากข้อมูลที่ถูกเข้ารหัสแล้ว
const getSaltFromEncryptedData = (encryptedData) => {
    // ในกรณีนี้เราสมมติว่า salt จะอยู่หลังข้อมูลที่ถูกเข้ารหัส
    return encryptedData.slice(-32);
}


// ฟังก์ชันถอดรหัสข้อมูล MD5
const decrypt = (hashedValue, salt) => {
    // ตัดค่า salt ออกจากข้อมูลที่ถูกเข้ารหัสแล้ว
    const hashedData = hashedValue.slice(0, 32); // แก้ไขให้ตัดเฉพาะ hash ออกมา
    // นำค่า salt มาต่อท้ายข้อมูลที่ถูกเข้ารหัสแล้ว
    const dataWithSalt = hashedData + salt;
    // นำข้อมูลที่ถูกเข้ารหัสแล้วกับ salt มาถอดรหัส
    const hash = crypto.createHash('md5');
    hash.update(dataWithSalt);
    return hash.digest('hex'); // ให้คืนค่าเป็นรหัสที่ถอดรหัสแล้วและเป็นข้อความปกติ
}