import { expect } from 'chai';
import { Parachain } from '../generated/model';
import { calculateLeadPercentageRate } from './incentive';

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
});