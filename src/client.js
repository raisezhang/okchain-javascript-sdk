/**
 * @jest-environment node
 */
/**
 * @module client
 */
import * as crypto from "./crypto"
import Transaction from "./transaction"
import HttpProxy from "./httpProxy"
import { formatNumber } from "./utils"

const apiPath = {
    txs: "/okchain/v1/txs",
    queryAccount: "/okchain/v1/auth/accounts",
}

const bech32Head = "okchain"

// const mainnetChainId = ""
const testnetChainId = "okchain"

const getTransactionToken = function (amount, denom) {
    return {
        amount: formatNumber(amount),
        denom,
    }
}

/**
 * The OKChain client.
 */
export class OKChainClient {
    /**
     * @param {String} url rpc url
     * @param {String} [chainId=okchain] chain id
     */
    constructor(url, chainId = testnetChainId) {
        if (!url) {
            throw new Error("null url")
        }
        this.httpClient = new HttpProxy(url)
        this.nativeDenom = chainId === testnetChainId ? "tokt" : "okt"
        this.defaultFee = {
            amount: [getTransactionToken(0.02, this.nativeDenom)],
            gas: "200000",
        };
        this.mode = "block"
        this.chainId = chainId
    }

    /**
     * get an instance of OKChainClient
     * @param {String} privateKey private key
     * @param {String} url rpc url
     */
    static getClient(privateKey, url) {
        const client = new OKChainClient(url)
        client.setAccountInfo(privateKey)
        return client
    }

    /**
     * set the mode when send transaction
     * @param {string} mode block|sync|async
     */
    async setMode(m) {
        this.mode = m
    }

    /**
     * @param {string} privateKey
     * @return {OKChainClient}
     */
    async setAccountInfo(privateKey) {
        if (privateKey !== this.privateKey) {
            const address = crypto.getAddressFromPrivateKey(privateKey, bech32Head)
            if (!address) throw new Error("invalid privateKey: " + privateKey)
            if (address === this.address) return this
            this.privateKey = privateKey
            this.address = address
            const data = await this.getAccount(address)
            this.account_number = await this.getAccountNumberFromAccountInfo(data)
        }
        return this
    }

    /**
     * Send SendTransaction.
     * @param {String} to To Address
     * @param {Number} amount Coin Quantity
     * @param {String} denom Coin Name
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendSendTransaction(to, amount, denom, memo = "", sequenceNumber = null) {
        const msg = [{
            type: "okchain/token/MsgTransfer",
            value: {
                amount: [ getTransactionToken(amount, denom) ],
                from_address: this.address,
                to_address: to,
            },
        }]

        const signMsg = msg

        const signedTx = await this.buildTransaction(msg, signMsg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send CancelOrderTransaction.
     * @param {String} orderId
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendCancelOrderTransaction(orderId, memo = "", sequenceNumber = null) {
        var orderIdList = [orderId]
        return this.sendCancelOrdersTransaction(orderIdList, memo, sequenceNumber)
    }

    async sendCancelOrdersTransaction(orderIdList, memo = "", sequenceNumber = null) {
        var msg = []
        var signMsg = []

        msg.push({
            type: "okchain/order/MsgCancel",
            value: {
                order_ids: orderIdList,
                sender: this.address,
            },
        })
        signMsg = msg

        const signedTx = await this.buildTransaction(msg, signMsg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

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
    async sendPlaceOrderTransaction(product, side, price, quantity, memo = "", sequence = null) {
        var order_items = [{
            price: formatNumber(price),
            product: product,
            quantity: formatNumber(quantity),
            side: side,
        }]
        return this.sendPlaceOrdersTransaction(order_items, memo, sequence)
    }

    async sendPlaceOrdersTransaction(order_items, memo = "", sequence = null) {
        const placeOrderMsg = [{
            type: "okchain/order/MsgNew",
            value: {
                order_items: order_items,
                sender: this.address,
            },

        }]
        const signMsg = placeOrderMsg

        const signedTx = await this.buildTransaction(placeOrderMsg, signMsg, memo, this.defaultFee, sequence)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Build Transaction for sending to okchain.
     * @param {Object} msg
     * @param {Object} signMsg
     * @param {String} memo
     * @param {String} fee
     * @param {Number} sequenceNumber
     * @return {Transaction} Transaction object
     */
    async buildTransaction(msg, signMsg, memo = "", fee = null , sequenceNumber = null) {
        if ((!this.account_number || !sequenceNumber)) {
            const accountInfo = await this.getAccount()
            sequenceNumber = await this.getSequenceNumberFromAccountInfo(accountInfo)
            this.account_number = await this.getAccountNumberFromAccountInfo(accountInfo)
        }

        const params = {
            account_number: parseInt(this.account_number),
            chain_id: this.chainId,
            memo: memo,
            msg,
            sequence: sequenceNumber,
            fee: fee,
        }

        const tx = new Transaction(params)
        return tx.sign(this.privateKey, signMsg)
    }

    /**
     * send transaction to OKChain.
     * @param {signedTx} tx signed Transaction object
     * @param {Boolean} mode use synchronous mode, optional
     * @return {Object} response (success or fail)
     */
    async sendTransaction(signedTx) {
        const buf = signedTx.serializeTransactionWithJson(this.mode)
        console.log(buf)
        const opts = {
            data: buf,
            headers: {
                "content-type": "text/plain",
            }
        }
        return this.httpClient.send("post", `${apiPath.txs}`, null, opts)
    }


    /**
     * get account
     * @param {String} address
     * @return {Object} result
     */
    async getAccount(address = this.address) {
        if (!address) {
            throw new Error("address should not be falsy")
        }
        try {
            const data = await this.httpClient.send("get", `${apiPath.queryAccount}/${address}`)
            return data
        } catch (err) {
            return null
        }
    }

    /**
     * get balances from okchain
     * @param {String} address
     * @return {Object} result
     */
    async getBalance(address = this.address) {
        try {
            const data = await this.getAccount(address)
            return this.getBalanceFromAccountInfo(data)
        } catch (err) {
            return []
        }
    }

    /**
     * get balances from accountInfo Object
     * @param {Object} accountInfo optional address
     * @return {Object} result
     */
    async getBalanceFromAccountInfo(accountInfo) {
        return accountInfo.result.value.coins
    }

    /**
     * get SequenceNumber from okchain
     * @param {String} address
     * @return {Number} sequenceNumber
     */
    async getSequenceNumber(address = this.address) {
        try {
            const data = await this.getAccount(address)
            return this.getSequenceNumberFromAccountInfo(data)
        } catch (err) {
            return null
        }
    }

    /**
     * get SequenceNumber from accountInfo Object
     * @param {String} accountInfo
     * @return {Number} sequenceNumber
     */
    async getSequenceNumberFromAccountInfo(accountInfo) {
        return accountInfo.result.value.sequence
    }

    /**
     * get accountNumber from accountInfo Object
     * @param {String} accountInfo
     * @return {Number} accountNumber
     */
    async getAccountNumberFromAccountInfo(accountInfo) {
        return accountInfo.result.value.account_number
    }


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
    async sendTokenIssueTransaction(symbol, whole_name, total_supply, mintable = false, description = '', memo= '', sequenceNumber = null) {

        const msg = [{
            type: "okchain/token/MsgIssue",
            value: {
                description: description,
                mintable: mintable,
                original_symbol: symbol,
                owner: this.address,
                symbol: symbol,
                total_supply: total_supply,
                whole_name: whole_name,
            }
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send TokenBurnTransaction.
     * @param {String} token
     * @param {String} amount
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */
    async sendTokenBurnTransaction(token, amount, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/token/MsgBurn",
            value: {
                amount: getTransactionToken(amount, token),
                owner: this.address
            }
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send TokenMintTransaction.
     * @param {String} token
     * @param {String} amount
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */
    async sendTokenMintTransaction(token, amount, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/token/MsgMint",
            value: {
                amount: getTransactionToken(amount, token),
                owner: this.address
            }
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send RegisterDexOperatorTransaction.
     * @param {String} website
     * @param {String} handling_fee_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendRegisterDexOperatorTransaction(website, handling_fee_address, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/dex/CreateOperator",
            value: {
                handling_fee_address: handling_fee_address,
                owner: this.address,
                website: website,
            },
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send ListTokenPairTransaction.
     * @param {String} base_asset
     * @param {String} quote_asset
     * @param {String} init_price
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendListTokenPairTransaction(base_asset, quote_asset, init_price, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/dex/MsgList",
            value: {
                init_price: formatNumber(init_price),
                list_asset: base_asset,
                owner: this.address,
                quote_asset: quote_asset,
            },
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send AddProductDepositTransaction.
     * @param {String} amount
     * @param {String} product
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendAddProductDepositTransaction(amount, product, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/dex/MsgDeposit",
            value: {
                amount: getTransactionToken(amount, this.nativeDenom),
                depositor: this.address,
                product: product,
            },
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send WithdrawProductDepositTransaction.
     * @param {String} amount
     * @param {String} product
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendWithdrawProductDepositTransaction(amount, product, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/dex/MsgWithdraw",
            value: {
                amount: getTransactionToken(amount, this.nativeDenom),
                depositor: this.address,
                product: product,
            },
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send sendStakingDelegateTransaction.
     * @param {String} quantity
     * @param {String} delegator_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendStakingDelegateTransaction(quantity, delegator_address, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/staking/MsgDelegate",
            value: {
                delegator_address,
                quantity: getTransactionToken(quantity, this.nativeDenom),
            },
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send sendStakingUnDelegateTransaction.
     * @param {String} quantity
     * @param {String} delegator_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendStakingUnDelegateTransaction(quantity, delegator_address, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/staking/MsgUnDelegate",
            value: {
                delegator_address,
                quantity: getTransactionToken(quantity, this.nativeDenom),
            },
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

    /**
     * Send sendStakingVoteTransaction.
     * @param {String} validator_addresses
     * @param {String} delegator_address
     * @param {String} memo
     * @param {Number} sequenceNumber
     * @return {Object} response
     */

    async sendStakingVoteTransaction(validator_addresses, delegator_address, memo = "", sequenceNumber = null) {

        const msg = [{
            type: "okchain/staking/MsgVote",
            value: {
                delegator_address,
                validator_addresses,
            },
        }]

        const signedTx = await this.buildTransaction(msg, msg, memo, this.defaultFee, sequenceNumber)
        const res = await this.sendTransaction(signedTx)
        return res
    }

}
