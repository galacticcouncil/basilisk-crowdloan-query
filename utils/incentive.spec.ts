import { BN } from '@polkadot/util';
import { expect } from 'chai';
import { Parachain } from '../generated/model';
import '../generated/server/config'
import { calculateLeadPercentageRate } from './incentive';

describe.only('utils/incentive', () => {
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
});