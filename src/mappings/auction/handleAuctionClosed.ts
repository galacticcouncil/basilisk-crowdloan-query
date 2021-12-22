
import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Auctions } from '../../types';
import { updateChronicle } from '../../utils/chronicle';
import { Bid } from '../../generated/model';

/**
 * After the auction ends, we assume that all the previous
 * bids are invalid. This prevents the case where a bid that
 * has already won an auction, blocks the bid `id` for the next auction round.
 * 
 * also,  we 'arificially' increment mostRecentAuctionIndex after AuctionClosedEvent
 * because there is a period between the most recent AuctionClosed and the 
 * next AuctionStarted event,  and during this period,  we need to 
 * go ahead and calculate rewards modifier(s) based on the next mostRecentAuctionIndex
 * see https://github.com/galacticcouncil/basilisk-crowdloan-query/issues/5#issuecomment-998689028
 * for more thinking around this
 * 
 */
const handleAuctionClosed = async ({
    store,
    event,
}: StoreContext & EventContext) => {

    const allBids = await store.getMany(Bid, {});
    const deleteAllBids = allBids.map(bid => store.remove(bid));
    await Promise.all(deleteAllBids);

    const mostRecentAuctionClosedIndex = (() => {
        const [
            mostRecentAuctionClosedIndex
        ] = new Auctions.AuctionClosedEvent(event).params;
        
        return mostRecentAuctionClosedIndex.toBigInt()
    })();

    await updateChronicle(store, {
        mostRecentAuctionIndex: mostRecentAuctionClosedIndex + BigInt(1)
    });
}

export default handleAuctionClosed;