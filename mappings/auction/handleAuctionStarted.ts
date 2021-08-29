
import { EventContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Bid } from '../../generated/model';

/**
 * When an auction starts, we need to save its starting block
 * into the Chronicle, in order to retrospectively calculate
 * rewards with a reset BSX multiplier on the UI.
 */
const handleAuctionStarted = async ({
    store,
    event
}: StoreContext & EventContext) => {
    const allBids = await store.getMany(Bid, {});
    const deleteAllBids = allBids.map(bid => store.remove(bid));
    return Promise.all(deleteAllBids);
}

export default handleAuctionStarted;