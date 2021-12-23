import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Slots } from '../../types/Slots';
import { ownParachainId } from '../../utils/incentive';
import { ensureParachain } from '../../utils/parachain';

const handleSlotsLeased = async ({
    store,
    event,
    block
}: EventContext & StoreContext) => {
    const paraId = (() => {
        const [paraId] = new Slots.LeasedEvent(event).params;
        return paraId.toString();
    })();

    const parachain = await ensureParachain(store, paraId);

    // parachain received a slot lease, discard it for sibling calculation down the road
    parachain.hasWonAnAuction = true;
    await store.save(parachain);
}
export default handleSlotsLeased;
