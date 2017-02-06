const test = require('ava')

const { exec } = require('child_process')
const path = require('path')

test.cb('generates VAPID keys', t => {
  const genKeysPath = path.join(__dirname, '../generateKeys.js')
  exec(`node ${genKeysPath}`, (err, stdout, stderr) => {
    if (err) return t.end(err)

    const [pub, priv] = stdout.split('\n')
    const [pubEnv, pubKey] = pub.split('=')
    const [privEnv, privKey] = priv.split('=')

    t.is(pubEnv, 'VAPID_PUBLIC_KEY')
    t.is(pubKey.length, 87)
    t.truthy(pubKey.match(/^[A-Za-z0-9-_]+$/))

    t.is(privEnv, 'VAPID_PRIVATE_KEY')
    t.is(privKey.length, 43)
    t.truthy(privKey.match(/^[A-Za-z0-9-_]+$/))

    t.end()
  })
})
