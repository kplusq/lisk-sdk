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

export class DelegatesResource extends APIResource {
	/**
	 * Searches for a specified dapp in the system.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.get({ username: 'oliver' })
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public get: APIHandler;

	/**
	 * Returns a list of the next forgers in this delegate round.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getForgers()
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getForgers: APIHandler;

	/**
	 * By passing an existing delegate address and the desired unix timestamps, you can get its forging statistics within the specified timespan.
	 * If no timestamps are provided, it will use the timestamps from Lisk epoch to current date.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getForgingStatistics('15434119221255134066L')
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getForgingStatistics: APIHandler;

	/**
	 * Calls get with default parameters to retrieve delegates from rank 102 onwards.
	 *
	 * ### Usage Example
	 * ```ts
	 * client.accounts.getStandby()
	 *   .then(res => {
	 *     console.log(res.data);
	 * });
	 * ```
	 */
	public getStandby: APIHandler;
	public path: string;

	public constructor(apiClient: APIClient) {
		super(apiClient);
		this.path = '/delegates';

		this.get = apiMethod({
			defaultData: {
				sort: 'rank:asc',
			},
			method: GET,
		}).bind(this);

		this.getStandby = apiMethod({
			defaultData: {
				offset: 101,
				sort: 'rank:asc',
			},
			method: GET,
		}).bind(this);

		this.getForgers = apiMethod({
			method: GET,
			path: '/forgers',
		}).bind(this);

		this.getForgingStatistics = apiMethod({
			method: GET,
			path: '/{address}/forging_statistics',
			urlParams: ['address'],
		}).bind(this);
	}
}
