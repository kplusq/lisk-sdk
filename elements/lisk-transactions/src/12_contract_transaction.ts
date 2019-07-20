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
import * as BigNum from '@liskhq/bignum';
import { getAddressFromPublicKey } from '@liskhq/lisk-cryptography';
import {
	BaseTransaction,
	StateStore,
	StateStorePrepare,
} from './base_transaction';
import { convertToAssetError, TransactionError } from './errors';
import { TransactionJSON } from './transaction_types';
import {
	validateAddress,
	validateTransferAmount,
	validator,
	verifyAmountBalance,
	verifyBalance,
} from './utils';

export interface ContractAsset {
	readonly contract: number;
}

export const contractFormatSchema = {
	type: 'object',
	properties: {
		contract: {
			type: 'string',
		},
	},
};

export class ContractTransaction extends BaseTransaction {
	public readonly asset: ContractAsset;
	public static TYPE = 12;
	public static FEE = '100000000';

	public constructor(rawTransaction: unknown) {
		super(rawTransaction);
		const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
			? rawTransaction
			: {}) as Partial<TransactionJSON>;
		// Initializes to empty object if it doesn't exist
		this.asset = (tx.asset || {}) as ContractAsset;
	}

	protected assetToBytes(): Buffer {
		const { contract } = this.asset;

		const contractBuffer = Buffer.from(contract.toString(), 'hex');

		return Buffer.concat([
			new Uint8Array(contractBuffer),
		]);
	}

	public async prepare(store: StateStorePrepare): Promise<void> {
		Promise.all([
			await store.account.cache([
				{
					address: this.senderId,
				},
				{
					address: this.recipientId,
				},
			]),
			await store.event.cache([
				{
					transactionId: this.id,
				},
			]),
		]);
	}

	// tslint:disable-next-line prefer-function-over-method
	protected verifyAgainstTransactions(
		_: ReadonlyArray<TransactionJSON>,
	): ReadonlyArray<TransactionError> {
		return [];
	}

	protected validateAsset(): ReadonlyArray<TransactionError> {
		validator.validate(contractFormatSchema, this.asset);
		const errors = convertToAssetError(
			this.id,
			validator.errors,
		) as TransactionError[];

		if (!this.recipientId) {
			errors.push(
				new TransactionError(
					'`recipientId` must be provided.',
					this.id,
					'.recipientId',
				),
			);
		}

		try {
			validateAddress(this.recipientId);
		} catch (error) {
			errors.push(
				new TransactionError(
					error.message,
					this.id,
					'.recipientId',
					this.recipientId,
				),
			);
		}

		if (this.recipientPublicKey) {
			const calculatedAddress = getAddressFromPublicKey(
				this.recipientPublicKey,
			);
			if (this.recipientId !== calculatedAddress) {
				errors.push(
					new TransactionError(
						'recipientId does not match recipientPublicKey.',
						this.id,
						'.recipientId',
						this.recipientId,
						calculatedAddress,
					),
				);
			}
		}

		return errors;
	}

	protected applyAsset(store: StateStore): ReadonlyArray<TransactionError> {
		const errors: TransactionError[] = [];

		const recipient = store.account.getOrDefault(this.recipientId);

		if (recipient.asset.contract) {

			errors.push(
				new TransactionError(
					'You cannot really change the contract you made with others',
					this.id,
					'.amount',
					this.amount.toString(),
				),
			);
		}

		const updatedRecipient = {
			...recipient,
			asset: this.asset.contract,
		};
		store.account.set(updatedRecipient.address, updatedRecipient);

		return errors;
	}

	protected undoAsset(store: StateStore): ReadonlyArray<TransactionError> {
		const errors: TransactionError[] = [];
		
		const recipient = store.account.getOrDefault(this.recipientId);

		recipient.asset.contract = null;

		return errors;
	}

	// tslint:disable:next-line: prefer-function-over-method no-any
	protected assetFromSync(raw: any): object | undefined {
		if (raw.contract) {
			// This line will throw if there is an error

			return {
				coontract: raw.contract,
			};
		}

		return undefined;
	}
}
