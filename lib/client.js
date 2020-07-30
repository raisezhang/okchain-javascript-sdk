"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OKChainClient = void 0;

var crypto = _interopRequireWildcard(require("./crypto"));

var _transaction = _interopRequireDefault(require("./transaction"));

var _httpProxy = _interopRequireDefault(require("./httpProxy"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var apiPath = {
  txs: "/okchain/v1/txs",
  queryAccount: "/okchain/v1/auth/accounts"
};
var bech32Head = "okchain"; // const mainnetChainId = ""

var testnetChainId = "okchain";

var getTransactionToken = function getTransactionToken(amount, denom) {
  return {
    amount: (0, _utils.formatNumber)(amount),
    denom: denom
  };
};
/**
 * The OKChain client.
 */


var OKChainClient = /*#__PURE__*/function () {
  /**
   * @param {String} url rpc url
   * @param {String} [chainId=okchain] chain id
   */
  function OKChainClient(url) {
    var chainId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : testnetChainId;

    _classCallCheck(this, OKChainClient);

    if (!url) {
      throw new Error("null url");
    }

    this.httpClient = new _httpProxy["default"](url);
    this.nativeDenom = chainId === testnetChainId ? "tokt" : "okt";
    this.defaultFee = {
      amount: [getTransactionToken(0.02, this.nativeDenom)],
      gas: "200000"
    };
    this.mode = "block";
    this.chainId = chainId;
  }
  /**
   * get an instance of OKChainClient
   * @param {String} privateKey private key
   * @param {String} url rpc url
   */


  _createClass(OKChainClient, [{
    key: "setMode",

    /**
     * set the mode when send transaction
     * @param {string} mode block|sync|async
     */
    value: function () {
      var _setMode = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(m) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.mode = m;

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function setMode(_x) {
        return _setMode.apply(this, arguments);
      }

      return setMode;
    }()
    /**
     * @param {string} privateKey
     * @return {OKChainClient}
     */

  }, {
    key: "setAccountInfo",
    value: function () {
      var _setAccountInfo = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(privateKey) {
        var address, data;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(privateKey !== this.privateKey)) {
                  _context2.next = 14;
                  break;
                }

                address = crypto.getAddressFromPrivateKey(privateKey, bech32Head);

                if (address) {
                  _context2.next = 4;
                  break;
                }

                throw new Error("invalid privateKey: " + privateKey);

              case 4:
                if (!(address === this.address)) {
                  _context2.next = 6;
                  break;
                }

                return _context2.abrupt("return", this);

              case 6:
                this.privateKey = privateKey;
                this.address = address;
                _context2.next = 10;
                return this.getAccount(address);

              case 10:
                data = _context2.sent;
                _context2.next = 13;
                return this.getAccountNumberFromAccountInfo(data);

              case 13:
                this.account_number = _context2.sent;

              case 14:
                return _context2.abrupt("return", this);

              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setAccountInfo(_x2) {
        return _setAccountInfo.apply(this, arguments);
      }

      return setAccountInfo;
    }()
    /**
     * Send SendTransaction.
     * @param {String} to To Address
     * @param {Number} amount Coin Quantity
     * @param {String} denom Coin Name
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendSendTransaction",
    value: function () {
      var _sendSendTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(to, amount, denom) {
        var memo,
            sequenceNumber,
            msg,
            signMsg,
            signedTx,
            res,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                memo = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : "";
                sequenceNumber = _args3.length > 4 && _args3[4] !== undefined ? _args3[4] : null;
                msg = [{
                  type: "okchain/token/MsgTransfer",
                  value: {
                    amount: [getTransactionToken(amount, denom)],
                    from_address: this.address,
                    to_address: to
                  }
                }];
                signMsg = msg;
                _context3.next = 6;
                return this.buildTransaction(msg, signMsg, memo, this.defaultFee, sequenceNumber);

              case 6:
                signedTx = _context3.sent;
                _context3.next = 9;
                return this.sendTransaction(signedTx);

              case 9:
                res = _context3.sent;
                return _context3.abrupt("return", res);

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function sendSendTransaction(_x3, _x4, _x5) {
        return _sendSendTransaction.apply(this, arguments);
      }

      return sendSendTransaction;
    }()
    /**
     * Send CancelOrderTransaction.
     * @param {String} orderId
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendCancelOrderTransaction",
    value: function () {
      var _sendCancelOrderTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(orderId) {
        var memo,
            sequenceNumber,
            orderIdList,
            _args4 = arguments;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                memo = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : "";
                sequenceNumber = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : null;
                orderIdList = [orderId];
                return _context4.abrupt("return", this.sendCancelOrdersTransaction(orderIdList, memo, sequenceNumber));

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function sendCancelOrderTransaction(_x6) {
        return _sendCancelOrderTransaction.apply(this, arguments);
      }

      return sendCancelOrderTransaction;
    }()
  }, {
    key: "sendCancelOrdersTransaction",
    value: function () {
      var _sendCancelOrdersTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(orderIdList) {
        var memo,
            sequenceNumber,
            msg,
            signMsg,
            signedTx,
            res,
            _args5 = arguments;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                memo = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : "";
                sequenceNumber = _args5.length > 2 && _args5[2] !== undefined ? _args5[2] : null;
                msg = [];
                signMsg = [];
                msg.push({
                  type: "okchain/order/MsgCancel",
                  value: {
                    order_ids: orderIdList,
                    sender: this.address
                  }
                });
                signMsg = msg;
                _context5.next = 8;
                return this.buildTransaction(msg, signMsg, memo, this.defaultFee, sequenceNumber);

              case 8:
                signedTx = _context5.sent;
                _context5.next = 11;
                return this.sendTransaction(signedTx);

              case 11:
                res = _context5.sent;
                return _context5.abrupt("return", res);

              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function sendCancelOrdersTransaction(_x7) {
        return _sendCancelOrdersTransaction.apply(this, arguments);
      }

      return sendCancelOrdersTransaction;
    }()
    /**
     * Send PlaceOrderTransaction.
     * @param {String} product
     * @param {String} side
     * @param {Number} price
     * @param {Number} quantity
     * @param {Number} memo
     * @param {Number} sequence
     * @return {Object} response
     */

  }, {
    key: "sendPlaceOrderTransaction",
    value: function () {
      var _sendPlaceOrderTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(product, side, price, quantity) {
        var memo,
            sequence,
            order_items,
            _args6 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                memo = _args6.length > 4 && _args6[4] !== undefined ? _args6[4] : "";
                sequence = _args6.length > 5 && _args6[5] !== undefined ? _args6[5] : null;
                order_items = [{
                  price: (0, _utils.formatNumber)(price),
                  product: product,
                  quantity: (0, _utils.formatNumber)(quantity),
                  side: side
                }];
                return _context6.abrupt("return", this.sendPlaceOrdersTransaction(order_items, memo, sequence));

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function sendPlaceOrderTransaction(_x8, _x9, _x10, _x11) {
        return _sendPlaceOrderTransaction.apply(this, arguments);
      }

      return sendPlaceOrderTransaction;
    }()
  }, {
    key: "sendPlaceOrdersTransaction",
    value: function () {
      var _sendPlaceOrdersTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(order_items) {
        var memo,
            sequence,
            placeOrderMsg,
            signMsg,
            signedTx,
            res,
            _args7 = arguments;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                memo = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : "";
                sequence = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : null;
                placeOrderMsg = [{
                  type: "okchain/order/MsgNew",
                  value: {
                    order_items: order_items,
                    sender: this.address
                  }
                }];
                signMsg = placeOrderMsg;
                _context7.next = 6;
                return this.buildTransaction(placeOrderMsg, signMsg, memo, this.defaultFee, sequence);

              case 6:
                signedTx = _context7.sent;
                _context7.next = 9;
                return this.sendTransaction(signedTx);

              case 9:
                res = _context7.sent;
                return _context7.abrupt("return", res);

              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function sendPlaceOrdersTransaction(_x12) {
        return _sendPlaceOrdersTransaction.apply(this, arguments);
      }

      return sendPlaceOrdersTransaction;
    }()
    /**
     * Build Transaction for sending to okchain.
     * @param {Object} msg
     * @param {Object} signMsg
     * @param {String} memo
     * @param {String} fee
     * @param {Number} sequenceNumber
     * @return {Transaction} Transaction object
     */

  }, {
    key: "buildTransaction",
    value: function () {
      var _buildTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(msg, signMsg) {
        var memo,
            fee,
            sequenceNumber,
            accountInfo,
            params,
            tx,
            _args8 = arguments;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                memo = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : "";
                fee = _args8.length > 3 && _args8[3] !== undefined ? _args8[3] : null;
                sequenceNumber = _args8.length > 4 && _args8[4] !== undefined ? _args8[4] : null;

                if (!(!this.account_number || !sequenceNumber)) {
                  _context8.next = 13;
                  break;
                }

                _context8.next = 6;
                return this.getAccount();

              case 6:
                accountInfo = _context8.sent;
                _context8.next = 9;
                return this.getSequenceNumberFromAccountInfo(accountInfo);

              case 9:
                sequenceNumber = _context8.sent;
                _context8.next = 12;
                return this.getAccountNumberFromAccountInfo(accountInfo);

              case 12:
                this.account_number = _context8.sent;

              case 13:
                params = {
                  account_number: parseInt(this.account_number),
                  chain_id: this.chainId,
                  memo: memo,
                  msg: msg,
                  sequence: sequenceNumber,
                  fee: fee
                };
                tx = new _transaction["default"](params);
                return _context8.abrupt("return", tx.sign(this.privateKey, signMsg));

              case 16:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function buildTransaction(_x13, _x14) {
        return _buildTransaction.apply(this, arguments);
      }

      return buildTransaction;
    }()
    /**
     * send transaction to OKChain.
     * @param {signedTx} tx signed Transaction object
     * @param {Boolean} mode use synchronous mode, optional
     * @return {Object} response (success or fail)
     */

  }, {
    key: "sendTransaction",
    value: function () {
      var _sendTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(signedTx) {
        var buf, opts;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                buf = signedTx.serializeTransactionWithJson(this.mode);
                console.log(buf);
                opts = {
                  data: buf,
                  headers: {
                    "content-type": "text/plain"
                  }
                };
                return _context9.abrupt("return", this.httpClient.send("post", "".concat(apiPath.txs), null, opts));

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function sendTransaction(_x15) {
        return _sendTransaction.apply(this, arguments);
      }

      return sendTransaction;
    }()
    /**
     * get account
     * @param {String} address
     * @return {Object} result
     */

  }, {
    key: "getAccount",
    value: function () {
      var _getAccount = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var address,
            data,
            _args10 = arguments;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                address = _args10.length > 0 && _args10[0] !== undefined ? _args10[0] : this.address;

                if (address) {
                  _context10.next = 3;
                  break;
                }

                throw new Error("address should not be falsy");

              case 3:
                _context10.prev = 3;
                _context10.next = 6;
                return this.httpClient.send("get", "".concat(apiPath.queryAccount, "/").concat(address));

              case 6:
                data = _context10.sent;
                return _context10.abrupt("return", data);

              case 10:
                _context10.prev = 10;
                _context10.t0 = _context10["catch"](3);
                return _context10.abrupt("return", null);

              case 13:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[3, 10]]);
      }));

      function getAccount() {
        return _getAccount.apply(this, arguments);
      }

      return getAccount;
    }()
    /**
     * get balances from okchain
     * @param {String} address
     * @return {Object} result
     */

  }, {
    key: "getBalance",
    value: function () {
      var _getBalance = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var address,
            data,
            _args11 = arguments;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                address = _args11.length > 0 && _args11[0] !== undefined ? _args11[0] : this.address;
                _context11.prev = 1;
                _context11.next = 4;
                return this.getAccount(address);

              case 4:
                data = _context11.sent;
                return _context11.abrupt("return", this.getBalanceFromAccountInfo(data));

              case 8:
                _context11.prev = 8;
                _context11.t0 = _context11["catch"](1);
                return _context11.abrupt("return", []);

              case 11:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this, [[1, 8]]);
      }));

      function getBalance() {
        return _getBalance.apply(this, arguments);
      }

      return getBalance;
    }()
    /**
     * get balances from accountInfo Object
     * @param {Object} accountInfo optional address
     * @return {Object} result
     */

  }, {
    key: "getBalanceFromAccountInfo",
    value: function () {
      var _getBalanceFromAccountInfo = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(accountInfo) {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt("return", accountInfo.result.value.coins);

              case 1:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12);
      }));

      function getBalanceFromAccountInfo(_x16) {
        return _getBalanceFromAccountInfo.apply(this, arguments);
      }

      return getBalanceFromAccountInfo;
    }()
    /**
     * get SequenceNumber from okchain
     * @param {String} address
     * @return {Number} sequenceNumber
     */

  }, {
    key: "getSequenceNumber",
    value: function () {
      var _getSequenceNumber = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
        var address,
            data,
            _args13 = arguments;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                address = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : this.address;
                _context13.prev = 1;
                _context13.next = 4;
                return this.getAccount(address);

              case 4:
                data = _context13.sent;
                return _context13.abrupt("return", this.getSequenceNumberFromAccountInfo(data));

              case 8:
                _context13.prev = 8;
                _context13.t0 = _context13["catch"](1);
                return _context13.abrupt("return", null);

              case 11:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this, [[1, 8]]);
      }));

      function getSequenceNumber() {
        return _getSequenceNumber.apply(this, arguments);
      }

      return getSequenceNumber;
    }()
    /**
     * get SequenceNumber from accountInfo Object
     * @param {String} accountInfo
     * @return {Number} sequenceNumber
     */

  }, {
    key: "getSequenceNumberFromAccountInfo",
    value: function () {
      var _getSequenceNumberFromAccountInfo = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(accountInfo) {
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                return _context14.abrupt("return", accountInfo.result.value.sequence);

              case 1:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14);
      }));

      function getSequenceNumberFromAccountInfo(_x17) {
        return _getSequenceNumberFromAccountInfo.apply(this, arguments);
      }

      return getSequenceNumberFromAccountInfo;
    }()
    /**
     * get accountNumber from accountInfo Object
     * @param {String} accountInfo
     * @return {Number} accountNumber
     */

  }, {
    key: "getAccountNumberFromAccountInfo",
    value: function () {
      var _getAccountNumberFromAccountInfo = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(accountInfo) {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                return _context15.abrupt("return", accountInfo.result.value.account_number);

              case 1:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15);
      }));

      function getAccountNumberFromAccountInfo(_x18) {
        return _getAccountNumberFromAccountInfo.apply(this, arguments);
      }

      return getAccountNumberFromAccountInfo;
    }()
    /**
     * Send TokenIssueTransaction.
     * @param {String} symbol
     * @param {String} whole_name
     * @param {String} total_supply
     * @param {Boolean} mintable
     * @param {String} description
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendTokenIssueTransaction",
    value: function () {
      var _sendTokenIssueTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(symbol, whole_name, total_supply) {
        var mintable,
            description,
            memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args16 = arguments;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                mintable = _args16.length > 3 && _args16[3] !== undefined ? _args16[3] : false;
                description = _args16.length > 4 && _args16[4] !== undefined ? _args16[4] : '';
                memo = _args16.length > 5 && _args16[5] !== undefined ? _args16[5] : '';
                sequenceNumber = _args16.length > 6 && _args16[6] !== undefined ? _args16[6] : null;
                msg = [{
                  type: "okchain/token/MsgIssue",
                  value: {
                    description: description,
                    mintable: mintable,
                    original_symbol: symbol,
                    owner: this.address,
                    symbol: symbol,
                    total_supply: total_supply,
                    whole_name: whole_name
                  }
                }];
                _context16.next = 7;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 7:
                signedTx = _context16.sent;
                _context16.next = 10;
                return this.sendTransaction(signedTx);

              case 10:
                res = _context16.sent;
                return _context16.abrupt("return", res);

              case 12:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function sendTokenIssueTransaction(_x19, _x20, _x21) {
        return _sendTokenIssueTransaction.apply(this, arguments);
      }

      return sendTokenIssueTransaction;
    }()
    /**
     * Send TokenBurnTransaction.
     * @param {String} token
     * @param {String} amount
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendTokenBurnTransaction",
    value: function () {
      var _sendTokenBurnTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(token, amount) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args17 = arguments;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                memo = _args17.length > 2 && _args17[2] !== undefined ? _args17[2] : "";
                sequenceNumber = _args17.length > 3 && _args17[3] !== undefined ? _args17[3] : null;
                msg = [{
                  type: "okchain/token/MsgBurn",
                  value: {
                    amount: getTransactionToken(amount, token),
                    owner: this.address
                  }
                }];
                _context17.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context17.sent;
                _context17.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context17.sent;
                return _context17.abrupt("return", res);

              case 10:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function sendTokenBurnTransaction(_x22, _x23) {
        return _sendTokenBurnTransaction.apply(this, arguments);
      }

      return sendTokenBurnTransaction;
    }()
    /**
     * Send TokenMintTransaction.
     * @param {String} token
     * @param {String} amount
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendTokenMintTransaction",
    value: function () {
      var _sendTokenMintTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(token, amount) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args18 = arguments;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                memo = _args18.length > 2 && _args18[2] !== undefined ? _args18[2] : "";
                sequenceNumber = _args18.length > 3 && _args18[3] !== undefined ? _args18[3] : null;
                msg = [{
                  type: "okchain/token/MsgMint",
                  value: {
                    amount: getTransactionToken(amount, token),
                    owner: this.address
                  }
                }];
                _context18.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context18.sent;
                _context18.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context18.sent;
                return _context18.abrupt("return", res);

              case 10:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function sendTokenMintTransaction(_x24, _x25) {
        return _sendTokenMintTransaction.apply(this, arguments);
      }

      return sendTokenMintTransaction;
    }()
    /**
     * Send RegisterDexOperatorTransaction.
     * @param {String} website
     * @param {String} handling_fee_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendRegisterDexOperatorTransaction",
    value: function () {
      var _sendRegisterDexOperatorTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(website, handling_fee_address) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args19 = arguments;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                memo = _args19.length > 2 && _args19[2] !== undefined ? _args19[2] : "";
                sequenceNumber = _args19.length > 3 && _args19[3] !== undefined ? _args19[3] : null;
                msg = [{
                  type: "okchain/dex/CreateOperator",
                  value: {
                    handling_fee_address: handling_fee_address,
                    owner: this.address,
                    website: website
                  }
                }];
                _context19.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context19.sent;
                _context19.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context19.sent;
                return _context19.abrupt("return", res);

              case 10:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function sendRegisterDexOperatorTransaction(_x26, _x27) {
        return _sendRegisterDexOperatorTransaction.apply(this, arguments);
      }

      return sendRegisterDexOperatorTransaction;
    }()
    /**
     * Send ListTokenPairTransaction.
     * @param {String} base_asset
     * @param {String} quote_asset
     * @param {String} init_price
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendListTokenPairTransaction",
    value: function () {
      var _sendListTokenPairTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(base_asset, quote_asset, init_price) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args20 = arguments;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                memo = _args20.length > 3 && _args20[3] !== undefined ? _args20[3] : "";
                sequenceNumber = _args20.length > 4 && _args20[4] !== undefined ? _args20[4] : null;
                msg = [{
                  type: "okchain/dex/MsgList",
                  value: {
                    init_price: (0, _utils.formatNumber)(init_price),
                    list_asset: base_asset,
                    owner: this.address,
                    quote_asset: quote_asset
                  }
                }];
                _context20.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context20.sent;
                _context20.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context20.sent;
                return _context20.abrupt("return", res);

              case 10:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function sendListTokenPairTransaction(_x28, _x29, _x30) {
        return _sendListTokenPairTransaction.apply(this, arguments);
      }

      return sendListTokenPairTransaction;
    }()
    /**
     * Send AddProductDepositTransaction.
     * @param {String} amount
     * @param {String} product
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendAddProductDepositTransaction",
    value: function () {
      var _sendAddProductDepositTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(amount, product) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args21 = arguments;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                memo = _args21.length > 2 && _args21[2] !== undefined ? _args21[2] : "";
                sequenceNumber = _args21.length > 3 && _args21[3] !== undefined ? _args21[3] : null;
                msg = [{
                  type: "okchain/dex/MsgDeposit",
                  value: {
                    amount: getTransactionToken(amount, this.nativeDenom),
                    depositor: this.address,
                    product: product
                  }
                }];
                _context21.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context21.sent;
                _context21.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context21.sent;
                return _context21.abrupt("return", res);

              case 10:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function sendAddProductDepositTransaction(_x31, _x32) {
        return _sendAddProductDepositTransaction.apply(this, arguments);
      }

      return sendAddProductDepositTransaction;
    }()
    /**
     * Send WithdrawProductDepositTransaction.
     * @param {String} amount
     * @param {String} product
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendWithdrawProductDepositTransaction",
    value: function () {
      var _sendWithdrawProductDepositTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(amount, product) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args22 = arguments;
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                memo = _args22.length > 2 && _args22[2] !== undefined ? _args22[2] : "";
                sequenceNumber = _args22.length > 3 && _args22[3] !== undefined ? _args22[3] : null;
                msg = [{
                  type: "okchain/dex/MsgWithdraw",
                  value: {
                    amount: getTransactionToken(amount, this.nativeDenom),
                    depositor: this.address,
                    product: product
                  }
                }];
                _context22.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context22.sent;
                _context22.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context22.sent;
                return _context22.abrupt("return", res);

              case 10:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function sendWithdrawProductDepositTransaction(_x33, _x34) {
        return _sendWithdrawProductDepositTransaction.apply(this, arguments);
      }

      return sendWithdrawProductDepositTransaction;
    }()
    /**
     * Send sendStakingDelegateTransaction.
     * @param {String} quantity
     * @param {String} delegator_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendStakingDelegateTransaction",
    value: function () {
      var _sendStakingDelegateTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(quantity, delegator_address) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args23 = arguments;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                memo = _args23.length > 2 && _args23[2] !== undefined ? _args23[2] : "";
                sequenceNumber = _args23.length > 3 && _args23[3] !== undefined ? _args23[3] : null;
                msg = [{
                  type: "okchain/staking/MsgDelegate",
                  value: {
                    delegator_address: delegator_address,
                    quantity: getTransactionToken(quantity, this.nativeDenom)
                  }
                }];
                _context23.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context23.sent;
                _context23.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context23.sent;
                return _context23.abrupt("return", res);

              case 10:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function sendStakingDelegateTransaction(_x35, _x36) {
        return _sendStakingDelegateTransaction.apply(this, arguments);
      }

      return sendStakingDelegateTransaction;
    }()
    /**
     * Send sendStakingUnDelegateTransaction.
     * @param {String} quantity
     * @param {String} delegator_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendStakingUnDelegateTransaction",
    value: function () {
      var _sendStakingUnDelegateTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(quantity, delegator_address) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args24 = arguments;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                memo = _args24.length > 2 && _args24[2] !== undefined ? _args24[2] : "";
                sequenceNumber = _args24.length > 3 && _args24[3] !== undefined ? _args24[3] : null;
                msg = [{
                  type: "okchain/staking/MsgUnDelegate",
                  value: {
                    delegator_address: delegator_address,
                    quantity: getTransactionToken(quantity, this.nativeDenom)
                  }
                }];
                _context24.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context24.sent;
                _context24.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context24.sent;
                return _context24.abrupt("return", res);

              case 10:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function sendStakingUnDelegateTransaction(_x37, _x38) {
        return _sendStakingUnDelegateTransaction.apply(this, arguments);
      }

      return sendStakingUnDelegateTransaction;
    }()
    /**
     * Send sendStakingVoteTransaction.
     * @param {String} validator_addresses
     * @param {String} delegator_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

  }, {
    key: "sendStakingVoteTransaction",
    value: function () {
      var _sendStakingVoteTransaction = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(validator_addresses, delegator_address) {
        var memo,
            sequenceNumber,
            msg,
            signedTx,
            res,
            _args25 = arguments;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                memo = _args25.length > 2 && _args25[2] !== undefined ? _args25[2] : "";
                sequenceNumber = _args25.length > 3 && _args25[3] !== undefined ? _args25[3] : null;
                msg = [{
                  type: "okchain/staking/MsgVote",
                  value: {
                    delegator_address: delegator_address,
                    validator_addresses: validator_addresses
                  }
                }];
                _context25.next = 5;
                return this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber);

              case 5:
                signedTx = _context25.sent;
                _context25.next = 8;
                return this.sendTransaction(signedTx);

              case 8:
                res = _context25.sent;
                return _context25.abrupt("return", res);

              case 10:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function sendStakingVoteTransaction(_x39, _x40) {
        return _sendStakingVoteTransaction.apply(this, arguments);
      }

      return sendStakingVoteTransaction;
    }()
  }], [{
    key: "getClient",
    value: function getClient(privateKey, url) {
      var client = new OKChainClient(url);
      client.setAccountInfo(privateKey);
      return client;
    }
  }]);

  return OKChainClient;
}();

exports.OKChainClient = OKChainClient;