import { BN } from '@polkadot/util';
import { EventContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Contribution, Parachain, Crowdloan, Account } from '../../generated/model';
import { Crowdloan as CrowdloanEvents } from '../../types';
import { getOrCreate } from '../../utils/getOrCreate';

/**
 * Find or create a parachain with default values,
 * using the `paraId` as the unique ID.
 */
const ensureParachain = async (
    store: DatabaseManager, 
    paraId: string
): Promise<Parachain> => {
    // ensure the parachain with appropriate default parameters
    const parachain = await getOrCreate<Parachain>(store, Parachain, paraId, {
        paraId,
        fundsPledged: (new BN(0))
    });
    
    // persist the parachain
    await store.save(parachain);
    return parachain;
}

const ensureAccount = async (
    store: DatabaseManager,
    accountId: string,
): Promise<Account> => {
    const account = await getOrCreate<Account>(store, Account, accountId, {
        accountId,
        contributions: []
    });

    // persist the account
    await store.save(account);
    return account;
}

const createContribution = async (
    store: DatabaseManager,
    crowdloan: Crowdloan,
    accountId: string,
    balance: BN,
    blockHeight: BN
): Promise<Contribution> => {
    // alternatively use UUID to generate a unique ID for the entity
    const id = await (async () => {
        const userContributions = await store.getMany(Contribution, {
            where: { accountId }
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
 * Find or create a crowdloan with default values,
 * using the `paraId` as the unique ID
 */
const ensureCrowdloan = async (
    store: DatabaseManager,
    paraId: string
): Promise<Crowdloan> => {
    // fetch the parachain associated with the crowdloan
    const parachain = await ensureParachain(store, paraId);
    // ensure the crowdloan with appropriate default parameters
    const crowdloan = await getOrCreate<Crowdloan>(store, Crowdloan, paraId, {
        parachain,
        contributions: [],
        raised: new BN(0)
    });
        
    // persist the crowdloan
    await store.save(crowdloan);
    return crowdloan;
}

/**
 * Increment raised funds of the given crowdloan,
 * by the given amount.
 */
const addCrowdloanFunds = async (
    store: DatabaseManager,
    crowdloan: Crowdloan,
    newFunds: BN
) => {
    crowdloan.raised = crowdloan.raised.add(newFunds);
    await store.save(crowdloan);
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
    
    const crowdloan = await ensureCrowdloan(store, paraId);

    await addCrowdloanFunds(store, crowdloan, balance);
    await createContribution(store, crowdloan, accountId, balance, blockHeight);    
}
export default handleCrowdloanContributed;