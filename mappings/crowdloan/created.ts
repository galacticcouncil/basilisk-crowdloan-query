import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Parachain } from '../../generated/model';
import { Crowdloan } from '../../types';
import { getOrCreate } from '../../utils/getOrCreate';

const crowdloanCreated = async ({
    store,
    event,
    block
}: EventContext & StoreContext) => {
    // const [paraId] = new Crowdloan.ContributedEvent(event).params;
    // const parachain = getOrCreate(store, Parachain, paraId)
}