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

const randomstring = require('randomstring');
const stampit = require('stampit');
const faker = require('faker');

const events = {};

const Event = stampit({
	props: {
		transactionId: '',
		heightNextExecution: null,
		executionsLeft: null,
	},
	init({ transactionId, heightNextExecution, executionsLeft }) {
		this.transactionId =
			transactionId ||
			randomstring.generate({ length: 20, charset: 'numeric' });
		this.heightNextExecution =
			heightNextExecution || faker.random.number({ min: 1000, max: 5000 });
		this.executionsLeft =
			executionsLeft || faker.random.number({ min: 10, max: 500 });
	},
});

module.exports = {
	Event,
	events,
};
