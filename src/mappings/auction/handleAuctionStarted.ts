
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
    event,
    block
}: StoreContext & EventContext) => {
    const blockHeight = new BN(block.height);

    const mostRecentAuctionClosingStart = (() => {
        const [
            auctionIndex, 
            leasePeriod, 
            mostRecentAuctionClosingStart
        ] = new Auctions.AuctionStartedEvent(event).params;
        
        return mostRecentAuctionClosingStart;
    })();

    await updateChronicle(store, {
        mostRecentAuctionStart: blockHeight,
        mostRecentAuctionClosingStart
    });
}

export default handleAuctionStarted;