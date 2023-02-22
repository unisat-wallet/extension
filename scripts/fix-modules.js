const fs = require('fs');
const fixWindowError = () => {
  const file = './node_modules/bitcore-lib/lib/crypto/random.js';
  let fileData = fs.readFileSync(file).toString();
  fileData = fileData.replace(
    `Random.getRandomBufferBrowser = function(size) {
  if (!window.crypto && !window.msCrypto)
    throw new Error('window.crypto not available');

  if (window.crypto && window.crypto.getRandomValues)
    var crypto = window.crypto;
  else if (window.msCrypto && window.msCrypto.getRandomValues) //internet explorer
    var crypto = window.msCrypto;
  else
    throw new Error('window.crypto.getRandomValues not available');

  var bbuf = new Uint8Array(size);
  crypto.getRandomValues(bbuf);
  var buf = Buffer.from(bbuf);

  return buf;
};`,
    `Random.getRandomBufferBrowser = function(size) {
  var bbuf = new Uint8Array(size);
  crypto.getRandomValues(bbuf);
  var buf = Buffer.from(bbuf);

  return buf;
};`
  );
  fs.writeFileSync(file, fileData);
};

const fixWindowError2 = () => {
  const file = './node_modules/tiny-secp256k1/lib/rand.browser.js';
  let fileData = fs.readFileSync(file).toString();
  fileData = fileData.replace('window.crypto', 'crypto');
  fs.writeFileSync(file, fileData);
};

const fixWindowError3 = () => {
  const file = './node_modules/bitcoinjs-lib/src/psbt.js';
  let fileData = fs.readFileSync(file).toString();
  fileData = fileData.replace('__UNSAFE_SIGN_NONSEGWIT: false', '__UNSAFE_SIGN_NONSEGWIT: true');
  fs.writeFileSync(file, fileData);
};
const run = async () => {
  let success = true;
  try {
    fixWindowError();
    fixWindowError2();
    fixWindowError3();
  } catch (e) {
    console.error('error:', e.message);
    success = false;
  } finally {
    console.log('Fix modules result: ', success ? 'success' : 'failed');
  }
};

run();
