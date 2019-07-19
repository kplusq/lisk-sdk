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


/*
   DESCRIPTION: Create events table
   PARAMETERS: None
*/

CREATE TABLE IF NOT EXISTS "events"(
  "id" SERIAL NOT NULL,
  "transactionId" VARCHAR(20) NOT NULL,
  "heightNextExecution" INT NOT NULL,
  "interval" INT NOT NULL,
  "executionsLeft" INT NOT NULL
);
