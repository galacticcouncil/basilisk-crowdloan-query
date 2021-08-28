import '../generated/server/config'
import { BN } from "@polkadot/util";
import { Bid } from "../generated/model";
import { bestBidForRangeIndex, determineWinningBids, minimizeSlotRange, slotRangeToIndex, IndexedBids, bidsIntoRangeIndexes } from "./auction";
import { expect } from 'chai';

describe('utils/auction', () => {

    describe('minimizeSlotRange', () => {
        it('should serialize the given lease range to a number', () => {
            [
                {
                    slotRange: {
                        leasePeriodStart: new BN(13),
                        leasePeriodEnd: new BN(20),
                    },
                    expectedMinimalSlotRange: {
                        leasePeriodStart: new BN(0),
                        leasePeriodEnd: new BN(7),
                    }
                },
                {
                    slotRange: {
                        leasePeriodStart: new BN(13),
                        leasePeriodEnd: new BN(13),
                    },
                    expectedMinimalSlotRange: {
                        leasePeriodStart: new BN(0),
                        leasePeriodEnd: new BN(0),
                    }
                },
                {
                    slotRange: {
                        leasePeriodStart: new BN(13),
                        leasePeriodEnd: new BN(15),
                    },
                    expectedMinimalSlotRange: {
                        leasePeriodStart: new BN(0),
                        leasePeriodEnd: new BN(2),
                    }
                },
            ].map(({ slotRange, expectedMinimalSlotRange }) => {
                const rangeLength = minimizeSlotRange(slotRange);
                expect(rangeLength).to.be.deep.equal(expectedMinimalSlotRange);
            });

        })
    });

    describe('bestBidForRangeIndex', () => {
        it('should return undefined if no bids for the given range index exist', () => {
            const bestBid = bestBidForRangeIndex({}, '1');
            expect(bestBid).to.be.undefined
        });

        it('should return the existing bid weighted by its range', () => {
            const expectedBestBid: Bid = new Bid({
                leasePeriodStart: new BN(0),
                leasePeriodEnd: new BN(7),
                balance: new BN(10)
            });

            const slotRangeIndex = slotRangeToIndex({
                leasePeriodStart:expectedBestBid.leasePeriodStart,
                leasePeriodEnd: expectedBestBid.leasePeriodEnd
            })

            const indexedBids: IndexedBids = {
                [slotRangeIndex]: expectedBestBid
            };

            const bestBid = bestBidForRangeIndex(indexedBids, slotRangeIndex);

            expect(bestBid).to.not.be.undefined;
            // TODO: find a way to type this correctly without crazy casting
            expect((bestBid as unknown as BN).eq(new BN(80))).to.be.true
        });
    })

    describe('determineWinningBids', () => {
        type dataSet = {
            currentBids: Bid[],
            winningBids: Bid[]
        }[];
        /**
         * Dataset mimicking Polkadot runtime test data for determining/calculating winners
         * https://github.com/paritytech/polkadot/blob/9fc3088f9e8dae5eaf062503fcefbb75a548c016/runtime/common/src/auctions.rs#L1200
         */
        const dataSet: dataSet = [
            {
                currentBids: [
                    { balance: "1", leasePeriodStart: "3", leasePeriodEnd: "3" }
                ],
                winningBids: [
                    { balance: "1", leasePeriodStart: "3", leasePeriodEnd: "3" }
                ]
            },
            {
                currentBids: [
                    { balance: "1", leasePeriodStart: "0", leasePeriodEnd: "0" }
                ],
                winningBids: [
                    { balance: "1", leasePeriodStart: "0", leasePeriodEnd: "0" }
                ]
            },
            {
                currentBids: [
                    { balance: "2", leasePeriodStart: "0", leasePeriodEnd: "0" },
                    { balance: "1", leasePeriodStart: "0", leasePeriodEnd: "3" },
                    { balance: "1", leasePeriodStart: "1", leasePeriodEnd: "1" },
                    { balance: "53", leasePeriodStart: "2", leasePeriodEnd: "2" },
                    { balance: "1", leasePeriodStart: "3", leasePeriodEnd: "3" },
                ],
                winningBids: [
                    { balance: "2", leasePeriodStart: "0", leasePeriodEnd: "0" },
                    { balance: "1", leasePeriodStart: "1", leasePeriodEnd: "1" },
                    { balance: "53", leasePeriodStart: "2", leasePeriodEnd: "2" },
                    { balance: "1", leasePeriodStart: "3", leasePeriodEnd: "3" },
                ]
            },
            {
                currentBids: [
                    { balance: "2", leasePeriodStart: "0", leasePeriodEnd: "0" },
                    { balance: "1", leasePeriodStart: "0", leasePeriodEnd: "3" },
                    { balance: "1", leasePeriodStart: "1", leasePeriodEnd: "1" },
                    { balance: "53", leasePeriodStart: "2", leasePeriodEnd: "2" },
                    { balance: "1", leasePeriodStart: "3", leasePeriodEnd: "3" },

                    { balance: "3", leasePeriodStart: "0", leasePeriodEnd: "1" },
                ],
                winningBids: [
                    { balance: "3", leasePeriodStart: "0", leasePeriodEnd: "1" },
                    { balance: "53", leasePeriodStart: "2", leasePeriodEnd: "2" },
                    { balance: "1", leasePeriodStart: "3", leasePeriodEnd: "3" },
                ]
            },
            {
                currentBids: [
                    { balance: "2", leasePeriodStart: "0", leasePeriodEnd: "0" },
                    { balance: "1", leasePeriodStart: "0", leasePeriodEnd: "3" },
                    { balance: "1", leasePeriodStart: "1", leasePeriodEnd: "1" },
                    { balance: "53", leasePeriodStart: "2", leasePeriodEnd: "2" },
                    { balance: "1", leasePeriodStart: "3", leasePeriodEnd: "3" },

                    { balance: "3", leasePeriodStart: "0", leasePeriodEnd: "1" },

                    { balance: "100", leasePeriodStart: "0", leasePeriodEnd: "3" },

                ],
                winningBids: [
                    { balance: "100", leasePeriodStart: "0", leasePeriodEnd: "3" },
                ]
            }
        ].map(data => ({
            currentBids: data.currentBids.map(bid => ({
                balance: new BN(bid.balance),
                leasePeriodStart: new BN(bid.leasePeriodStart),
                leasePeriodEnd: new BN(bid.leasePeriodEnd)
            } as Bid)),
            winningBids: data.winningBids.map(bid => ({
                balance: new BN(bid.balance),
                leasePeriodStart: new BN(bid.leasePeriodStart),
                leasePeriodEnd: new BN(bid.leasePeriodEnd)
            } as Bid))
        }));

        it('should determine winning bids', () => {
            dataSet.forEach(data => {
                const indexedBids = bidsIntoRangeIndexes(data.currentBids);
                const winningBids = determineWinningBids(indexedBids);
                expect(winningBids).to.be.deep.equal(data.winningBids);
            })
        });
    });
})