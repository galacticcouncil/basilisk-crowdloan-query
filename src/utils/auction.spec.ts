//import '../generated/server/config'
import { BN } from "@polkadot/util";
import { Bid } from "../generated/model";
import { bestBidForRangeIndex, determineWinningBids, minimizeSlotRange, slotRangeToIndex, IndexedBids, bidsIntoRangeIndexes, determineWinningBidsFromCurrentBids, targetLeasePeriod } from "./auction";
import { expect } from 'chai';

describe('utils/auction', () => {

    describe('minimizeSlotRange', () => {
        it('should serialize the given lease range to a number', () => {
            [
                {
                    slotRange: {
                        leasePeriodStart: BigInt(targetLeasePeriod[0]),
                        leasePeriodEnd: BigInt(targetLeasePeriod[1]),
                    },
                    expectedMinimalSlotRange: {
                        leasePeriodStart: BigInt(0),
                        leasePeriodEnd: BigInt(7),
                    }
                },
                {
                    slotRange: {
                        leasePeriodStart: BigInt(targetLeasePeriod[0]),
                        leasePeriodEnd: BigInt(targetLeasePeriod[0]),
                    },
                    expectedMinimalSlotRange: {
                        leasePeriodStart: BigInt(0),
                        leasePeriodEnd: BigInt(0),
                    }
                },
                {
                    slotRange: {
                        leasePeriodStart: BigInt(targetLeasePeriod[0]),
                        leasePeriodEnd: BigInt(targetLeasePeriod[0] + 2),
                    },
                    expectedMinimalSlotRange: {
                        leasePeriodStart: BigInt(0),
                        leasePeriodEnd: BigInt(2),
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
                leasePeriodStart: BigInt(0),
                leasePeriodEnd: BigInt(7),
                balance: BigInt(10)
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
            expect(BigInt(bestBid!)).to.equal(BigInt(80))
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
                balance: BigInt(bid.balance),
                leasePeriodStart: BigInt(bid.leasePeriodStart),
                leasePeriodEnd: BigInt(bid.leasePeriodEnd)
            } as Bid)),
            winningBids: data.winningBids.map(bid => ({
                balance: BigInt(bid.balance),
                leasePeriodStart: BigInt(bid.leasePeriodStart),
                leasePeriodEnd: BigInt(bid.leasePeriodEnd)
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

    describe('winner calculation from past live auction data', () => {
        const toBid = (bid: any) => new Bid({
            ...bid,
            leasePeriodStart: BigInt(bid.leasePeriodStart),
            leasePeriodEnd: BigInt(bid.leasePeriodEnd),
            balance: BigInt(bid.balance)
        });

        describe('auction 1 winner calculation', () => {
            const bids = [
                {
                  "id": "13-15",
                  "leasePeriodEnd": "15",
                  "leasePeriodStart": "13",
                  "parachainId": "2012",
                  "balance": "1000000000000"
                },
                {
                  "id": "13-20",
                  "leasePeriodEnd": "20",
                  "leasePeriodStart": "13",
                  "parachainId": "2000",
                  "balance": "491752906100722948"
                },
                {
                  "id": "16-20",
                  "leasePeriodEnd": "20",
                  "leasePeriodStart": "16",
                  "parachainId": "2012",
                  "balance": "1234500000000"
                }
            ].map(toBid)
    
            it('should select parachain 2012 and its bid as the winner', () => {
                 const winningBids = determineWinningBidsFromCurrentBids(bids);
                 expect(winningBids.length).to.be.equal(1);
                 // winner should be the second bid
                 expect(winningBids[0]).to.be.deep.equal(bids[1]);
            });
        });

        describe('auction 2 winner calculation', () => {
            const bids = [
                {
                  "id": "13-15",
                  "leasePeriodEnd": "15",
                  "leasePeriodStart": "13",
                  "parachainId": "2012",
                  "balance": "1234500000000"
                },
                {
                  "id": "16-20",
                  "leasePeriodEnd": "20",
                  "leasePeriodStart": "16",
                  "parachainId": "2009",
                  "balance": "124000000000"
                },
                {
                  "id": "13-20",
                  "leasePeriodEnd": "20",
                  "leasePeriodStart": "13",
                  "parachainId": "2023",
                  "balance": "176484922879171724"
                }
              ].map(toBid)
    
            it('should select parachain 2023 and its bid as the winner', () => {
                 const winningBids = determineWinningBidsFromCurrentBids(bids);
                 expect(winningBids.length).to.be.equal(1);
                 // winner should be the second bid
                 expect(winningBids[0]).to.be.deep.equal(bids[2]);
            });
        });

        describe('auction 3 winner calculation', () => {
            const bids = [
                {
                  "id": "13-20",
                  "leasePeriodEnd": "20",
                  "leasePeriodStart": "13",
                  "parachainId": "2007",
                  "balance": "137023971757623070"
                }
              ].map(toBid)
    
            it('should select parachain 2007 and its bid as the winner', () => {
                 const winningBids = determineWinningBidsFromCurrentBids(bids);
                 expect(winningBids.length).to.be.equal(1);
                 // winner should be the second bid
                 expect(winningBids[0]).to.be.deep.equal(bids[0]);
            });
        });

        describe('auction 4 winner calculation', () => {
            const bids = [
                {
                  "id": "13-13",
                  "leasePeriodEnd": "13",
                  "leasePeriodStart": "13",
                  "parachainId": "2078",
                  "balance": "1199999999000"
                },
                {
                  "id": "13-20",
                  "leasePeriodEnd": "20",
                  "leasePeriodStart": "13",
                  "parachainId": "2004",
                  "balance": "130003918977569619"
                }
              ].map(toBid)
    
            it('should select parachain 2004 and its bid as the winner', () => {
                 const winningBids = determineWinningBidsFromCurrentBids(bids);
                 expect(winningBids.length).to.be.equal(1);
                 // winner should be the second bid
                 expect(winningBids[0]).to.be.deep.equal(bids[1]);
            });
        });

        describe('auction 5 winner calculation', () => {
            const bids = [
                {
                  "id": "13-13",
                  "leasePeriodEnd": "13",
                  "leasePeriodStart": "13",
                  "parachainId": "2078",
                  "balance": "3091723333068"
                },
                {
                  "id": "13-20",
                  "leasePeriodEnd": "20",
                  "leasePeriodStart": "13",
                  "parachainId": "2001",
                  "balance": "136060616110084960"
                }
              ].map(toBid)
    
            it('should select parachain 2004 and its bid as the winner', () => {
                 const winningBids = determineWinningBidsFromCurrentBids(bids);
                 expect(winningBids.length).to.be.equal(1);
                 // winner should be the second bid
                 expect(winningBids[0]).to.be.deep.equal(bids[1]);
            });
        });
    })
})