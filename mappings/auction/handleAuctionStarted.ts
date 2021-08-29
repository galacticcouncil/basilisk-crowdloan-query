
import { BN } from '@polkadot/util';
import { EventContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Bid } from '../../generated/model';
import { Auctions } from '../../types';
import { updateChronicle } from '../../utils/chronicle';

/**
 * When an auction starts, we need to save its starting block
 * into the Chronicle, in order to retrospectively calculate
 * rewards with a reset BSX multiplier on the UI.
 */
const handleAuctionStarted = async ({
    store,
    block
}: StoreContext & EventContext) => {
    const blockHeight = new BN(block.height);

    await updateChronicle(store, {
        mostRecentAuctionStart: blockHeight
    });
}

export default handleAuctionStarted;