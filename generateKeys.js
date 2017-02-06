#!/usr/bin/env node
const webPush = require('web-push')

const keys = webPush.generateVAPIDKeys()

console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
