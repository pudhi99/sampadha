const webPush = require('web-push');
const fs = require('fs');

const keys = webPush.generateVAPIDKeys();

// Read existing env.local
let envContent = fs.readFileSync('.env.local', 'utf8');

// Remove old VAPID entries if they exist
envContent = envContent.split('\n').filter(line => {
    return !line.includes('VAPID') && line.trim() !== '';
}).join('\n');

// Add new VAPID keys
const newEnvContent = `${envContent}

# PWA Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}
VAPID_SUBJECT=mailto:hello@sampadha.app
`;

fs.writeFileSync('.env.local', newEnvContent);
console.log('Updated .env.local with new VAPID keys');
console.log('Please restart the dev server for changes to take effect.');
