import { BN } from '@polkadot/util';
import { BlockContext, StoreContext, DatabaseManager } from '@subsquid/hydra-common';
import { Parachain } from '../../generated/model';
import { shouldEnsureHistoricalParachainFundsPledged, createHistoricalParachainFundsPledged } from '../../utils/parachain';

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

    // wait until all the historical records are saved
    await Promise.all(historicalFundsPledgedQueries);
}

export default handlePostBlock;