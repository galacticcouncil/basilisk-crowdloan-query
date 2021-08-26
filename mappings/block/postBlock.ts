import { BN } from '@polkadot/util';
import { EventContext, BlockContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Contribution, Parachain, Crowdloan, Account } from '../../generated/model';
import { HistoricalParachainFundsPledged } from '../../generated/modules/historical-parachain-funds-pledged/historical-parachain-funds-pledged.model';
import { Crowdloan as CrowdloanEvents } from '../../types'
import { getOrCreate } from '../../utils/getOrCreate';

const blocksPerHour = new BN(600);
const createHistoricalParachainFundsPledged = async (
    store: DatabaseManager,
    parachain: Parachain,
    blockHeight: BN
) => {
    const id = `${parachain.paraId}-${blockHeight}`;
    // FIX: always returns undefined, fix the query
    const lastHourlyHistoricalParachainFundsPledged = await store.get(HistoricalParachainFundsPledged, {
        where: {
            parachain: {
                paraId: parachain.paraId
            }
        },
        relations: ['parachain'],
        order: {
            blockHeight: 'DESC'
        }
    });

    const shouldEnsureNewHistoricalEntity = (() => {
        // if there is no historical entity, create the first one
        if (!lastHourlyHistoricalParachainFundsPledged) {
            return true
        }
        // only updating the current historical entity
        // NOTE: could also just compare the IDs of the tntities.
        if (blockHeight.eq(lastHourlyHistoricalParachainFundsPledged.blockHeight)) {
            return true;
        }

        // create a new historical entity, since 600 blocks / 1 hour has passed
        const blocksSinceLastHistoricalEntity = blockHeight.sub(lastHourlyHistoricalParachainFundsPledged.blockHeight);
        if (blocksSinceLastHistoricalEntity.gte(blocksPerHour)) {
            return true;
        }
        
        return false;
    })();
    
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

const handlePostBlock = async ({
    store,
    block
}: BlockContext & StoreContext) => {
    const blockHeight = new BN(block.height);
    // TODO: eventually filter out parachains that already have a slot leased
    const parachains = await store.getMany<Parachain>(Parachain, {});
    
    const historicalFundsPledgedQueries = parachains.map(parachain => {
        return createHistoricalParachainFundsPledged(store, parachain, blockHeight);
    });

    await Promise.all(historicalFundsPledgedQueries);
}

export default handlePostBlock;