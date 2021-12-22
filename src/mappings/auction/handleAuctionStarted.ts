
import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Auctions } from '../../types';
import { updateChronicle } from '../../utils/chronicle';

/**
 * When an auction starts, we need to save its starting block
 * into the Chronicle, in order to calculate
 * rewards.
 */
const handleAuctionStarted = async ({
    store,
    event,
    block
}: StoreContext & EventContext) => {
    const blockHeight = BigInt(block.height);

    const [ mostRecentAuctionIndex, mostRecentAuctionClosingStart ] = (() => {
        const [
            mostRecentAuctionIndex,
            leasePeriod,
            mostRecentAuctionClosingStart
        ] = new Auctions.AuctionStartedEvent(event).params;
        
        return [ mostRecentAuctionIndex.toBigInt(), mostRecentAuctionClosingStart.toBigInt() ]
    })();

    await updateChronicle(store, {
        mostRecentAuctionIndex,
        mostRecentAuctionStart: blockHeight,
        mostRecentAuctionClosingStart
    });
}

export default handleAuctionStarted;