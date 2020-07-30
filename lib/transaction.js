"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var crypto = _interopRequireWildcard(require("./crypto/"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Transaction
 * @param {String} param.account_number
 * @param {String} param.chain_id
 * @param {Object} param.fee
 * @param {String} param.memo
 * @param {Object} param.msg
 * @param {String} param.sequence
 */
var Transaction = /*#__PURE__*/function () {
  function Transaction(param) {
    _classCallCheck(this, Transaction);

    this.account_number = param.account_number;
    this.chain_id = param.chain_id;
    this.fee = param.fee;
    this.msgs = param.msg;
    this.memo = param.memo;
    this.sequence = param.sequence;
  }
  /**
   * @param {string} privateKeyHex
   * @param {Object} msg
   * @return {Transaction}
   **/


  _createClass(Transaction, [{
    key: "sign",
    value: function sign(privateKeyHex, msg) {
      var signMsg = {
        "account_number": this.account_number.toString(),
        "chain_id": this.chain_id,
        "fee": this.fee,
        "memo": this.memo,
        "msgs": msg,
        "sequence": this.sequence.toString()
      };
      console.log("signmsg: ", JSON.stringify(signMsg));
      var jsonStr = JSON.stringify(signMsg);
      var signBytes = Buffer.from(jsonStr);
      var privateKey = Buffer.from(privateKeyHex, "hex");
      var signature = crypto.sign(signBytes.toString("hex"), privateKey);
      var pubKey = crypto.encodePubKeyToCompressedBuffer(crypto.getPubKeyFromPrivateKey(privateKey));
      this.signatures = [{
        pub_key: {
          type: "tendermint/PubKeySecp256k1",
          value: pubKey
        },
        signature: signature
      }];
      return this;
    }
    /**
     * @param {string} mode
     * @return {Object}
     */

  }, {
    key: "serializeTransactionWithJson",
    value: function serializeTransactionWithJson(mode) {
      if (!this.signatures) {
        throw new Error("null signature");
      }

      var stdTx = {
        msg: this.msgs,
        signatures: this.signatures,
        memo: this.memo,
        fee: this.fee
      };
      stdTx.signatures = stdTx.signatures.map(function (item) {
        item.pub_key.value = item.pub_key.value.toString("base64");
        item.signature = item.signature.toString("base64");
        return item;
      });
      return JSON.stringify({
        tx: stdTx,
        mode: mode
      });
    }
  }]);

  return Transaction;
}();

var _default = Transaction;
exports["default"] = _default;