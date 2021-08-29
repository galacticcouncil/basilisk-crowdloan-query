import { BN } from '@polkadot/util';
import { EventContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Contribution, Crowdloan } from '../../generated/model';
import { Crowdloan as CrowdloanEvents } from '../../types'
import { ensureAccount } from '../../utils/account';
import { ensureCrowdloan, updateCrowdloanFunds } from '../../utils/crowdloan';
import { updateParachainFundsPledged } from '../../utils/parachain';

/**
 * Create a new contribution and assign all the useful relationships to it
 */
const createContribution = async (
    store: DatabaseManager,
    crowdloan: Crowdloan,
    accountId: string,
    balance: BN,
    blockHeight: BN
): Promise<Contribution> => {
    // alternatively use UUID to generate a unique ID for the entity
    // calculate an incremental ID based on 
    // the count of existing user's contributions to this parachain/crowdloan
    const id = await (async () => {
        const userContributions = await store.getMany(Contribution, {
            where: { 
                accountId
            }
        });

        return `${accountId}-${userContributions.length}`;
    })();

    const account = await ensureAccount(store, accountId);

    const contribution = new Contribution({
        id,
        crowdloan,
        account,
        balance,
        blockHeight
    });

    await store.save(contribution);
    return contribution;
}

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
            accountId: accountId.toString(),
            paraId: paraId.toString(),
            balance: balance
        }
    })();
    
    // ensure we have a crowdloan to assign to the contribution
    let crowdloan = await ensureCrowdloan(store, paraId);

    await Promise.all([
        // account the current contribution towards the crowdloan raised funds
        await updateCrowdloanFunds(store, crowdloan, balance),
        // persist the contribution as its own entity
        await createContribution(store, crowdloan, accountId, balance, blockHeight)
    ]);

    // TODO: do this every block, mark hourly aggregates
    await updateParachainFundsPledged(store, paraId);
}
export default handleCrowdloanContributed;
