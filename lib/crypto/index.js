"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sha256 = exports.sha256Ripemd160 = exports.getPrivateKeyFromMnemonic = exports.validateMnemonic = exports.generateMnemonic = exports.getPrivateKeyFromKeyStore = exports.generateKeyStore = exports.validateSig = exports.sign = exports.getAddressFromPrivateKey = exports.getAddressFromPubKey = exports.getPubKeyFromPrivateKey = exports.getPubKeyHexFromPrivateKey = exports.encodePubKeyToCompressedBuffer = exports.getPubKeyFromHex = exports.generatePrivateKey = exports.encodeAddressToBech32 = exports.validateAddress = exports.decodeAddressToBuffer = void 0;

var _secureRandom = _interopRequireDefault(require("secure-random"));

var _bech = _interopRequireDefault(require("bech32"));

var _cryptoBrowserify = _interopRequireDefault(require("crypto-browserify"));

var _uuid = _interopRequireDefault(require("uuid"));

var _lodash = _interopRequireDefault(require("lodash"));

var _bip = _interopRequireDefault(require("bip39"));

var _bip2 = _interopRequireDefault(require("bip32"));

var _elliptic = require("elliptic");

var _tinySecp256k = _interopRequireDefault(require("tiny-secp256k1"));

var _encHex = _interopRequireDefault(require("crypto-js/enc-hex"));

var _sha = _interopRequireDefault(require("crypto-js/sha256"));

var _ripemd = _interopRequireDefault(require("crypto-js/ripemd160"));

var _buffer = require("buffer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @module crypto
 */
// 浏览器端实现
var sync = require('./scrypt-sync');

var MNEMONIC_ENTROPY_LEN = 128;
var HD_PATH = "44'/996'/0'/0/0";
/**
 * Decode address from bech32 to buffer.
 * @param {string} addr bech32 format
 */

var decodeAddressToBuffer = function decodeAddressToBuffer(addr) {
  var decodedAddress = _bech["default"].decode(addr);

  return _buffer.Buffer.from(_bech["default"].fromWords(decodedAddress.words));
};
/**
 * Validate address.
 * @param {string} addr bech32 format
 * @return {boolean}
 */


exports.decodeAddressToBuffer = decodeAddressToBuffer;

var validateAddress = function validateAddress(addr) {
  try {
    var decodeAddress = _bech["default"].decode(addr);

    if (decodeAddress.prefix === "okchain") {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};
/**
 * Encodes address from hex to bech32 format.
 * @param {string} hexAddr address in hex string
 * @param {string} prefix address prefix
 * @return {string} address with bech32 format
 */


exports.validateAddress = validateAddress;

var encodeAddressToBech32 = function encodeAddressToBech32(hexAddr) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "okchain";

  var words = _bech["default"].toWords(_buffer.Buffer.from(hexAddr, "hex"));

  return _bech["default"].encode(prefix, words);
};
/**
 * Generates privateKey.
 * @param {number} len privateKey length (default: 32 bytes)
 * @return {string} privateKey hex string
 */


exports.encodeAddressToBech32 = encodeAddressToBech32;

var generatePrivateKey = function generatePrivateKey() {
  var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
  return _buffer.Buffer.from((0, _secureRandom["default"])(len)).toString("hex");
};
/**
 * Get publicKey from hex string.
 * @param {string} publicKey pubKey with hex string format
 * @return {Elliptic.PublicKey} pubKey
 */


exports.generatePrivateKey = generatePrivateKey;

var getPubKeyFromHex = function getPubKeyFromHex(publicKey) {
  var cure = new _elliptic.ec("secp256k1");
  var keyPair = cure.keyFromPublic(publicKey, "hex");
  return keyPair.getPublic();
};
/**
 * Encode pubKey to compressed pubKey buffer.
 * @param {Elliptic.PublicKey} pubKey
 * @return {Buffer}
 */


exports.getPubKeyFromHex = getPubKeyFromHex;

var encodePubKeyToCompressedBuffer = function encodePubKeyToCompressedBuffer(pubKey) {
  var prefix = 2;

  if (pubKey.y.isOdd()) {
    prefix = 3;
  }

  var pubBytes = _buffer.Buffer.concat([_buffer.Buffer.alloc(1, prefix), pubKey.x.toArrayLike(_buffer.Buffer, "be", 32)]);

  return pubBytes;
};
/**
 * Get public key from  private key.
 * @param {string} privateKeyHex the private key hex string
 * @return {string} public key in hex string
 */


exports.encodePubKeyToCompressedBuffer = encodePubKeyToCompressedBuffer;

var getPubKeyHexFromPrivateKey = function getPubKeyHexFromPrivateKey(privateKeyHex) {
  var curve = new _elliptic.ec("secp256k1");
  var keypair = curve.keyFromPrivate(privateKeyHex, "hex");

  var compressed = _buffer.Buffer.from(keypair.getPublic().encodeCompressed());

  return compressed.toString("hex");
};
/**
 * Get public key from  private key.
 * @param {Buffer} privateKey
 * @return {Elliptic.PublicKey} PubKey
 * */


exports.getPubKeyHexFromPrivateKey = getPubKeyHexFromPrivateKey;

var getPubKeyFromPrivateKey = function getPubKeyFromPrivateKey(privateKey) {
  var curve = new _elliptic.ec("secp256k1");
  var keypair = curve.keyFromPrivate(privateKey);
  return keypair.getPublic();
};
/**
 * Gets address from pubKey with hex format.
 * @param {string} publicKeyHex publicKey hexstring
 * @param {string} prefix address prefix
 * @return {string} address
 */


exports.getPubKeyFromPrivateKey = getPubKeyFromPrivateKey;

var getAddressFromPubKey = function getAddressFromPubKey(publicKeyHex, prefix) {
  var hash = sha256Ripemd160(publicKeyHex); // https://git.io/fAn8N

  var address = encodeAddressToBech32(hash, prefix);
  return address;
};
/**
 * Get address from private key.
 * @param {string} privateKeyHex the private key hexstring
 * @param {string} prefix address prefix
 * @return {string} address
 */


exports.getAddressFromPubKey = getAddressFromPubKey;

var getAddressFromPrivateKey = function getAddressFromPrivateKey(privateKeyHex, prefix) {
  return getAddressFromPubKey(getPubKeyHexFromPrivateKey(privateKeyHex), prefix);
};
/**
 * Sign msg with privateKey and Msg in hex format.
 * @param {string} msgHex msg in hex format.
 * @param {string} privateKey - The private key in hex format.
 * @return {Buffer} Signature.
 */


exports.getAddressFromPrivateKey = getAddressFromPrivateKey;

var sign = function sign(msgHex, privateKey) {
  var msgHash = sha256(msgHex);

  var msgHashHex = _buffer.Buffer.from(msgHash, "hex");

  var signature = _tinySecp256k["default"].sign(msgHashHex, _buffer.Buffer.from(privateKey, "hex")); // enc ignored if buffer


  return signature;
};
/**
 * Validate signature.
 * @param {string} sigHex signature in hex format
 * @param {string} msgHex msg in hex format.
 * @param {string} pubKeyHex public key in hex format
 * @return {boolean}
 */


exports.sign = sign;

var validateSig = function validateSig(sigHex, msgHex, pubKeyHex) {
  var publicKey = _buffer.Buffer.from(pubKeyHex, "hex");

  if (!_tinySecp256k["default"].isPoint(publicKey)) throw new Error("invalid pubKey");
  var msgHash = sha256(msgHex);

  var msgHashHex = _buffer.Buffer.from(msgHash, "hex");

  return _tinySecp256k["default"].verify(msgHashHex, publicKey, _buffer.Buffer.from(sigHex, "hex"));
};
/**
 * Generate KeyStore with privateKey and password.
 * @param {string} privateKeyHex
 * @param {string} password
 * @returns {object}
 */


exports.validateSig = validateSig;

var generateKeyStore = function generateKeyStore(privateKeyHex, password) {
  var salt = _cryptoBrowserify["default"].randomBytes(32);

  var iv = _cryptoBrowserify["default"].randomBytes(16);

  var cipherAlg = "aes-128-ctr";
  var kdf = "scrypt";
  var kdfparams = {
    dklen: 32,
    salt: salt.toString("hex"),
    n: 262144,
    p: 1,
    r: 8 //prf: "hmac-sha256"

  };
  var options = {
    N: kdfparams.n,
    r: kdfparams.r,
    p: kdfparams.p,
    maxmem: 1024 * 1024 * 1024 * 2
  };
  var derivedKey = sync(_buffer.Buffer.from(password), salt, kdfparams.dklen, options);

  var cipher = _cryptoBrowserify["default"].createCipheriv(cipherAlg, derivedKey.slice(0, 16), iv);

  if (!cipher) {
    throw new Error("createCipheriv has been failed");
  }

  var ciphertext = _buffer.Buffer.concat([cipher.update(_buffer.Buffer.from(privateKeyHex, "hex")), cipher["final"]()]);

  var bufferValue = _buffer.Buffer.concat([derivedKey.slice(16, 32), _buffer.Buffer.from(ciphertext, "hex")]);

  return {
    crypto: {
      ciphertext: ciphertext.toString("hex"),
      cipherparams: {
        iv: iv.toString("hex")
      },
      cipher: cipherAlg,
      kdf: kdf,
      kdfparams: kdfparams,
      mac: sha256(bufferValue.toString("hex"))
    },
    id: _uuid["default"].v4({
      random: _cryptoBrowserify["default"].randomBytes(16)
    }),
    version: 3
  };
};
/**
 * Get privateKey from keyStore.
 * @param {string | object} keystore
 * @param {string} password
 * @returns {string} privateKey
 */


exports.generateKeyStore = generateKeyStore;

var getPrivateKeyFromKeyStore = function getPrivateKeyFromKeyStore(keystore, password) {
  if (!_lodash["default"].isString(password)) {
    throw new Error("invalid password");
  }

  var json = _lodash["default"].isObject(keystore) ? keystore : JSON.parse(keystore);
  var kdfparams = json.crypto.kdfparams;
  var options = {
    N: kdfparams.n,
    r: kdfparams.r,
    p: kdfparams.p,
    maxmem: 1024 * 1024 * 1024 * 2
  };
  var derivedKey = sync(_buffer.Buffer.from(password), _buffer.Buffer.from(kdfparams.salt, "hex"), kdfparams.dklen, options);

  var ciphertext = _buffer.Buffer.from(json.crypto.ciphertext, "hex");

  var bufferValue = _buffer.Buffer.concat([derivedKey.slice(16, 32), ciphertext]);

  var mac = sha256(bufferValue.toString("hex"));

  if (mac !== json.crypto.mac) {
    throw new Error("invalid password");
  }

  var decipher = _cryptoBrowserify["default"].createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), _buffer.Buffer.from(json.crypto.cipherparams.iv, "hex"));

  var privateKey = _buffer.Buffer.concat([decipher.update(ciphertext), decipher["final"]()]).toString("hex");

  return privateKey;
};
/**
 * Generate mnemonic.
 * @return {string}
 */


exports.getPrivateKeyFromKeyStore = getPrivateKeyFromKeyStore;

var generateMnemonic = function generateMnemonic() {
  return _bip["default"].generateMnemonic(MNEMONIC_ENTROPY_LEN);
};
/**
 * Validate mnemonic.
 * @param {string} mnemonic.
 * @return {bool}
 */


exports.generateMnemonic = generateMnemonic;
var validateMnemonic = _bip["default"].validateMnemonic;
/**
 * Get private key from mnemonic.
 * @param {string} mnemonic
 * @return {string} hexstring
 */

exports.validateMnemonic = validateMnemonic;

var getPrivateKeyFromMnemonic = function getPrivateKeyFromMnemonic(mnemonic) {
  if (!_bip["default"].validateMnemonic(mnemonic)) {
    throw new Error("invalid mnemonic format");
  }

  var seed = _bip["default"].mnemonicToSeed(mnemonic);

  var master = _bip2["default"].fromSeed(seed);

  var child = master.derivePath(HD_PATH);
  return child.privateKey.toString("hex");
};
/**
 * Just like ripemd160(sha256(hex))
 * @param {string} hex
 * @returns {string} hash
 */


exports.getPrivateKeyFromMnemonic = getPrivateKeyFromMnemonic;

var sha256Ripemd160 = function sha256Ripemd160(hex) {
  if (typeof hex !== "string") throw new Error("invalid param, need hex string");
  if (hex.length % 2 !== 0) throw new Error("invalid hex string length: ".concat(hex));

  var hexEncoded = _encHex["default"].parse(hex);

  var ProgramSha256 = (0, _sha["default"])(hexEncoded);
  return (0, _ripemd["default"])(ProgramSha256).toString();
};
/**
 * SHA256.
 * @param {string} hex
 * @returns {string} hash
 */


exports.sha256Ripemd160 = sha256Ripemd160;

var sha256 = function sha256(hex) {
  if (typeof hex !== "string") throw new Error("invalid param,need hex string");
  if (hex.length % 2 !== 0) throw new Error("invalid hex string length: ".concat(hex));

  var hexEncoded = _encHex["default"].parse(hex);

  return (0, _sha["default"])(hexEncoded).toString();
};

exports.sha256 = sha256;