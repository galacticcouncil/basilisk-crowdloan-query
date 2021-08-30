
import { EventContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Bid } from '../../generated/model';

/**
 * After the auction ends, we assume that all the previous
 * bids are invalid. This prevents the case where a bid that
 * has already won an auction, blocks the bid `id` for the next auction round.
 */
const handleAuctionClosed = async ({
    store
}: StoreContext) => {
    const allBids = await store.getMany(Bid, {});
    const deleteAllBids = allBids.map(bid => store.remove(bid));
    await Promise.all(deleteAllBids);
}

export default handleAuctionClosed;