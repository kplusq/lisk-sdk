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
/* eslint-disable no-console */

'use strict';

const { EventTransaction } = require('@liskhq/lisk-transactions');
const { APIClient } = require('@liskhq/lisk-api-client');

const client = new APIClient(['http://localhost:4000']);

const tx = new EventTransaction({
	recipientId: '123L',
	amount: '100000000',
	asset: {
		interval: 10,
		count: 100,
	},
});

tx.sign(
	'wagon stock borrow episode laundry kitten salute link globe zero feed marble'
);

const run = async () => {
	await client.transactions.broadcast(tx.toJSON());
};

run()
	.then(console.log)
	.catch(console.error);
