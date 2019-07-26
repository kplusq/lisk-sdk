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
 *
 */

import * as vm from 'vm';

import { TransferTransaction } from './0_transfer_transaction';
import {
	StateStore,
} from './base_transaction';
import { TransactionError } from './errors';

export interface ContractAsset {
	readonly contract: number;
}

export class BalanceContractTransaction extends TransferTransaction {
	public static TYPE = 13;
	public static FEE = '100000000';


	protected prepareContractSandbox(sender: object, recipient: object, store: StateStore): object {
		return {
			sender,
			recipient,
			transaction: this,
			transfer: (to, amount) => {
				this.apply.bind({...this, 
					id: this.id, 
					senderId: this.senderId, 
					recipientId: to,
					amount,
					fee: this.fee}
				);
				this.apply(store);
			},
		}
	}

	protected executeContract(sandbox: object, contract: string, errors: TransactionError[]) {
		  
		const script = new vm.Script(contract);
		  
		const context = vm.createContext(sandbox);

		try {
			script.runInContext(context, {
				breakOnSigint: true, // If true, the execution will be terminated when SIGINT (Ctrl+C) is received. Existing handlers for the event that have been attached via process.on('SIGINT') will be disabled during script execution, but will continue to work after that. If execution is terminated, an Error will be thrown.
				timeout: 100, // Specifies the number of milliseconds to execute code before terminating execution. If execution is terminated, an Error will be thrown. This value must be a strictly positive integer.
			});
		} catch (ex) {
			// tslint:disable-next-line: no-unused-expression
			errors.push(new TransactionError(
				'There contract execution failed',
				this.id,
				'.asset.contract',
				ex.toString(),
			));
		}
	}

	protected applyAsset(store: StateStore): ReadonlyArray<TransactionError> {
		const errors: TransactionError[] = [];

		const recipient = store.account.getOrDefault(this.recipientId);

		if (!recipient.asset.contract) {
			errors.push(
				new TransactionError(
					'There is no contract attached to this recipient',
					this.id,
					'.amount',
					this.amount.toString(),
				),
			);
		}
		const sender = store.account.getOrDefault(this.senderId);

		this.executeContract(
			this.prepareContractSandbox(sender, recipient, store),
			recipient.asset.contract,
			errors,
		);

		return errors;
	}

	protected undoAsset(store: StateStore): ReadonlyArray<TransactionError> {
		const errors: TransactionError[] = [];
		
		const recipient = store.account.getOrDefault(this.recipientId);

		recipient.asset.contract = null;

		return errors;
	}

}
