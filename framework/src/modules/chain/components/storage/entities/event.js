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

const path = require('path');
const assert = require('assert');
const { defaults, omit, pick } = require('lodash');
const {
	entities: { BaseEntity },
	utils: {
		filterTypes: { NUMBER, TEXT },
	},
} = require('../../../../../components/storage');

const defaultCreateValues = {
	transactionId: null,
	heightNextExecution: null,
	executionsLeft: null,
	interval: null,
};

const readOnlyFields = ['transactionId'];

const sqlFiles = {
	select: 'events/get.sql',
	create: 'events/create.sql',
	update: 'events/update.sql',
	updateOne: 'events/update_one.sql',
	isPersisted: 'events/is_persisted.sql',
	delete: 'events/delete.sql',
};

/**
 * Event
 * @typedef {Object} Event
 * @property {string} transactionId
 * @property {number} heightNextExecution
 * @property {number} executionsLeft
 */

/**
 * Event Filters
 * @typedef {Object} filters.Event
 * @property {string} [transactionId]
 * @property {string} [transactionId_eql]
 * @property {string} [transactionId_ne]
 * @property {string} [transactionId_in]
 * @property {string} [transactionId_like]
 * @property {number} [heightNextExecution]
 * @property {number} [heightNextExecution_eql]
 * @property {number} [heightNextExecution_ne]
 * @property {number} [heightNextExecution_gt]
 * @property {number} [heightNextExecution_gte]
 * @property {number} [heightNextExecution_lt]
 * @property {number} [heightNextExecution_lte]
 * @property {number} [heightNextExecution_in]
 * @property {number} [executionsLeft]
 * @property {number} [executionsLeft_eql]
 * @property {number} [executionsLeft_ne]
 * @property {number} [executionsLeft_gt]
 * @property {number} [executionsLeft_gte]
 * @property {number} [executionsLeft_lt]
 * @property {number} [executionsLeft_lte]
 * @property {number} [executionsLeft_in]
 */

class Event extends BaseEntity {
	/**
	 * Constructor
	 * @param {BaseAdapter} adapter - Adapter to retrieve the data from
	 * @param {filters.Event} defaultFilters - Set of default filters applied on every query
	 */
	constructor(adapter, defaultFilters = {}) {
		super(adapter, defaultFilters);

		this.addField('transactionId', 'string', { filter: TEXT });
		this.addField('heightNextExecution', 'number', { filter: NUMBER });
		this.addField('executionsLeft', 'number', { filter: NUMBER });

		const defaultSort = { sort: 'id:asc' };
		this.extendDefaultOptions(defaultSort);

		this.sqlDirectory = path.join(path.dirname(__filename), '../sql');

		this.SQLs = this.loadSQLFiles('event', sqlFiles, this.sqlDirectory);
	}

	/**
	 * Get one event
	 *
	 * @param {filters.Event|filters.Event[]} [filters = {}]
	 * @param {Object} [options = {}] - Options to filter data
	 * @param {Number} [options.limit=10] - Number of records to fetch
	 * @param {Number} [options.offset=0] - Offset to start the records
	 * @param {Object} [tx] - Database transaction object
	 * @return {Promise.<Event, Error>}
	 */
	getOne(filters, options = {}, tx = null) {
		const expectedResultCount = 1;
		return this._getResults(filters, options, tx, expectedResultCount);
	}

	/**
	 * Get list of rounds
	 *
	 * @param {filters.Event|filters.Event[]} [filters = {}]
	 * @param {Object} [options = {}] - Options to filter data
	 * @param {Number} [options.limit=10] - Number of records to fetch
	 * @param {Number} [options.offset=0] - Offset to start the records
	 * @param {Object} [tx] - Database transaction object
	 * @return {Promise.<Event[], Error>}
	 */
	get(filters = {}, options = {}, tx = null) {
		return this._getResults(filters, options, tx);
	}

	/**
	 * Create event object
	 *
	 * @param {Object} data
	 * @param {Object} [_options]
	 * @param {Object} [tx] - Transaction object
	 * @return {null}
	 */
	// eslint-disable-next-line no-unused-vars
	create(data, _options = {}, tx = null) {
		assert(data, 'Must provide data to create account');
		assert(
			typeof data === 'object' || Array.isArray(data),
			'Data must be an object or array of objects'
		);

		let values;

		if (Array.isArray(data)) {
			values = data.map(item => ({ ...item }));
		} else if (typeof data === 'object') {
			values = [{ ...data }];
		}

		values = values.map(v => defaults(v, defaultCreateValues));
		const attributes = Object.keys(this.fields).filter(
			fieldname => fieldname !== 'id'
		);
		const createSet = this.getValuesSet(values, attributes);
		const fields = attributes
			.map(k => `"${this.fields[k].fieldName}"`)
			.join(',');

		return this.adapter.executeFile(
			this.SQLs.create,
			{ createSet, fields },
			{ expectedResultCount: 0 },
			tx
		);
	}

	/**
	 * Update the records based on given condition
	 *
	 * @param {filters.Event} [filters]
	 * @param {Object} data
	 * @param {Object} [options]
	 * @param {Object} [tx] - Transaction object
	 * @return {null}
	 */
	update(filters, data, _options, tx = null) {
		this.validateFilters(filters);
		const objectData = omit(data, readOnlyFields);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);
		const updateSet = this.getUpdateSet(objectData);

		const params = {
			...objectData,
			parsedFilters,
			updateSet,
		};

		return this.adapter.executeFile(
			this.SQLs.update,
			params,
			{ expectedResultCount: 0 },
			tx
		);
	}

	/**
	 * Update one record based on the condition given
	 *
	 * @param {filters.Event} filters
	 * @param {Object} data
	 * @param {Object} [options]
	 * @param {Object} [tx] - Transaction object
	 * @return {null}
	 */
	updateOne(filters, data, _options, tx = null) {
		this.validateFilters(filters);
		const objectData = omit(data, readOnlyFields);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);
		const updateSet = this.getUpdateSet(objectData);

		const params = {
			...objectData,
			parsedFilters,
			updateSet,
		};

		return this.adapter.executeFile(
			this.SQLs.updateOne,
			params,
			{ expectedResultCount: 0 },
			tx
		);
	}

	/**
	 * Check if the record exists with following conditions
	 *
	 * @param {filters.Event} filters
	 * @param {Object} [options]
	 * @param {Object} [tx]
	 * @returns {Promise.<boolean, Error>}
	 */
	isPersisted(filters, _options, tx = null) {
		const atLeastOneRequired = true;
		this.validateFilters(filters, atLeastOneRequired);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);

		return this.adapter
			.executeFile(
				this.SQLs.isPersisted,
				{ parsedFilters },
				{ expectedResultCount: 1 },
				tx
			)
			.then(result => result.exists);
	}

	/**
	 * Delete records with following conditions
	 *
	 * @param {filters.Event} filters
	 * @param {Object} [options]
	 * @param {Object} [tx]
	 * @returns {Promise.<boolean, Error>}
	 */
	delete(filters, _options, tx = null) {
		this.validateFilters(filters);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);

		return this.adapter
			.executeFile(
				this.SQLs.delete,
				{ parsedFilters },
				{ expectedResultCount: 0 },
				tx
			)
			.then(result => result);
	}

	_getResults(filters, options, tx, expectedResultCount = undefined) {
		this.validateFilters(filters);
		this.validateOptions(options);

		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);
		const parsedOptions = defaults(
			{},
			pick(options, ['limit', 'offset', 'sort']),
			pick(this.defaultOptions, ['limit', 'offset', 'sort'])
		);
		const parsedSort = this.parseSort(parsedOptions.sort);

		const params = {
			limit: parsedOptions.limit,
			offset: parsedOptions.offset,
			parsedSort,
			parsedFilters,
		};

		return this.adapter.executeFile(
			this.SQLs.select,
			params,
			{ expectedResultCount },
			tx
		);
	}
}

module.exports = Event;
