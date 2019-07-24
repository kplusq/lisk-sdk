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

import { P2PPeerInfo } from './p2p_types';

export const constructPeerIdFromPeerInfo = (peerInfo: P2PPeerInfo): string =>
	`${peerInfo.ipAddress}:${peerInfo.wsPort}`;

// TODO: This needs to be replaced with LIP implementaion of geting bucket for a peer
export const getBucket = (
	_ipAddress: string,
	_secret: number,
	_bucketSize: number,
	// tslint:disable-next-line:no-magic-numbers
): number => Math.floor(Math.random() * 64);
