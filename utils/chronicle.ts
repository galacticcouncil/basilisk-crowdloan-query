import { BN } from '@polkadot/util';
import { ensure } from './ensure';
import { DatabaseManager } from '@subsquid/hydra-common';
import { Chronicle } from "../generated/modules/chronicle/chronicle.model";

export const chronicleID = 'chronicle';
export const ensureChronicle = async (
    store: DatabaseManager,
) => {
    const chronicle = await ensure(store, Chronicle, chronicleID, {
        // just a starting value for the Chronicle
        lastProcessedBlock: new BN(0),
        mostRecentAuctionStart: new BN(0),
        mostRecentAuctionClosingStart: new BN(0)
    });

    await store.save(chronicle);
    return chronicle;
}

export const updateChronicle = async (
    store: DatabaseManager,
    chronicleUpdate: Partial<Chronicle>
) => {
    const chronicle = await ensureChronicle(store);
    Object.assign(chronicle, chronicleUpdate);
    await store.save(chronicle);
}