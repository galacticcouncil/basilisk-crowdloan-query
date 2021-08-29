import { DatabaseManager } from '@subsquid/hydra-common';
import { HistoricalIncentive, Incentive, Parachain } from '../generated/model';
import { Not } from 'typeorm';
import { BN } from '@polkadot/util';
import { ensure } from './ensure';

const ownParachainId = process.env.OWN_PARACHAIN_ID;
const ensureHistoricalIncentive = async (
    store: DatabaseManager,
    siblingParachain: Parachain | undefined,
    leadPercentageRate: BN,
    blockHeight: BN
) => {
    const historicalIncentive = await ensure(
        store, 
        HistoricalIncentive, 
        blockHeight.toString(), 
        { blockHeight, leadPercentageRate, siblingParachain }
    );

    return store.save(historicalIncentive);
}

const incentiveID = 'incentive';
const ensureIncentive = async (
    store: DatabaseManager,
    siblingParachain: Parachain | undefined,
    leadPercentageRate: BN,
    blockHeight: BN
) => {
    const incentive = await ensure(
        store,
        Incentive,
        incentiveID,
        { blockHeight, leadPercentageRate, siblingParachain }
    );

    return store.save(incentive);
}

const updateIncentive = async (
    store: DatabaseManager,
    siblingParachain: Parachain | undefined,
    leadPercentageRate: BN,
    blockHeight: BN
) => {
    const incentive = await store.get(Incentive, { where: { id: incentiveID }});
    if (incentive) {
        Object.assign(incentive, {
            siblingParachain,
            leadPercentageRate,
            blockHeight
        });
        await store.save(incentive);
    }
}

export const determineIncentives = async (
    store: DatabaseManager,
    blockHeight: BN,
) => {
    const ownParachainPromise = getOwnParachain(store);
    const siblingParachainPromise = getSiblingParachain(store);

    const [ownParachain, siblingParachain] = await Promise.all([
        ownParachainPromise,
        siblingParachainPromise
    ]);

    // our parachain didnt register for a crowdloan yet, skip calculating incentives
    if (!ownParachain) return;

    const leadPercentageRate = calculateLeadPercentageRate(ownParachain, siblingParachain);
    const ensureIncentivesPromises = [
        ensureHistoricalIncentive(
            store,
            siblingParachain,
            leadPercentageRate,
            blockHeight
        ),
        ensureIncentive(
            store,
            siblingParachain,
            leadPercentageRate,
            blockHeight
        ),
    ];

    await Promise.all(ensureIncentivesPromises);
    await updateIncentive(
        store,
        siblingParachain,
        leadPercentageRate,
        blockHeight
    )
}

// find our own parachain
const getOwnParachain = async (
    store: DatabaseManager
) => {
    return await store.get(Parachain, {
        where: {
            id: ownParachainId
        }
    });
}

// find parachains that are not us, and have not won an auction yet
const getSiblingParachain = async (
    store: DatabaseManager
) => {
    return await store.get(Parachain, {
        where: {
            id: Not(ownParachainId),
            hasWonAnAuction: false,
        },
        order: {
            fundsPledged: 'DESC'
        },
    });
}

export const calculateLeadPercentageRate = (
    ownParachain: Parachain | undefined,
    siblingParachain: Parachain | undefined
) => {
    // our parachain does not exist yet, no point in calculating incentives
    if (!ownParachain) return new BN(0);

    // TODO: can we extract precision from polkadot.js?
    // BN does not deal with floats, multiply by a 10^6 to prevent more than reasonable precision loss
    const precisionMultiplier = new BN(10).pow(new BN(6));
    
    // default to 1, to avoit division by 0 errors
    const ownParachainFundsPledged = (ownParachain?.fundsPledged || new BN(1)).mul(precisionMultiplier);
    const siblingParachainFundsPledged = (siblingParachain?.fundsPledged || new BN(1)).mul(precisionMultiplier);
    
    /**
     * Percentage change between ownParachain.fundsPledged and siblingParachain.fundsPledged
     * 
     * Example:
     * own: 125
     * sibling: 100
     * lead: 25%
     * 
     * This calculation can be verified here:
     * https://www.calculatorsoup.com/calculators/algebra/percent-change-calculator.php
     */
    const leadPercentageRateMod = ownParachainFundsPledged
        .sub(siblingParachainFundsPledged)
        .div(
            siblingParachainFundsPledged
                .div(precisionMultiplier)
        )
    
    return leadPercentageRateMod;
}
