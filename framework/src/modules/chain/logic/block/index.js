const BlockOld = require('./block');
const BlockBFT = require('./block_bft');

class Block {
	constructor(ed, schema, transaction, bftUpgradeHeight) {
		this.scope = {
			ed,
			schema,
			transaction,
			bftUpgradeHeight,
		};

		this.blockOld = new BlockOld(ed, schema, transaction);
		this.blockBFT = new BlockBFT(ed, schema, transaction);

		this.attachSchema();
	}

	create(data) {
		return data.height > this.scope.bftUpgradeHeight ||
			this.scope.bftUpgradeHeight === 0
			? this.blockBFT.create(data)
			: this.blockOld.create(data);
	}

	sign(block, keypair) {
		return block.height > this.scope.bftUpgradeHeight ||
			this.scope.bftUpgradeHeight === 0
			? this.blockBFT.sign(block, keypair)
			: this.blockOld.sign(block, keypair);
	}

	getHash(block) {
		return block.height > this.scope.bftUpgradeHeight ||
			this.scope.bftUpgradeHeight === 0
			? this.blockBFT.getHash(block)
			: this.blockOld.getHash(block);
	}

	verifySignature(block) {
		return block.height > this.scope.bftUpgradeHeight ||
			this.scope.bftUpgradeHeight === 0
			? this.blockBFT.verifySignature(block)
			: this.blockOld.verifySignature(block);
	}

	objectNormalize(block) {
		return this.blockOld.objectNormalize(block);
	}

	/**
	 * Binds scope.modules to private variable modules.
	 */
	// eslint-disable-next-line class-methods-use-this
	bindModules(__modules) {
		this.blockOld.bindModules(__modules);
		this.blockBFT.bindModules(__modules);
	}

	getBytes(block) {
		return block.height > this.scope.bftUpgradeHeight ||
			this.scope.bftUpgradeHeight === 0
			? this.blockBFT.getBytes(block)
			: this.blockOld.getBytes(block);
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
		return this.blockOld.getId(block);
	}

	/**
	 * Returns send fees from constants.
	 *
	 * @returns {Bignumber} Transaction fee
	 * @todo Delete unused param
	 */
	// eslint-disable-next-line class-methods-use-this
	calculateFee() {
		return this.blockOld.calculateFee();
	}

	dbRead(raw) {
		return parseInt(raw.b_height) > this.scope.bftUpgradeHeight ||
			this.scope.bftUpgradeHeight === 0
			? this.blockBFT.dbRead(raw)
			: this.blockOld.dbRead(raw);
	}

	storageRead(raw) {
		return parseInt(raw.height) > this.scope.bftUpgradeHeight ||
			this.scope.bftUpgradeHeight === 0
			? this.blockBFT.storageRead(raw)
			: this.blockOld.storageRead(raw);
	}

	/**
	 * @typedef {Object} block
	 * @property {string} id - Between 1 and 20 chars
	 * @property {number} height
	 * @property {number} maxHeightPreviouslyForged
	 * @property {number} prevotedConfirmedUptoHeight
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
				maxHeightPreviouslyForged: {
					type: 'integer',
				},
				prevotedConfirmedUptoHeight: {
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
				'maxHeightPreviouslyForged',
				'prevotedConfirmedUptoHeight',
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
