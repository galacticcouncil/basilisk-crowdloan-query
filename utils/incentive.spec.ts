import { BN } from '@polkadot/util';
import { expect } from 'chai';
import { Parachain } from '../generated/model';
import '../generated/server/config'
import { auctionEndingPeriodLength } from './auction';
import { bsxMultiplierMax, bsxMultiplierMin, calculateBSXMultiplier, calculateLeadPercentageRate, precisionMultiplier } from './incentive';

describe('utils/incentive', () => {
    describe('calculateLeadPercentageRate', () => {
        it('should return 0 if no ownParachain is specified', () => {
            const ownParachain = undefined;
            const siblingParachain = undefined;
            const leadPercentageRate = calculateLeadPercentageRate(ownParachain, siblingParachain);
            expect(leadPercentageRate).to.be.deep.equal(new BN(0));
        });

        it('should return 25% if the difference in fundsPledged is 25%', () => {
            const ownParachain = {
                fundsPledged: new BN(125)
            } as Parachain;
            const siblingParachain = {
                fundsPledged: new BN(100)
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(ownParachain, siblingParachain);
            expect(leadPercentageRate).to.be.deep.equal(new BN('250000'));
        });

        it('should return 10% if the difference in fundsPledged is 10%', () => {
            const ownParachain = {
                fundsPledged: new BN(110)
            } as Parachain;
            const siblingParachain = {
                fundsPledged: new BN(100)
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(ownParachain, siblingParachain);
            expect(leadPercentageRate).to.be.deep.equal(new BN('100000'));
        });
    });

    describe('calculateBSXMultiplier', () => {

        it('should return the maximum multiplier in case the auctionClosingStart is unknown', () => {
            const bsxMultiplier = calculateBSXMultiplier(
                new BN(0),
                undefined
            );

            expect(bsxMultiplier.toNumber()).to.be.equal(bsxMultiplierMax);
        });

        it('should return the maximum multiplier in case the blockHeight is before auctionClosingStart', () => {
            const bsxMultiplier = calculateBSXMultiplier(
                new BN(0),
                new BN(1)
            );

            expect(bsxMultiplier.toNumber()).to.be.equal(bsxMultiplierMax);
        });

        it('should return the minimum multiplier in case the blockHeight is after auctionClosingEnd', () => {
            const mostRecentAuctionClosingStart = new BN(1);
            const blockHeight = mostRecentAuctionClosingStart.add(auctionEndingPeriodLength).add(new BN(1));
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier.toNumber()).to.be.equal(bsxMultiplierMin);
        });

        it('should return a half of the max multiplier in case the blockHeight is in the middle of the auction closing period', () => {
            const mostRecentAuctionClosingStart = new BN(0);
            const blockHeight = mostRecentAuctionClosingStart.add(auctionEndingPeriodLength).div(new BN(2));
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier.toNumber()).to.be.equal(0.5 * precisionMultiplier);
        });

        it('should return ~0.66 multiplier when at the third of the closing period', () => {
            const mostRecentAuctionClosingStart = new BN(0);
            const blockHeight = mostRecentAuctionClosingStart.add(auctionEndingPeriodLength).div(new BN(3));
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier.toNumber()).to.be.equal(0.666666 * precisionMultiplier);
        });

        it('should return ~0.8 multiplier when at the fifth of the closing period', () => {
            const mostRecentAuctionClosingStart = new BN(0);
            const blockHeight = mostRecentAuctionClosingStart.add(auctionEndingPeriodLength).div(new BN(5));
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier.toNumber()).to.be.equal(0.8 * precisionMultiplier);
        });
    });
});