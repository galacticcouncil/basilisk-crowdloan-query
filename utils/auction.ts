/// <reference path="simple-linear-scale.d.ts"/>
import { BN } from '@polkadot/util';
import { DatabaseManager } from '@subsquid/hydra-common';
import { Bid } from '../generated/model';
import { ensure } from "./ensure"
import { ensureParachain } from './parachain';
import { times, findKey, partial, isEqual } from 'lodash';
import linearScale from 'simple-linear-scale'

/**
 * Find or create, and then upsert a bid 
 * with a specific slot range as ID
 */
export const ensureBid = async (
    store: DatabaseManager,
    paraId: string,
    balance: BN,
    leasePeriodStart: BN,
    leasePeriodEnd: BN,
) => {
    const id = `${leasePeriodStart.toString()}-${leasePeriodEnd.toString()}`;
    const parachain = await ensureParachain(store, paraId);

    const bid = await ensure<Bid>(store, Bid, id, {
        parachain,
        balance,
        leasePeriodStart,
        leasePeriodEnd
    });

    // update the bid if it already existed before
    bid.parachain = parachain;
    bid.balance = balance;

    await store.save(bid);
};

/**
 * Reimplementation of `calculate_winners` from the Polkadot auction module
 * https://github.com/paritytech/polkadot/blob/9fc3088f9e8dae5eaf062503fcefbb75a548c016/runtime/common/src/auctions.rs#L571
 */
const leasePeriodsPerSlot = 8;
const targetLeasePeriod = [13, 20];

/**
 * Replicate slot range serialization logic from the Polkadot runtime
 * 
 * https://github.com/paritytech/polkadot/blob/9fc3088f9e8dae5eaf062503fcefbb75a548c016/runtime/common/slot_range_helper/src/lib.rs#L279
 */
export type IndexedBids = { [key: string]: Bid };
export type SlotRange = {
    leasePeriodStart: BN,
    leasePeriodEnd: BN,
}

// generate a unique index for each slot range combination
export const slotRangePairing = (() => {
    const rangeIndexes: { [key: string]: string } = {};
    let index = 0;
    times(8).forEach(i => {
        times(8).forEach(j => {
            if (i > j) return;
            rangeIndexes[`${i}-${j}`] = `${index}`;
            index++;
        })
    })
    return rangeIndexes;
})();

// convert a slot range to slot length/duration to be used as bid weight
export const slotRangeIndexToLength = (slotRangeIndex: string) => {
    const minimalSlotRange = findKey(slotRangePairing, partial(isEqual, slotRangeIndex));
    const slotRange = minimalSlotRange?.split('-') as string[];
    const slotRangeLength = (new BN(slotRange[1])).sub((new BN(slotRange[0]))).add(new BN(1))
    return slotRangeLength;
}

// convert the given slot range to the previously generated unique index
export const slotRangeToIndex = ({
    leasePeriodStart,
    leasePeriodEnd
}: SlotRange) => slotRangePairing[`${leasePeriodStart}-${leasePeriodEnd}`]

const slotRangeScale = linearScale(targetLeasePeriod, [0, leasePeriodsPerSlot - 1]);
// this function will transform e.g. 13-20 to 0-7
export const minimizeSlotRange = ({
    leasePeriodStart,
    leasePeriodEnd,
}: SlotRange): SlotRange => ({
    leasePeriodStart: new BN(slotRangeScale(leasePeriodStart)),
    leasePeriodEnd: new BN(slotRangeScale(leasePeriodEnd))
})

/**
 * Convert the best existing bids into a data structure 
 * using unique slot range indexes as keys
 */
export const bidsIntoRangeIndexes = (bids: Bid[]) => {
    const bidsWithIndexes: IndexedBids = {};

    bids.forEach(bid => {
        const minimalSlotRangeIndex = slotRangeToIndex(bid);
        bidsWithIndexes[minimalSlotRangeIndex] = bid;
    })

    return bidsWithIndexes;
}

/** 
 * Find a bid for the given unique slot range index
 * and multiply it by slot range length
 */
export const bestBidForRangeIndex = (
    indexedBids: IndexedBids,
    slotRangeIndex: string
): BN | undefined => {
    const bid = indexedBids[slotRangeIndex];
    if (!bid) return;

    const slotLength = slotRangeIndexToLength(slotRangeIndex);
    const weightedBid = bid.balance?.mul(new BN(slotLength));
    return weightedBid;
}

/**
 * Determine winning bids after transforming the currently in-db-indexed bids, into a object
 * that uses unique slot range combinations as indexes, in order to be consumed
 * by the winner calculation algorithm.
 */
export const determineWinningBidsFromCurrentBids = (
    currentBids: Bid[]
): IndexedBids => bidsIntoRangeIndexes(currentBids);

/**
 * Logis for determining/calculating winning bids replicated from the
 * Polkadot runtime. Iterates over slot range combination selecting
 * the most suitable/winning bids as a result.
 * 
 * NOTE: Uncertain how exactly the implementation works, but it is 
 * copied 1:1 from the runtime and behaves as specified in the runtime tests.
 */
export const determineWinningBids = (
    indexedBids: IndexedBids,
): Bid[] => {
    const winningBids = (() => {
        const bestWinnersEndingAt: { [key: string]: any } = {}

        for (let i = 0; i <= leasePeriodsPerSlot; i++) {
            const slotRange: SlotRange = {
                leasePeriodStart: new BN(0),
                leasePeriodEnd: new BN(i)
            };
            const slotRangeIndex = slotRangeToIndex(slotRange);
            const bid = bestBidForRangeIndex(indexedBids, slotRangeIndex);

            if (bid) {
                bestWinnersEndingAt[i] = {
                    ranges: [slotRange],
                    bid
                }
            }

            for (let j = 0; j <= i; j++) {
                const slotRange: SlotRange = {
                    leasePeriodStart: new BN(j + 1),
                    leasePeriodEnd: new BN(i)
                };
                const slotRangeIndex = slotRangeToIndex(slotRange);
                let bid = bestBidForRangeIndex(indexedBids, slotRangeIndex);

                // those two for loops above cover all slot range combinations, now its time to choose the highest bids
                if (bid) {
                    bid = bid.add(
                        bestWinnersEndingAt[j]?.bid
                        || new BN(0)
                    );

                    if (bid.gt(bestWinnersEndingAt[i]?.bid || new BN(0))) {
                        bestWinnersEndingAt[i] = {
                            ranges: (bestWinnersEndingAt[j]?.ranges || []).concat(slotRange),
                            bid
                        }
                    }
                } else {
                    const shouldReplaceBestWinners = (bestWinnersEndingAt[j]?.bid || new BN(0))
                        .gt((bestWinnersEndingAt[i]?.bid || new BN(0)))

                    if (shouldReplaceBestWinners) {
                        bestWinnersEndingAt[i] = { ...bestWinnersEndingAt[j] };
                    }
                }
            }
        }

        const winningRanges = bestWinnersEndingAt[leasePeriodsPerSlot - 1]?.ranges;
        // map the winningRanges back to the actual bids that won those ranges
        const winningBids = winningRanges
            .map((range: SlotRange) => {
                const slotRangeIndex = slotRangeToIndex(range)
                const finalWinner = indexedBids[slotRangeIndex];
                return finalWinner;
            })
            .filter((winner: SlotRange) => winner);

        return winningBids;
    })();

    return winningBids;
}