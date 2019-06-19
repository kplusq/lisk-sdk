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
import { GET } from '../constants';

export class AccountsResource extends APIResource {
	/**
	 * Searches for matching accounts in the system.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.get({ username: 'oliver' }
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public get: APIHandler;

	/**
	 * Searches for the specified account in the system and responds with a list of the multisignature groups that this account is a member of.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getMultisignatureGroups('15434119221255134066L')
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getMultisignatureGroups: APIHandler;

	/**
	 * Searches for the specified multisignature group and responds with a list of all members of this particular multisignature group.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getMultisignatureMemberships('15434119221255134066L')
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getMultisignatureMemberships: APIHandler;
	public path: string;

	public constructor(apiClient: APIClient) {
		super(apiClient);
		this.path = '/accounts';

		this.get = apiMethod({
			method: GET,
		}).bind(this);

		this.getMultisignatureGroups = apiMethod({
			method: GET,
			path: '/{address}/multisignature_groups',
			urlParams: ['address'],
		}).bind(this);

		this.getMultisignatureMemberships = apiMethod({
			method: GET,
			path: '/{address}/multisignature_memberships',
			urlParams: ['address'],
		}).bind(this);
	}
}
