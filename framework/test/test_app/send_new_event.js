const transactions = require('@liskhq/lisk-transactions');
const { EventTransaction } = require('../../../elements/lisk-transactions');


/**
 *  To directly send the printed transaction:
 *  > node print_sendable_cashback.js | curl -X POST -H "Content-Type: application/json" -d @- localhost:4000/api/transactions
 *  Note: An node needs to run on port 4000 (the default one) before. If the node runs on a different port, adjust the query accordingly.
 */

const tx = new EventTransaction({
    amount: `${transactions.utils.convertLSKToBeddows('2')}`,
    fee: `${transactions.utils.convertLSKToBeddows('0.1')}`,
    recipientId: '10881167371402274308L', //delegate genesis_100
    timestamp: 0,
    asset: {
        interval: 2,
        count: 2,
    },
});

tx.sign('wagon stock borrow episode laundry kitten salute link globe zero feed marble');

console.log(tx.stringify());