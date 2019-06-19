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
import { APIClient } from '../api_client';
import { apiMethod } from '../api_method';
import { APIResource } from '../api_resource';
import { APIHandler } from '../api_types';
import { GET, PUT } from '../constants';

export class NodeResource extends APIResource {
	/**
	 * Returns all current constants data on the system, e.g. Lisk epoch time and version.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getConstants()
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getConstants: APIHandler;

	/**
	 * *Attention! This is a private endpoint only authorized to whitelisted IPs.*
	 *
	 * Responds with the forging status of a delegate on a node.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getForgingStatus()
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getForgingStatus: APIHandler;

	/**
	 * Returns all current status data of the node, e.g. height and broadhash.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getStatus()
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getStatus: APIHandler;

	/**
	 * By specifying the state of the transactions, you get a list of unprocessed transactions matching this state.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getTransactions('unconfirmed')
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getTransactions: APIHandler;
	public path: string;

	/**
	 * *Attention! This is a private endpoint only authorized to whitelisted IPs.*
	 *
	 * Upon passing the correct password and publicKey, forging will be enabled or disabled for the delegate of this particular node.
	 * The password can be generated locally by encrypting your passphrase, either by using Lisk Commander or with Lisk Elements.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.updateForgingStatus({
	 *   forging: true,
	 *   password: 'happy tree friends',
	 *   publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
	 * })
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public updateForgingStatus: APIHandler;

	public constructor(apiClient: APIClient) {
		super(apiClient);
		this.path = '/node';

		this.getConstants = apiMethod({
			method: GET,
			path: '/constants',
		}).bind(this);

		this.getStatus = apiMethod({
			method: GET,
			path: '/status',
		}).bind(this);

		this.getForgingStatus = apiMethod({
			method: GET,
			path: '/status/forging',
		}).bind(this);

		this.updateForgingStatus = apiMethod({
			method: PUT,
			path: '/status/forging',
		}).bind(this);

		this.getTransactions = apiMethod({
			method: GET,
			path: '/transactions/{state}',
			Params: ['state'],
		}).bind(this);
	}
}
