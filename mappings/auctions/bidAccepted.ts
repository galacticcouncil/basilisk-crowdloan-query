import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { getOrCreate } from '../../utils/getOrCreate';

const bidAccepted = async ({
    store,
    event,
    block
}: EventContext & StoreContext) => {
    // let crowdloan = getOrCreate(store, Crowdloan)
}
export default bidAccepted;