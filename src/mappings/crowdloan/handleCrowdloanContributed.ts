import { BN } from '@polkadot/util';
import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Crowdloan as CrowdloanEvents } from '../../types'
import { encodeAccountId } from '../../utils/account';
import { createContribution, ensureCrowdloan, updateCrowdloanFunds } from '../../utils/crowdloan';
import { ownParachainId, updateTotalContributionWeightWithContribution } from '../../utils/incentive';
import { updateParachainFundsPledged } from '../../utils/parachain';

/**
 * Handle the crowloan.Contributed event
 */
const handleCrowdloanContributed = async ({
    store,
    event,
    block
}: EventContext & StoreContext) => {
    const blockHeight = new BN(block.height);
    const { accountId, paraId, balance } = (() => {
        const [accountId, paraId, balance] = new CrowdloanEvents.ContributedEvent(event).params;
        return {
            accountId: encodeAccountId(accountId.toString()),
            paraId: paraId.toString(),
            balance: balance
        }
    })();
    
    // ensure we have a crowdloan to assign to the contribution
    let crowdloan = await ensureCrowdloan(store, paraId);

    // account the current contribution towards the crowdloan raised funds
    await updateCrowdloanFunds(store, crowdloan, balance),

    await updateParachainFundsPledged(store, paraId);

    // handle individual contributions only for our own parachainId
    if (paraId === ownParachainId) {
        const contribution = await createContribution(store, crowdloan, accountId, balance, blockHeight)
        await updateTotalContributionWeightWithContribution(store, blockHeight, contribution);
    }
}
export default handleCrowdloanContributed;
