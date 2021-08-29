import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Bid } from '../../generated/model';
import { Auctions } from '../../types/auctions';
import { ensureBid, upsertBid, upsertFundsPledgedWithWinningBids } from '../../utils/auction';
import { ensure } from '../../utils/ensure';

const handleAuctionBidAccepted = async ({
    store,
    event,
}: EventContext & StoreContext) => {
    const {
        paraId,
        balance,
        leasePeriodStart,
        leasePeriodEnd
    } = (() => {
        const [
            accountId,
            paraId,
            balance,
            leasePeriodStart,
            leasePeriodEnd
        ] = new Auctions.BidAcceptedEvent(event).params

        return {
            accountId: accountId.toString(),
            paraId: paraId.toString(),
            balance,
            leasePeriodStart,
            leasePeriodEnd
        }
    })();

    const { bid, parachain } = await ensureBid(
        store,
        paraId,
        balance,
        leasePeriodStart,
        leasePeriodEnd
    );

    // new balance & parachain for the existing bid
    await upsertBid(
        store,
        bid.id,
        balance,
        parachain
    )
    
    // ensure that the winning bids are accounted for as fundsPledged
    await upsertFundsPledgedWithWinningBids(store);
}
export default handleAuctionBidAccepted;