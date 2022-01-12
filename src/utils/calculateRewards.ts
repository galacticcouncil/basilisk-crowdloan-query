/**
 * It was not possible to import the Basilisk-ui as module
 * That's why this file was copied 1:1
 */

// TODO: find a workaround to import it as module

import BigNumber from 'bignumber.js';
import log from 'loglevel';
import simpleLinearScale from 'simple-linear-scale';

const config = {
    oracle: {
        dotToUSD: '25',
        // HDX price after trippling
        hdxToUSD: new BigNumber('0.08059').dividedBy('3'),
    },
    incentive: {
        // compounded 14% APY
        opportunityCost: '0.2996',
        reimbursmentRange: {
            // the incentive scheme is actually 100%-10%,
            // its reversed here for the sake of the linear scale
            from: 0.1,
            to: 1
        },
        leadPercentageCliff: {
            from: 15,
            to: 25,
        },
        // by default no dillution is applied, the multiplier is '1'
        defaultDillutionMultiplier: '1',
        // TODO: can this have more precision if we calculate it on the spot using BigNumber? (probably not)
        minimalDillutionMultiplier: '0.4483199822',
        allocatedHDXSupply: '1000000000'
    }
}

/**
 * This file contains the Hydra crowdloan incentive implementation,
 * with math based on the following specification:
 * https://gist.github.com/maht0rz/737e2119bd3bfd2d89ffb66130038d72
 */

/**
 * TL;DR on how to use those math functions
 * 
 * leadPercentageRate: 25%
 * contributionAmount: 1DOT
 * totalRewardsDistributed: 0
 * 
 * current rewards:
 * for each contribution calculate the following
 * contributionReward: calculateCurrentContributionReward <-- leadPercentageRate (at contribution blockHeight), contributionAmount
 * 
 * for a sum of contributionReward(s) from all contributions, calculate the following:
 * dillutedContributionReward: calculateCurrentDillutedContributionReward <-- contributionReward, totalRewardsDistributed
 * ^ this will calculate the dillutionMultiplier and apply it on the contributionReward
 * 
 * minimal rewards:
 * for each contribution calculate the following
 * contributionReward: -||-
 * dillutedContributionReward: calculateMinimalDillutedContributionReward <-- contributionReward
 * 
 * for dynamic (from contribution form) reward calculation, use the same as above, but only for the contribution
 * values provided within the form
 */

const reimbursmentMultiplierScale = simpleLinearScale(
    [
        config.incentive.leadPercentageCliff.from,
        config.incentive.leadPercentageCliff.to,
    ],
    [
        config.incentive.reimbursmentRange.from,
        config.incentive.reimbursmentRange.to,
    ],
    true
);

// had to reverse the calculation using the minus approach due to the linear scale
// not calculating the scale within the bounds properly if either the domain or the range were
// numbers in the reverse direction (e.g. 15-25 / 100-10)
export const calculateReimbursmentMultiplier = (leadPercentageRate: number) => {
    return new BigNumber(config.incentive.reimbursmentRange.from)
        .plus(config.incentive.reimbursmentRange.to) // if the range is 10-100 then this will be 110
        .minus(reimbursmentMultiplierScale(leadPercentageRate))
}

// given the totalRewardContributed, calculate the current dillutionMultiplier
export const calculateDillutionMultiplier = (totalRewardsDistributed: string) => {
    // if the totalRewardsDistributed > allocatedHDXSupply, then the rewards need to be dilluted
    const shouldDillute = new BigNumber(totalRewardsDistributed)
        .gt(config.incentive.allocatedHDXSupply);

    if (!shouldDillute) return new BigNumber(config.incentive.defaultDillutionMultiplier);

    return new BigNumber(config.incentive.allocatedHDXSupply)
        .dividedBy(totalRewardsDistributed);
};

// given the contributionAmount and the reimbursmentMultiplier, calculate the contributionReward in HDX
export const calculateContributionReward = ({
    contributionAmount,
    reimbursmentMultiplier
}: {
    contributionAmount: string,
    reimbursmentMultiplier: BigNumber
}) => {
    const opportunityCostUSD = new BigNumber(contributionAmount)
        .multipliedBy(config.oracle.dotToUSD)
        .multipliedBy(config.incentive.opportunityCost);

    const reimbursedOpportunityCostUSD = opportunityCostUSD
        .multipliedBy(reimbursmentMultiplier);

    const rewardHDXAmount = reimbursedOpportunityCostUSD
        .dividedBy(config.oracle.hdxToUSD)

    log.debug('calculateContributionReward', {
        opportunityCostUSD: opportunityCostUSD.toFixed(3),
        reimbursedOpportunityCostUSD: reimbursedOpportunityCostUSD.toFixed(3),
        rewardHDXAmount: rewardHDXAmount.toFixed(3)
    });

    return rewardHDXAmount;
};

export const calculateDillutedContributionReward = ({
    contributionReward,
    dillutionMultiplier
}: {
    contributionReward: BigNumber,
    dillutionMultiplier: BigNumber
}) => {
    return contributionReward
        .multipliedBy(dillutionMultiplier);
};

/**
 * Current
 */
// given the contributionAmount and the leadPercentageRate
// calculate the reimbursmentMultiplier and then the current contributionReward
export const calculateCurrentContributionReward = ({
    contributionAmount,
    leadPercentageRate,
}: {
    contributionAmount: string,
    leadPercentageRate: number,
})  => {
    const reimbursmentMultiplier = calculateReimbursmentMultiplier(leadPercentageRate);
    return calculateContributionReward({ contributionAmount, reimbursmentMultiplier });
}

export const calculateMinimalContributionReward = (contributionAmount: string)  => {
    const reimbursmentMultiplier = new BigNumber(config.incentive.reimbursmentRange.from);
    return calculateContributionReward({ contributionAmount, reimbursmentMultiplier });
}

/**
 * Dilluted current & minimal contribution rewards
 */
export const calculateCurrentDillutedContributionReward = ({
    contributionReward,
    totalRewardsDistributed,
}: {
    contributionReward: BigNumber,
    totalRewardsDistributed: string,
}) => {
    const dillutionMultiplier = calculateDillutionMultiplier(totalRewardsDistributed);
    return calculateDillutedContributionReward({
        contributionReward,
        dillutionMultiplier
    });
};

export const calculateMinimalDillutedContributionReward = (contributionReward: BigNumber) => {
    const dillutionMultiplier = new BigNumber(config.incentive.minimalDillutionMultiplier);
    return calculateDillutedContributionReward({
        contributionReward,
        dillutionMultiplier
    })
}