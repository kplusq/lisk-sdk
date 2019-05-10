/*
 * Copyright © 2019 Lisk Foundation
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

/**
 * Main block_header logic.
 *
 * @class
 * @memberof logic
 * @see Parent: {@link logic}
 * @requires lodash
 * @requires helpers/bignum
 * @param {string} blockID
 * @param {number} height
 * @param {number} heightPrevious
 * @param {number} heightPrevoted
 * @param {number} heightSinceActive
 * @param {string} delegatePubKey
 */
class BlockHeader {
	constructor(
        blockID,
        height,
        heightPrevious,
        heightPrevoted,
        heightSinceActive,
        delegatePubKey
    ) {
		// Hash of the blockheader
        this.blockID = blockID;
        // Height of the block
        this.height = height;
        // Largest height at which delegate previously forged a block, see LIP/paper
        this.heightPrevious = heightPrevious;
        // Largest height of a block in the current chain (up to the predecessor of this block) that has at least 68 prevotes
        this.heightPrevoted = heightPrevoted;
        // Height since when the delegate has been continuously active,
        // i.e., the first block of that round since when the delegate is continuosly active
        // note that this information is typically obtained from a separate data structure
        // and only put here for convenience
        this.heightSinceActive = heightSinceActive; // TBD if included or not
        // Public key of delegate forging the block
        this.delegatePubKey = delegatePubKey;
	}
}

// Export
module.exports = BlockHeader;
