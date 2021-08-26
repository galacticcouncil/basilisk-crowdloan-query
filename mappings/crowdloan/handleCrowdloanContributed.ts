import { BN } from '@polkadot/util';
import { EventContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Contribution, Parachain, Crowdloan, Account } from '../../generated/model';
import { HistoricalParachainFundsPledged } from '../../generated/modules/historical-parachain-funds-pledged/historical-parachain-funds-pledged.model';
import { Crowdloan as CrowdloanEvents } from '../../types'
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
        fundsPledged: (new BN(0)),
        historicalFundsPledged: []
    });
    
    // persist the parachain
    await store.save(parachain);
    return parachain;
}

/**
 * Find or create an account based on the accountId (= address)
 */
const ensureAccount = async (
    store: DatabaseManager,
    accountId: string,
): Promise<Account> => {
    const account = await getOrCreate<Account>(store, Account, accountId, {
        accountId,
        // if we see the account for the first time, we assume
        // it made no contributions so far, otherwise we would have persisted it already
        contributions: []
    });

    // persist the account
    await store.save(account);
    return account;
}

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
const updateCrowdloanFunds = async (
    store: DatabaseManager,
    crowdloan: Crowdloan,
    newFunds: BN
) => {
    crowdloan.raised = crowdloan.raised.add(newFunds);
    await store.save(crowdloan);
}

const blocksPerHour = new BN(600);
const upsertHistoricalParachainFundsPledged = async (
    store: DatabaseManager,
    parachain: Parachain,
    blockHeight: BN
) => {
    const id = `${parachain.paraId}-${blockHeight}`;
    console.log('seaerching for historical entity', parachain.paraId);
    // FIX: always returns undefined, fix the query
    const lastHourlyHistoricalParachainFundsPledged = await store.get(HistoricalParachainFundsPledged, {
        where: {
            parachain: {
                paraId: parachain.paraId
            }
        },
        relations: ['parachain']
    });

    console.log('lastHourlyHistoricalParachainFundsPledged', {
        where: {
            parachain: {
                paraId: parachain.paraId
            },
            hourly: true
        },
        order: {
            blockHeight: 'DESC'
        },
        
    }, lastHourlyHistoricalParachainFundsPledged);

    const shouldEnsureNewHistoricalEntity = (() => {
        // if there is no historical entity, create the first one
        if (!lastHourlyHistoricalParachainFundsPledged) {
            console.log('no historical');
            return true
        }
        // only updating the current historical entity
        // NOTE: could also just compare the IDs of the tntities.
        if (blockHeight.eq(lastHourlyHistoricalParachainFundsPledged.blockHeight)) {
            console.log('blockHeight equal');
            return true;
        }

        // create a new historical entity, since 600 blocks / 1 hour has passed
        const blocksSinceLastHistoricalEntity = blockHeight.sub(lastHourlyHistoricalParachainFundsPledged.blockHeight);
        if (blocksSinceLastHistoricalEntity.lte(blocksPerHour)) {
            console.log('1hr passed');
            return true;
        }
        
        return false;
    })();
    
    console.log('shouldEnsureNewHistoricalEntity', shouldEnsureNewHistoricalEntity);
    if (!shouldEnsureNewHistoricalEntity) return;

    const historicalParachainFundsPledged = await getOrCreate(
        store,
        HistoricalParachainFundsPledged,
        id, {
            parachain,
            blockHeight,
            fundsPledged: new BN(0)
        }
    );

    historicalParachainFundsPledged.fundsPledged = parachain.fundsPledged;

    await store.save(historicalParachainFundsPledged);
}

const updateParachainFundsPledged = async (
    store: DatabaseManager,
    paraId: string,
    blockHeight: BN
) => {
    const parachain = await store.get(Parachain, {
        where: { paraId }
    });

    const crowdloan = await store.get(Crowdloan, {
        where: { id: paraId }, // TODO: figure out how to query through relations as well
        relations: ['parachain']
    });

    if (!parachain || !crowdloan) return;

    // Make sure that the pledged funds are only increasing
    if (crowdloan.raised.gt(parachain.fundsPledged)) {
        parachain.fundsPledged = crowdloan.raised;
        await store.save(parachain);
        await upsertHistoricalParachainFundsPledged(store, parachain, blockHeight)
    }
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

    // account the current contribution towards the crowdloan raised funds
    await updateCrowdloanFunds(store, crowdloan, balance);
    // persist the contribution as its own entity
    await createContribution(store, crowdloan, accountId, balance, blockHeight);

    // TODO: do this every block, mark hourly aggregates
    await updateParachainFundsPledged(store, paraId, blockHeight);
}
export default handleCrowdloanContributed;
