import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Auctions } from '../../types/auctions';
import { ensureBid, upsertBid } from '../../utils/auction';
import { ensure } from '../../utils/ensure';

const handleAuctionBidAccepted = async ({
    store,
    event,
    block
}: EventContext & StoreContext) => {
    const {
        accountId,
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
}
export default handleAuctionBidAccepted;