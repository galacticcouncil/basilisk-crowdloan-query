import { expect } from 'chai';
import { Parachain } from '../generated/model';
import {
    calculateContributionRewardBigInt,
    calculateLeadPercentageRate,
} from './incentive';
import { calculateCurrentContributionReward } from './calculateRewards';

describe('utils/incentive', () => {
    describe('calculateLeadPercentageRate', () => {
        it('should return 0 if no ownParachain is specified', () => {
            const ownParachain = undefined;
            const siblingParachain = undefined;
            const leadPercentageRate = calculateLeadPercentageRate(
                ownParachain,
                siblingParachain
            );
            expect(leadPercentageRate.toString()).to.be.deep.equal(
                BigInt(0).toString()
            );
        });

        it('should return 25% if the difference in fundsPledged is 25%', () => {
            const ownParachain = {
                fundsPledged: BigInt(125),
            } as Parachain;
            const siblingParachain = {
                fundsPledged: BigInt(100),
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(
                ownParachain,
                siblingParachain
            );
            expect(leadPercentageRate.toString()).to.be.deep.equal(
                BigInt('25000000').toString()
            );
        });

        it('should return 10% if the difference in fundsPledged is 10%', () => {
            const ownParachain = {
                fundsPledged: BigInt(110),
            } as Parachain;
            const siblingParachain = {
                fundsPledged: BigInt(100),
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(
                ownParachain,
                siblingParachain
            );
            expect(leadPercentageRate.toString()).to.be.deep.equal(
                BigInt('10000000').toString()
            );
        });
        it('should return 10% if the difference in fundsPledged is 10%', () => {
            const ownParachain = {
                fundsPledged: BigInt(59797060094462),
            } as Parachain;
            const siblingParachain = {
                fundsPledged: BigInt(109878754641250),
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(
                ownParachain,
                siblingParachain
            );
            expect(leadPercentageRate.toString()).to.be.deep.equal(
                BigInt('-45579000').toString()
            );
        });
        it('should return 10% if the difference in fundsPledged is 10%', () => {
            const ownParachain = {
                fundsPledged: BigInt(59797060),
            } as Parachain;
            const siblingParachain = {
                fundsPledged: BigInt(109878754641250),
            } as Parachain;

            const leadPercentageRate = calculateLeadPercentageRate(
                ownParachain,
                siblingParachain
            );
            expect(leadPercentageRate.toString()).to.be.deep.equal(
                BigInt('-45579000').toString()
            );
        });
    });

    describe('calculateContributionRewardBigInt', () => {
        const dataset = [
            ['250000000000', '15000000', '6970467799975183'],
            ['100000000000', '15015000', '2784423067378086'],
            ['10000000000', '15000000', '278818711999007'],
            ['10000000000', '25000000', '27881871199901'],
            ['10000000000', '10000000', '278818711999007'],
            ['10000000000', '30000000', '27881871199901'],
            ['10000000000', '-10000000', '278818711999007'],
        ];
        // run = [dotAmount, leadPercentageRate, hdxAmount]
        dataset.forEach(function (run) {
            it(`can calculate contribution reward for lead percentage ${run[1]}`, () => {
                const hdxAmount = calculateContributionRewardBigInt(
                    BigInt(run[0]),
                    BigInt(run[1])
                );

                expect(hdxAmount.toString()).to.equal(run[2]);
            });
        });
    });

    // this test is from the UI project
    describe('calculateCurrentContributionReward', () => {
        const dataset = [
            ['10', 15.0155, '2784', '10 DOT contribution'],
            ['1', 15, '279', 'max amount per 1 DOT without dilution'],
            ['1', 25, '28', 'min amount per 1 DOT  without dilution'],
            ['1', 10, '279', 'out of bounds cases'],
            ['1', 30, '28', 'out of bounds cases'],
            ['1', -10, '279', 'out of bounds cases'],
        ];
        // run = [dotAmount, leadPercentageRate, hdxAmount, description]
        dataset.forEach(function (run) {
            it(`can calculate reward for ${run[3].toString()}`, () => {
                const hdxAmount = calculateCurrentContributionReward({
                    contributionAmount: run[0].toString(),
                    leadPercentageRate: Number(run[1]),
                });

                expect(hdxAmount.toFixed(0)).to.equal(run[2]);
            });
        });
    });
});
