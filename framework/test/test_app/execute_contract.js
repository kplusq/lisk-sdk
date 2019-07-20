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

const { APIClient } = require('@liskhq/lisk-api-client');
const {
	ContractTransaction,
	BalanceContractTransaction,
} = require('../../../elements/lisk-transactions');

const client = new APIClient(['http://localhost:4000']);

const txRegisterContract = new ContractTransaction({
	recipientId: '123L',
	asset: {
		contract: `
			transfer('0L', transaction.asset.burnAmount);
			transfer('10L', '100000000');
			transfer('100L', transaction.amount);
		`,
	},
});

const txCallContract = new BalanceContractTransaction({
	recipientId: '123L',
	amount: '100000000',
	asset: {
		burnAmount: '100000000',
	},
});

txRegisterContract.sign(
	'wagon stock borrow episode laundry kitten salute link globe zero feed marble'
);

txCallContract.sign(
	'wagon stock borrow episode laundry kitten salute link globe zero feed marble'
);

const run = async () => {
	console.log(
		`Sending contract register transaction - ${txRegisterContract.stringify()}`
	);
	await client.transactions.broadcast(txRegisterContract.toJSON());

	console.log(
		`\n \n \n Sending contract call transaction - ${txCallContract.stringify()}`
	);
	await client.transactions.broadcast(txCallContract.toJSON());
};

run()
	.then()
	.catch();
