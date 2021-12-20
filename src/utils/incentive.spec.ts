import { BN } from '@polkadot/util';
import { expect } from 'chai';
import { Parachain } from '../generated/model';
import '../generated/server/config'
import { auctionEndingPeriodLength } from './auction';
import { bsxMultiplierMax, bsxMultiplierMin, calculateBSXMultiplier, calculateLeadPercentageRate, precisionMultiplier, precisionMultiplierBN } from './incentive';

describe('utils/incentive', () => {
    describe('calculateLeadPercentageRate', () => {
        it('should return 0 if no ownParachain is specified', () => {
            const ownParachain = undefined;
            const siblingParachain = undefined;
            const leadPercentageRate = calculateLeadPercentageRate(ownParachain, siblingParachain);
            expect(leadPercentageRate.toString()).to.be.deep.equal(BigInt(0).toString());
        });

        it('should return 25% if the difference in fundsPledged is 25%', () => {
            const ownParachain = {
                fundsPledged: BigInt(125)
            } as Parachain;
            const siblingParachain = {
                fundsPledged: BigInt(100)
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(ownParachain, siblingParachain);
            expect(leadPercentageRate.toString()).to.be.deep.equal(BigInt('25000000').toString());
        });

        it('should return 10% if the difference in fundsPledged is 10%', () => {
            const ownParachain = {
                fundsPledged: BigInt(110)
            } as Parachain;
            const siblingParachain = {
                fundsPledged: BigInt(100)
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(ownParachain, siblingParachain);
            expect(leadPercentageRate.toString()).to.be.deep.equal(BigInt('10000000').toString());
        });

    });

    describe('calculateBSXMultiplier', () => {

        it('should return the maximum multiplier in case the auctionClosingStart is unknown', () => {
            const bsxMultiplier = calculateBSXMultiplier(
                BigInt(0),
                undefined
            );

            expect(bsxMultiplier).to.be.equal(bsxMultiplierMax);
        });

        it('should return the maximum multiplier in case the blockHeight is before auctionClosingStart', () => {
            const bsxMultiplier = calculateBSXMultiplier(
                BigInt(0),
                BigInt(1)
            );

            expect(bsxMultiplier).to.be.equal(bsxMultiplierMax);
        });

        it('should return the minimum multiplier in case the blockHeight is after auctionClosingEnd', () => {
            const mostRecentAuctionClosingStart = BigInt(1);
            const blockHeight = mostRecentAuctionClosingStart + auctionEndingPeriodLength + BigInt(1);
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier).to.be.equal(bsxMultiplierMin);
        });

        it('should return a half of the max multiplier in case the blockHeight is in the middle of the auction closing period', () => {
            const mostRecentAuctionClosingStart = BigInt(0);
            const blockHeight = (mostRecentAuctionClosingStart + auctionEndingPeriodLength) / BigInt(2);
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier).to.be.equal(0.5 * precisionMultiplier);
        });

        it('should return ~0.66 multiplier when at the third of the closing period', () => {
            const mostRecentAuctionClosingStart = BigInt(0);
            const blockHeight = (mostRecentAuctionClosingStart + auctionEndingPeriodLength) / BigInt(3);
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier).to.be.equal(0.666666 * precisionMultiplier);
        });

        it('should return ~0.8 multiplier when at the fifth of the closing period', () => {
            const mostRecentAuctionClosingStart = BigInt(0);
            const blockHeight = (mostRecentAuctionClosingStart + auctionEndingPeriodLength) / BigInt(5);
            const bsxMultiplier = calculateBSXMultiplier(
                blockHeight,
                mostRecentAuctionClosingStart
            );

            expect(bsxMultiplier).to.be.equal(0.8 * precisionMultiplier);
        });
    });
});