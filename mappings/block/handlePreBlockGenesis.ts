import { ensureChronicle } from "../../utils/chronicle";
import { StoreContext } from '@subsquid/hydra-common'

const handlePreBlockGenesis = async ({
    store
}: StoreContext) => {
    await ensureChronicle(store);
}
export default handlePreBlockGenesis;