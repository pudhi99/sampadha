const webPush = require('web-push');
const fs = require('fs');

const keys = webPush.generateVAPIDKeys();

const content = `PUBLIC_KEY=${keys.publicKey}
PRIVATE_KEY=${keys.privateKey}`;

fs.writeFileSync('vapid-keys.txt', content);
console.log('Keys written to vapid-keys.txt');
console.log('Public:', keys.publicKey);
console.log('Private:', keys.privateKey);
