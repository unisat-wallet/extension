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
  const file = './node_modules/bitcoinjs-lib/src/payments/p2tr.js';
  let fileData = fs.readFileSync(file).toString();
  fileData = fileData.replace(
    'signature: types_1.typeforce.maybe(types_1.typeforce.BufferN(64))',
    'signature: types_1.typeforce.maybe(types_1.typeforce.Buffer)'
  );
  fs.writeFileSync(file, fileData);
};

const fixBufferError = () => {
  const file = './node_modules/bitcore-lib/lib/crypto/signature.js';
  let fileData = fs.readFileSync(file).toString();
  fileData = fileData.replace(
    `var Signature = function Signature(r, s) {
  if (!(this instanceof Signature)) {
    return new Signature(r, s);
  }
  if (r instanceof BN) {
    this.set({
      r: r,
      s: s
    });
  } else if (r) {
    var obj = r;
    this.set(obj);
  }
};`,
    `var Signature = function Signature(r, s) {
  if (!(this instanceof Signature)) {
    return new Signature(r, s);
  }
  if (r instanceof BN) {
    this.set({
      r: r,
      s: s
    });
  } else if (r) {
    var obj = r;
    this.set(obj);
  }

  this.r = BN.fromString(this.r.toString(16), 16)
  this.s = BN.fromString(this.s.toString(16),16)
};`
  );
  fs.writeFileSync(file, fileData);
};

const fixWalletSdkError = () => {
  const file = './node_modules/@unisat/wallet-sdk/lib/bitcoin-core.js';
  let fileData = fs.readFileSync(file).toString();
  fileData = `"use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ecc = exports.bitcoin = exports.ECPair = void 0;
  
  const bitcoin = require("bitcoinjs-lib");
  const ecpair = require("ecpair");
  
  let eccPromise;
  try {
    // Attempt to import tiny-secp256k1
    eccPromise = import("tiny-secp256k1");
  } catch (error) {
    // If import fails, fallback to a synchronous import
    eccPromise = Promise.resolve(require("tiny-secp256k1"));
  }
  
  eccPromise.then((ecc) => {
    exports.bitcoin = bitcoin;
    exports.ecc = ecc;
    exports.ECPair = ecpair.default(ecc); // use .default if available, otherwise use the module directly
    bitcoin.initEccLib(ecc);
  });
  `;
  fs.writeFileSync(file, fileData);
};

const fixBitcoinjsPsbt = () => {
  try {
    const file = './node_modules/bitcoinjs-lib/src/psbt.js';
    let fileData = fs.readFileSync(file).toString();

    fileData = fileData.replace(
      "checkScriptForPubkey(pSig.pubkey, script, 'verify');",
      "// checkScriptForPubkey(pSig.pubkey, script, 'verify');"
    );

    fileData = fileData.replace(
      "checkScriptForPubkey(pubkey, script, 'sign');",
      "// checkScriptForPubkey(pubkey, script, 'sign');"
    );

    fileData = fileData.replace(
      '.filter(tapLeaf => (0, psbtutils_1.pubkeyInScript)(pubkey, tapLeaf.script))',
      '// .filter(tapLeaf => (0, psbtutils_1.pubkeyInScript)(pubkey, tapLeaf.script))'
    );

    fs.writeFileSync(file, fileData);
    console.log('Applied bitcoinjs-lib psbt.js patches');
  } catch (e) {
    console.error('Failed to apply bitcoinjs-lib psbt.js patches:', e.message);
  }
};

const run = async () => {
  let success = true;
  try {
    fixWindowError();
    fixWindowError2();
    fixWindowError3();
    fixBufferError();
    fixWalletSdkError();
    fixBitcoinjsPsbt();
  } catch (e) {
    console.error('error:', e.message);
    success = false;
  } finally {
    console.log('Fix modules result: ', success ? 'success' : 'failed');
  }
};

run();
