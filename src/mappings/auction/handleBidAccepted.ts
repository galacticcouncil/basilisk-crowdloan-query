import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Bid } from '../../generated/model';
import { Auctions } from '../../types/auctions';
import { ensureBid, updateBid, upsertFundsPledgedWithWinningBids } from '../../utils/auction';
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
            paraId: paraId.toString(),
            balance: balance.toBigInt(),
            leasePeriodStart: leasePeriodStart.toBigInt(),
            leasePeriodEnd: leasePeriodEnd.toBigInt()
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
    await updateBid(
        store,
        bid.id,
        balance,
        parachain
    )
    
    // ensure that the winning bids are accounted for as fundsPledged
    await upsertFundsPledgedWithWinningBids(store);
}
export default handleAuctionBidAccepted;