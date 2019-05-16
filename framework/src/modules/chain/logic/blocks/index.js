const BlockOld = require('./block');
const BlockBFT = require('./block_bft');

const { Status: TransactionStatus } = require('@liskhq/lisk-transactions');
const { getAddressFromPublicKey } = require('@liskhq/lisk-cryptography');
const _ = require('lodash');
const crypto = require('crypto');
const ByteBuffer = require('bytebuffer');
const Bignum = require('../../helpers/bignum');
const blockVersion = require('../block_version');
const BlockReward = require('../block_reward');

const { MAX_PAYLOAD_LENGTH, FEES, TRANSACTION_TYPES } = global.constants;
const __private = {};
let modules;

class Block {
    constructor(ed, schema, transaction, bftUpgradeHeight, cb) {
		this.scope = {
			ed,
			schema,
            transaction,
            bftUpgradeHeight,
        };
        
        this.block = new BlockOld(ed, schema, transaction, cb);
        this.blockBFT = new BlockBFT(ed, schema, transaction, cb);

		this.attachSchema();

		__private.blockReward = new BlockReward();
		if (cb) {
			return setImmediate(cb, null, this);
		}
    }
    
    create(data) {
        console.log(data.height);
        console.log('do you even come here\n\n\n\n');
        if (data.height > this.scope.bftUpgradeHeight) {
            return this.blockBFT.create(data);
        }
        return this.block.create(data);
    }

    sign(block, keypair) {
        if (block.height > this.scope.bftUpgradeHeight) {
            return this.blockBFT.sign(block, keypair);
        }
        return this.block.sign(block, keypair);
    }

    getHash(block) {
        if (block.height > this.scope.bftUpgradeHeight) {
            return this.blockBFT.getHash(block);
        }
        return this.block.getHash(block);
    }

    verifySignature(block) {
        if (block.height > this.scope.bftUpgradeHeight) {
            return this.blockBFT.verifySignature(block);
        }
        return this.block.verifySignature(block);
    }

    objectNormalize(block) {
		Object.keys(block).forEach(key => {
			if (block[key] === null || typeof block[key] === 'undefined') {
				delete block[key];
			}
		});
		const report = this.scope.schema.validate(block, this.schema);
		if (!report) {
			throw new Error(
				`Failed to validate block schema: ${this.scope.schema
					.getLastErrors()
					.map(err => err.message)
					.join(', ')}`
			);
		}
		const {
			transactionsResponses,
		} = modules.processTransactions.validateTransactions(block.transactions);
		const invalidTransactionResponse = transactionsResponses.find(
			transactionResponse => transactionResponse.status !== TransactionStatus.OK
		);
		if (invalidTransactionResponse) {
			throw invalidTransactionResponse.errors;
		}

		return block;
	}

    /**
	 * Binds scope.modules to private variable modules.
	 */
	// eslint-disable-next-line class-methods-use-this
	bindModules(__modules) {
		modules = {
			processTransactions: __modules.processTransactions,
		};
    }
    
    getBytes(block) {
        if (block.height > this.scope.bftUpgradeHeight) {
            return this.blockBFT.getBytes(block);
        }
        return this.block.getBytes(block);
    }

    getBytes(block) {
        if (block.height > this.scope.bftUpgradeHeight) {
            return this.blockBFT.getBytes(block);
        }
        return this.block.getBytes(block);
    }

    /**
	 * Calculates block id based on block.
	 *
	 * @param {block} block
	 * @returns {string} Block id
	 * @todo Add description for the params
	 */
	// eslint-disable-next-line class-methods-use-this
	getId(block) {
		const hash = crypto
			.createHash('sha256')
			.update(this.getBytes(block))
			.digest();
		const temp = Buffer.alloc(8);
		for (let i = 0; i < 8; i++) {
			temp[i] = hash[7 - i];
		}

		// eslint-disable-next-line new-cap
		const id = new Bignum.fromBuffer(temp).toString();
		return id;
    }
    
    /**
	 * Returns send fees from constants.
	 *
	 * @returns {Bignumber} Transaction fee
	 * @todo Delete unused param
	 */
	// eslint-disable-next-line class-methods-use-this
	calculateFee() {
		return new Bignum(FEES.SEND);
    }
    
    dbRead(raw) {
        if (parseInt(raw.b_height) > this.scope.bftUpgradeHeight) {
            return this.blockBFT.dbRead(raw);
        }
        return this.block.dbRead(raw);
    }

    storageRead(block) {
        if (parseInt(raw.b_height) > this.scope.bftUpgradeHeight) {
            return this.blockBFT.storageRead(raw);
        }
        return this.block.storageRead(raw);
    }

    /**
	 * @typedef {Object} block
	 * @property {string} id - Between 1 and 20 chars
	 * @property {number} height
	 * @property {number} heightPrevious
	 * @property {number} heightPrevoted
	 * @property {signature} blockSignature
	 * @property {publicKey} generatorPublicKey
	 * @property {number} numberOfTransactions
	 * @property {string} payloadHash
	 * @property {number} payloadLength
	 * @property {string} previousBlock - Between 1 and 20 chars
	 * @property {number} timestamp
	 * @property {number} totalAmount - Minimun 0
	 * @property {number} totalFee - Minimun 0
	 * @property {number} reward - Minimun 0
	 * @property {Array} transactions - Unique items
	 * @property {number} version - Minimun 0
	 */
	attachSchema() {
		this.schema = {
			id: 'Block',
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'id',
					minLength: 1,
					maxLength: 20,
				},
				height: {
					type: 'integer',
				},
				heightPrevious: {
					type: 'integer',
				},
				heightPrevoted: {
					type: 'integer',
				},
				blockSignature: {
					type: 'string',
					format: 'signature',
				},
				generatorPublicKey: {
					type: 'string',
					format: 'publicKey',
				},
				numberOfTransactions: {
					type: 'integer',
				},
				payloadHash: {
					type: 'string',
					format: 'hex',
				},
				payloadLength: {
					type: 'integer',
				},
				previousBlock: {
					type: 'string',
					format: 'id',
					minLength: 1,
					maxLength: 20,
				},
				timestamp: {
					type: 'integer',
				},
				totalAmount: {
					type: 'object',
					format: 'amount',
				},
				totalFee: {
					type: 'object',
					format: 'amount',
				},
				reward: {
					type: 'object',
					format: 'amount',
				},
				transactions: {
					type: 'array',
					uniqueItems: true,
				},
				version: {
					type: 'integer',
					minimum: 0,
				},
			},
			required: [
				'heightPrevious',
				'heightPrevoted',
				'blockSignature',
				'generatorPublicKey',
				'numberOfTransactions',
				'payloadHash',
				'payloadLength',
				'timestamp',
				'totalAmount',
				'totalFee',
				'reward',
				'transactions',
				'version',
			],
		};
    }
}

module.exports = Block;