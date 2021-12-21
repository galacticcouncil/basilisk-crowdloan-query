import { BaseModel, BooleanField, NumericField, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { HistoricalParachainFundsPledged } from '../historical-parachain-funds-pledged/historical-parachain-funds-pledged.model';
import { Bid } from '../bid/bid.model';
import { Crowdloan } from '../crowdloan/crowdloan.model';
import { HistoricalIncentive } from '../historical-incentive/historical-incentive.model';
import { Incentive } from '../incentive/incentive.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Parachain extends BaseModel {
  @StringField({})
  paraId!: string;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  fundsPledged!: BN;

  @BooleanField({})
  hasWonAnAuction!: boolean;

  @OneToMany(() => HistoricalParachainFundsPledged, (param: HistoricalParachainFundsPledged) => param.parachain, {
    modelName: 'Parachain',
    relModelName: 'HistoricalParachainFundsPledged',
    propertyName: 'historicalFundsPledged',
  })
  historicalFundsPledged?: HistoricalParachainFundsPledged[];

  @OneToMany(() => Bid, (param: Bid) => param.parachain, {
    nullable: true,
    modelName: 'Parachain',
    relModelName: 'Bid',
    propertyName: 'bidparachain',
  })
  bidparachain?: Bid[];

  @OneToMany(() => Crowdloan, (param: Crowdloan) => param.parachain, {
    nullable: true,
    modelName: 'Parachain',
    relModelName: 'Crowdloan',
    propertyName: 'crowdloanparachain',
  })
  crowdloanparachain?: Crowdloan[];

  @OneToMany(() => HistoricalIncentive, (param: HistoricalIncentive) => param.siblingParachain, {
    nullable: true,
    modelName: 'Parachain',
    relModelName: 'HistoricalIncentive',
    propertyName: 'historicalincentivesiblingParachain',
  })
  historicalincentivesiblingParachain?: HistoricalIncentive[];

  @OneToMany(() => Incentive, (param: Incentive) => param.siblingParachain, {
    nullable: true,
    modelName: 'Parachain',
    relModelName: 'Incentive',
    propertyName: 'incentivesiblingParachain',
  })
  incentivesiblingParachain?: Incentive[];

  constructor(init?: Partial<Parachain>) {
    super();
    Object.assign(this, init);
  }
}
