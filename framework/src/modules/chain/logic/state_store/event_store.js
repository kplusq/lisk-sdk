/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const _ = require('lodash');

class EventStore {
	constructor(eventEntity, { mutate, tx } = { mutate: true, tx: undefined }) {
		this.event = eventEntity;
		this.data = [];
		this.updatedKeys = {};
		this.primaryKey = 'transactionId';
		this.name = 'Event';
		this.mutate = mutate;
		this.originalData = [];
		this.originalUpdatedKeys = {};
		this.tx = tx;
	}

	async cache(filter) {
		const result = await this.event.get(filter, {}, this.tx);
		this.data = _.uniqBy([...this.data, ...result], this.primaryKey);
		return _.cloneDeep(this.data);
	}

	createSnapshot() {
		this.originalData = _.cloneDeep(this.data);
		this.updatedKeys = _.cloneDeep(this.updatedKeys);
	}

	restoreSnapshot() {
		this.data = this.originalData;
		this.updatedKeys = this.originalUpdatedKeys;
		this.originalData = [];
		this.originalUpdatedKeys = {};
	}

	get(primaryValue) {
		const element = this.data.find(
			item => item[this.primaryKey] === primaryValue
		);
		if (!element) {
			throw new Error(
				`${this.name} with ${this.primaryKey} = ${primaryValue} does not exist`
			);
		}
		return _.cloneDeep(element);
	}

	getOrDefault() {
		throw new Error(`getOrDefault cannot be called for ${this.name}`);
	}

	find(fn) {
		return this.data.find(fn);
	}

	set(primaryValue, updatedElement) {
		this.data[primaryValue] = updatedElement;
	}

	// eslint-disable no-await-in-loop
	async finalize(height) {
		if (!this.mutate) {
			throw new Error(
				'Cannot finalize when store is initialized with mutate = false'
			);
		}

		// eslint-disable-next-line
		for (const key of Object.keys(this.data)) {
			const val = this.data[key];

			// eslint-disable-next-line
			const isPersisted = await this.event.isPersisted({ transactionId: key });
			if (isPersisted) {
				const updated = {
					...val,
					executionLeft: val.executionLeft - 1,
					heightNextExecution: val.heightNextExecution + val.interval,
				};
				// eslint-disable-next-line
				await this.event.update({ transactionId: key }, updated);
			} else {
				const updated = {
					...val,
					heightNextExecution: height + val.interval,
				};
				// eslint-disable-next-line
				await this.event.create(updated);
			}
		}
	}
}

module.exports = EventStore;
