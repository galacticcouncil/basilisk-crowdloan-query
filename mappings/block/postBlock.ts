import { BN } from '@polkadot/util';
import { BlockContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Parachain } from '../../generated/model';
import { HistoricalParachainFundsPledged } from '../../generated/modules/historical-parachain-funds-pledged/historical-parachain-funds-pledged.model';
import { ensure } from '../../utils/ensure';

const blocksPerHour = new BN(600);
// half an hour a.k.a. 300 blocks at 6 seconds per block
// this configuration creates ~2000 entries per 7 days for each parachain
// that exists at the time of the processing
const timeBetweenHistoricalEntries = blocksPerHour.div(new BN(2));

const createHistoricalParachainFundsPledged = async (
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

const shouldEnsureHistoricalParachainFundsPledged = async (
    store: DatabaseManager,
    blockHeight: BN,
) => {
    const lastHistoricalEntityBlockHeight = await (async () => {
        const lastHourlyHistoricalParachainFundsPledged = await store.get(HistoricalParachainFundsPledged, {
            order: {
                blockHeight: 'DESC'
            }
        });
        
        return lastHourlyHistoricalParachainFundsPledged?.blockHeight || new BN(0)
    })();

    // create a new historical entity, since `timeBetweenHistoricalEntries` has passed
    const blocksSinceLastHistoricalEntity = blockHeight.sub(lastHistoricalEntityBlockHeight);
    if (blocksSinceLastHistoricalEntity.gte(timeBetweenHistoricalEntries)) {
        return true;
    }
    
    return false;
}

const handlePostBlock = async ({
    store,
    block
}: BlockContext & StoreContext) => {
    const blockHeight = new BN(block.height);

    // check last historical entry is older >= 1hr
    // if you do this per parachain, you will end up with time discrepancies since the parachains are created at different times
    const shouldEnsureHistoricalEntity = await shouldEnsureHistoricalParachainFundsPledged(store, blockHeight);

    // the most recent historical entity is not older than 1 hour, do not create a new historical entity yet
    if(!shouldEnsureHistoricalEntity) return;

    // TODO: eventually filter out parachains that already have a slot leased to increase performance
    // we're not interested in historical balances of already leased out parachains
    const parachains = await store.getMany<Parachain>(Parachain, {});

    // create a historical entry for each parachain's funds pledged
    const historicalFundsPledgedQueries = parachains.map(parachain => {
        return createHistoricalParachainFundsPledged(store, parachain, blockHeight);
    });

    await Promise.all(historicalFundsPledgedQueries);
}

export default handlePostBlock;