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
import * as os from 'os';
import { HashMap, InitOptions } from './api_types';
import * as constants from './constants';
import { AccountsResource } from './resources/accounts';
import { BlocksResource } from './resources/blocks';
import { DappsResource } from './resources/dapps';
import { DelegatesResource } from './resources/delegates';
import { NodeResource } from './resources/node';
import { PeersResource } from './resources/peers';
import { SignaturesResource } from './resources/signatures';
import { TransactionsResource } from './resources/transactions';
import { VotersResource } from './resources/voters';
import { VotesResource } from './resources/votes';

const defaultOptions = {
	bannedNodes: [],
	randomizeNodes: true,
};

const commonHeaders: HashMap = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
};

const getClientHeaders = (clientOptions: ClientOptions): HashMap => {
	const { name = '????', version = '????', engine = '????' } = clientOptions;

	const liskElementsInformation =
		'LiskElements/1.0 (+https://github.com/LiskHQ/lisk-elements)';
	const locale: string | undefined =
		process.env.LC_ALL ||
		process.env.LC_MESSAGES ||
		process.env.LANG ||
		process.env.LANGUAGE;
	const systemInformation = `${os.platform()} ${os.release()}; ${os.arch()}${
		locale ? `; ${locale}` : ''
	}`;

	return {
		'User-Agent': `${name}/${version} (${engine}) ${liskElementsInformation} ${systemInformation}`,
	};
};

export interface ClientOptions {
	readonly engine?: string;
	readonly name?: string;
	readonly version?: string;
}

/**
 * The Lisk Elements API Client provides a convenient wrapper for interacting with the public API of nodes on the Lisk network.
 *
 * ## Installation
 *
 * Add Lisk Client as a dependency of your project:
 *
 * ```bash
 * $ npm install --save @liskhq/lisk-api-client
 * ```
 *
 * ## Upgrade
 *
 * ```bash
 * npm update --save @liskhq/lisk-api-client
 * ```
 *
 * ## APIClient
 *
 * We expose a constructor, which takes an array of nodes, and optionally an options object. For convenience, we provide helper functions for creating API clients on specific networks with a default set of nodes. We recommend using these functions unless you operate your own nodes, or have good reasons to prefer nodes provided by a third party. *If you use the generic constructor, it is your responsibility to ensure that the nodes you specify are on the correct network.*
 *
 * ### Syntax
 *
 * ```js
 * new APIClient(nodes, [options])
 * APIClient.createMainnetAPIClient([options])
 * APIClient.createTestnetAPIClient([options])
 * ```
 *
 * ### Examples
 *
 * ```js
 * import * as APIClient from '@liskhq/lisk-api-client';
 *
 * const client = new APIClient(['https://node01.lisk.io:443', 'https://node02.lisk.io:443']);
 * const clientWithOptions = new APIClient(
 * ['https://node01.lisk.io:443', 'https://node02.lisk.io:443'],
 * {
 *    bannedNodes: ['https://my.faultynode.io:443'],
 *    client: {
 *       name: 'My Lisk Client',
 *       version: '1.2.3',
 *       engine: 'Some custom engine',
 *    },
 *    nethash: '9a9813156bf1d2355da31a171e37f97dfa7568187c3fd7f9c728de8f180c19c7',
 *    node: 'https://my.preferrednode.io:443',
 *    randomizeNodes: false,
 *    });
 *
 * const mainnetClient = APIClient.createMainnetAPIClient();
 * const testnetClient = APIClient.createTestnetAPIClient();
 * ```
 */
export class APIClient {
	/**
	 * ## Constants
	 *
	 * API-specific constants are available via the `APIClient` constructor, and include relevant HTTP methods and lists of default nodes.
	 *
	 * ### Examples
	 *
	 * ```js
	 * import APIClient from '@liskhq/lisk-api-client';
	 *
	 * APIClient.constants.GET; // 'GET'
	 * APIClient.constants.POST; // 'POST'
	 * APIClient.constants.PUT; // 'PUT'
	 *
	 * APIClient.constants.TESTNET_NETHASH; // Nethash for Testnet.
	 * APIClient.constants.MAINNET_NETHASH; // Nethash for Mainnet.
	 *
	 * APIClient.constants.TESTNET_NODES; // Array of default Testnet nodes.
	 * APIClient.constants.MAINNET_NODES; // Array of default Mainnet nodes.
	 * ```
	 */
	public static get constants(): typeof constants {
		return constants;
	}

	public static createMainnetAPIClient(options?: InitOptions): APIClient {
		return new APIClient(constants.MAINNET_NODES, {
			nethash: constants.MAINNET_NETHASH,
			...options,
		});
	}

	public static createTestnetAPIClient(options?: InitOptions): APIClient {
		return new APIClient(constants.TESTNET_NODES, {
			nethash: constants.TESTNET_NETHASH,
			...options,
		});
	}

	public accounts: AccountsResource;
	public bannedNodes!: ReadonlyArray<string>;
	public blocks: BlocksResource;
	public currentNode!: string;
	public dapps: DappsResource;
	public delegates: DelegatesResource;
	public headers!: HashMap;
	public node: NodeResource;
	public nodes!: ReadonlyArray<string>;
	public peers: PeersResource;
	public randomizeNodes!: boolean;
	public signatures: SignaturesResource;
	public transactions: TransactionsResource;
	public voters: VotersResource;
	public votes: VotesResource;

	public constructor(
		nodes: ReadonlyArray<string>,
		providedOptions: InitOptions = {},
	) {
		this.initialize(nodes, providedOptions);
		this.accounts = new AccountsResource(this);
		this.blocks = new BlocksResource(this);
		this.dapps = new DappsResource(this);
		this.delegates = new DelegatesResource(this);
		this.node = new NodeResource(this);
		this.peers = new PeersResource(this);
		this.signatures = new SignaturesResource(this);
		this.transactions = new TransactionsResource(this);
		this.voters = new VotersResource(this);
		this.votes = new VotesResource(this);
	}

	public banActiveNode(): boolean {
		return this.banNode(this.currentNode);
	}

	/**
	 * Bans the current node and selects a new random (non-banned) node.
	 *
	 * ### Usage Exmaple
	 *
	 * ```ts
	 * client.banActiveNodeAndSelect()
	 * ```
	 */
	public banActiveNodeAndSelect(): boolean {
		const banned = this.banActiveNode();
		if (banned) {
			this.currentNode = this.getNewNode();
		}

		return banned;
	}

	/**
	 * Adds a node to the list of banned nodes. Banned nodes will not be chosen to replace an unreachable node.
	 *
	 * ### Usage Exmaple
	 *
	 * ```ts
	 * client.banNode('https://my.faultynode.io:443');
	 * ```
	 */
	public banNode(node: string): boolean {
		if (!this.isBanned(node)) {
			this.bannedNodes = [...this.bannedNodes, node];

			return true;
		}

		return false;
	}

	/**
	 * Selects a random node that has not been banned.
	 *
	 * ### Usage Exmaple
	 *
	 * ```ts
	 * const randomNode = client.getNewNode();
	 * ```
	 */
	public getNewNode(): string {
		const nodes = this.nodes.filter(
			(node: string): boolean => !this.isBanned(node),
		);

		if (nodes.length === 0) {
			throw new Error('Cannot get new node: all nodes have been banned.');
		}

		const randomIndex = Math.floor(Math.random() * nodes.length);

		return nodes[randomIndex];
	}

	/**
	 * Tells you whether all the nodes have been banned or not.
	 *
	 * ### Usage Exmaple
	 *
	 * ```ts
	 * const moreNodesNeeded = !client.hasAvailableNodes();
	 * ```
	 */
	public hasAvailableNodes(): boolean {
		return this.nodes.some((node: string): boolean => !this.isBanned(node));
	}

	/**
	 * Initialises the client instance with an array of nodes and an optional configuration object.
	 * This is called in the constructor, but can be called again later if necessary.
	 * (Note that in practice it is usually easier just to create a new instance.)
	 *
	 * ### Usage Exmaple
	 *
	 * ```ts
	 * client.initialize(['https://node01.lisk.io:443', 'https://node02.lisk.io:443']);
	 * client.initialize(
	 * ['https://node01.lisk.io:443', 'https://node02.lisk.io:443'],
	 * {
	 *    bannedNodes: ['https://my.faultynode.io:443'],
	 *    client: {
	 *       name: 'My Lisk Client',
	 *       version: '1.2.3',
	 *       engine: 'Some custom engine',
	 *    },
	 *    nethash: '9a9813156bf1d2355da31a171e37f97dfa7568187c3fd7f9c728de8f180c19c7',
	 *    node: 'https://my.preferrednode.io:443',
	 *    randomizeNodes: false,
	 * });
	 * ```
	 */
	public initialize(
		nodes: ReadonlyArray<string>,
		providedOptions: InitOptions = {},
	): void {
		if (!Array.isArray(nodes) || nodes.length <= 0) {
			throw new Error('APIClient requires nodes for initialization.');
		}

		if (typeof providedOptions !== 'object' || Array.isArray(providedOptions)) {
			throw new Error(
				'APIClient takes an optional object as the second parameter.',
			);
		}

		const options: InitOptions = { ...defaultOptions, ...providedOptions };

		this.headers = {
			...commonHeaders,
			...(options.nethash ? { nethash: options.nethash } : {}),
			...(options.client ? getClientHeaders(options.client) : {}),
		};

		this.nodes = nodes;
		this.bannedNodes = [...(options.bannedNodes || [])];
		this.currentNode = options.node || this.getNewNode();
		this.randomizeNodes = options.randomizeNodes !== false;
	}

	/**
	 * Tells you whether a specific node has been banned or not.
	 *
	 * ### Usage Exmaple
	 *
	 * ```ts
	 * const banned = client.isBanned('https://node01.lisk.io:443');
	 * ```
	 */
	public isBanned(node: string): boolean {
		return this.bannedNodes.includes(node);
	}
}
