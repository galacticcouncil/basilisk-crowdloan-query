import { DatabaseManager } from '@subsquid/hydra-common';
import { Crowdloan } from '../generated/model';
import { ensure } from '../utils/ensure';
import { BN } from '@polkadot/util';
import { ensureParachain } from '../utils/parachain';

/**
 * Find or create a crowdloan with default values,
 * using the `paraId` as the unique ID
 */
export const ensureCrowdloan = async (
    store: DatabaseManager,
    paraId: string
): Promise<Crowdloan> => {
    // fetch the parachain associated with the crowdloan
    const parachain = await ensureParachain(store, paraId);
    // ensure the crowdloan with appropriate default parameters
    const crowdloan = await ensure<Crowdloan>(store, Crowdloan, paraId, {
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
export const updateCrowdloanFunds = async (
    store: DatabaseManager,
    crowdloan: Crowdloan,
    newFunds: BN
) => {
    crowdloan.raised = crowdloan.raised.add(newFunds);
    await store.save(crowdloan);
}