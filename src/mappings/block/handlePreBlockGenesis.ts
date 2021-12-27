import { ensureChronicle } from "../../utils/chronicle";
import { StoreContext } from '@subsquid/hydra-common'
import { ensureCrowdloan, updateCrowdloanFunds } from "../../utils/crowdloan";
import { updateParachainFundsPledged } from "../../utils/parachain";
import batch2auction from "./preBlockGenesis.json"

const handlePreBlockGenesis = async ({
    store
}: StoreContext) => {
    const migrationPromises = batch2auction.map(async parachain => {
        // ensure we have a crowdloan to assign to the contribution
        let crowdloan = await ensureCrowdloan(store, String(parachain.paraId));
        // account the current contribution towards the crowdloan raised funds
        await updateCrowdloanFunds(store, crowdloan, BigInt(parachain.raised)),
        await updateParachainFundsPledged(store, String(parachain.paraId));
    })
    await Promise.all(migrationPromises);

    await ensureChronicle(store);
}
export default handlePreBlockGenesis;