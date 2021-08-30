import { DatabaseManager } from '@subsquid/hydra-common';
import { Parachain, Crowdloan, HistoricalParachainFundsPledged } from '../generated/model';
import { ensure } from '../utils/ensure';
import { BN } from '@polkadot/util';

const blocksPerHour = new BN(600);
// half an hour a.k.a. 300 blocks at 6 seconds per block
// this configuration creates ~2000 entries per 7 days for each parachain
// that exists at the time of the processing
const timeBetweenHistoricalEntries = blocksPerHour.div(new BN(2));

/**
 * Find or create a parachain with default values,
 * using the `paraId` as the unique ID.
 */
export const ensureParachain = async (
    store: DatabaseManager, 
    paraId: string
): Promise<Parachain> => {
    // ensure the parachain with appropriate default parameters
    const parachain = await ensure<Parachain>(store, Parachain, paraId, {
        paraId,
        fundsPledged: (new BN(0)),
        hasWonAnAuction: false,
        historicalFundsPledged: []
    });
    
    // persist the parachain
    await store.save(parachain);
    return parachain;
}

export const updateParachainFundsPledged = async (
    store: DatabaseManager,
    paraId: string
) => {
    const parachain = await store.get(Parachain, {
        where: { paraId }
    });

    const crowdloan = await store.get(Crowdloan, {
        where: { id: paraId },
        relations: ['parachain']
    });

    if (!parachain || !crowdloan) return;

    // Make sure that the pledged funds are only increasing
    if (crowdloan.raised.gt(parachain.fundsPledged)) {
        parachain.fundsPledged = crowdloan.raised;
        await store.save(parachain);
    }
}

export const createHistoricalParachainFundsPledged = async (
    store: DatabaseManager,
    parachain: Parachain,
    blockHeight: BN
) => {
    const id = `${parachain.paraId}-${blockHeight}`;
    
    const historicalParachainFundsPledged = await ensure(
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

export const shouldEnsureHistoricalParachainFundsPledged = async (
    store: DatabaseManager,
    blockHeight: BN,
) => {
    const lastHistoricalEntityBlockHeight = await (async () => {
        const lastHourlyHistoricalParachainFundsPledged = await store.get(HistoricalParachainFundsPledged, {
            order: {
                blockHeight: 'DESC'
            }
        });
        
        return lastHourlyHistoricalParachainFundsPledged?.blockHeight
    })();

    // if there is no last historical entity, create the first one
    if (!lastHistoricalEntityBlockHeight) return true;

    //TODO: fix that first historical entity will be created after `timeBetweenHistoricalEntries` has passed
    // create a new historical entity, since `timeBetweenHistoricalEntries` has passed
    const blocksSinceLastHistoricalEntity = blockHeight.sub(lastHistoricalEntityBlockHeight);
    if (blocksSinceLastHistoricalEntity.gte(timeBetweenHistoricalEntries)) {
        return true;
    }
    
    return false;
}