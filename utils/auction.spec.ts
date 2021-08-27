/// <reference path="./simple-linear-scale.d.ts" />
import '../generated/server/config'
import { BN } from "@polkadot/util";
import { Bid } from "../generated/model";
import { bestBidForRangeIndex, determineWinningBids, minimizeSlotRange, IndexedBids } from "./auction";
import { expect } from 'chai';

describe('utils/auction', () => {

    describe('minimizeSlotRange', () => {
        it.skip('should serialize the given lease range to a number', () => {
            [
                {
                    slotRange: [new BN(13), new BN(20)],
                    expectedMinimalSlotRange: '0-7'
                },
                {
                    slotRange: [new BN(13), new BN(20)],
                    expectedMinimalSlotRange: '0-7'
                },
            ].map(({ slotRange, expectedMinimalSlotRange }) => {
                const rangeLength = minimizeSlotRange(new Bid({
                    leasePeriodStart: slotRange[0], 
                    leasePeriodEnd: slotRange[1]
                }));
                expect(rangeLength).to.be.equal(expectedMinimalSlotRange);
            });
            
        })
    });

    describe('bestBidForRangeIndex', () => {
        it('should return undefined if no bids for the given range index exist', () => {
            const bestBid = bestBidForRangeIndex({}, '1');
            expect(bestBid).to.be.undefined
        });

        it.skip('should return the existing bid weighted by its range', () => {
            const expectedBestBid: Bid = new Bid({
                leasePeriodStart: new BN(13),
                leasePeriodEnd: new BN(20),
                balance: new BN(10)
            });

            const indexedBids: IndexedBids = {
                '1': expectedBestBid
            };

            const bestBid = bestBidForRangeIndex(indexedBids, '14');
            
            expect(bestBid).to.not.be.undefined;
            // TODO: find a way to type this correctly without crazy casting
            expect((bestBid as unknown as BN).eq(new BN(140))).to.be.true
        });
    })

    describe('determineWinningBids', () => {
        it('should calculate the winning bids', async () => {
            const currentBids: Bid[] = [
                {
                    "balance": "1",
                    "leasePeriodEnd": "3",
                    "leasePeriodStart": "3",
                },
              ].map(bid => ({
                  balance: new BN(bid.balance),
                  leasePeriodStart: new BN(bid.leasePeriodStart),
                  leasePeriodEnd: new BN(bid.leasePeriodEnd)
              } as Bid));

            const determinedWinners = await determineWinningBids(currentBids);
            
            determinedWinners.forEach(winner => {
                console.log('---winner---');
                console.log('start', winner.leasePeriodStart.toString());
                console.log('end', winner.leasePeriodEnd.toString());
                console.log('balance', winner.balance.toString())
            })
        })

        it('should calculate the winning bids', async () => {
            const currentBids: Bid[] = [
                // {
                //     "leasePeriodStart": "3",
                //     "leasePeriodEnd": "3",
                //     "balance": "2",
                // },

                // {
                //     "leasePeriodStart": "0",
                //     "leasePeriodEnd": "0",
                //     "balance": "1",
                // },

                // works and returns 4 winners
                // {
                //     "leasePeriodStart": "0",
                //     "leasePeriodEnd": "0",
                //     "balance": "2",
                // },
                // {
                //     "leasePeriodStart": "0",
                //     "leasePeriodEnd": "3",
                //     "balance": "1",
                // },
                // {
                //     "leasePeriodStart": "1",
                //     "leasePeriodEnd": "1",
                //     "balance": "1",
                // },
                // {
                //     "leasePeriodStart": "2",
                //     "leasePeriodEnd": "2",
                //     "balance": "53",
                // },
                // {
                //     "leasePeriodStart": "3",
                //     "leasePeriodEnd": "3",
                //     "balance": "1",
                // },

                // works and returns 3 winners
                // {
                //     "leasePeriodStart": "0",
                //     "leasePeriodEnd": "0",
                //     "balance": "2",
                // },
                // {
                //     "leasePeriodStart": "0",
                //     "leasePeriodEnd": "3",
                //     "balance": "1",
                // },
                // {
                //     "leasePeriodStart": "1",
                //     "leasePeriodEnd": "1",
                //     "balance": "1",
                // },
                // {
                //     "leasePeriodStart": "2",
                //     "leasePeriodEnd": "2",
                //     "balance": "53",
                // },
                // {
                //     "leasePeriodStart": "3",
                //     "leasePeriodEnd": "3",
                //     "balance": "1",
                // },
                // {
                //     "leasePeriodStart": "0",
                //     "leasePeriodEnd": "1",
                //     "balance": "3",
                // },

                // works and returns 1 winner
                {
                    "leasePeriodStart": "0",
                    "leasePeriodEnd": "0",
                    "balance": "2",
                },
                {
                    "leasePeriodStart": "1",
                    "leasePeriodEnd": "1",
                    "balance": "1",
                },
                {
                    "leasePeriodStart": "2",
                    "leasePeriodEnd": "2",
                    "balance": "53",
                },
                {
                    "leasePeriodStart": "3",
                    "leasePeriodEnd": "3",
                    "balance": "1",
                },
                {
                    "leasePeriodStart": "0",
                    "leasePeriodEnd": "1",
                    "balance": "3",
                },
                {
                    "leasePeriodStart": "0",
                    "leasePeriodEnd": "3",
                    "balance": "100",
                },
                
              ].map(bid => ({
                  balance: new BN(bid.balance),
                  leasePeriodStart: new BN(bid.leasePeriodStart),
                  leasePeriodEnd: new BN(bid.leasePeriodEnd)
              } as Bid));

            const determinedWinners = await determineWinningBids(currentBids);
            
            determinedWinners.forEach(winner => {
                console.log('---winner---');
                console.log('start', winner.leasePeriodStart.toString());
                console.log('end', winner.leasePeriodEnd.toString());
                console.log('balance', winner.balance.toString())
            })
        })
    });
})