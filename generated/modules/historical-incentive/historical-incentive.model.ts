import { BaseModel, NumericField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Parachain } from '../parachain/parachain.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class HistoricalIncentive extends BaseModel {
  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  blockHeight!: BN;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  leadPercentageRate!: BN;

  @ManyToOne(() => Parachain, (param: Parachain) => param.historicalincentivesiblingParachain, {
    skipGraphQLField: true,
    nullable: true,
    modelName: 'HistoricalIncentive',
    relModelName: 'Parachain',
    propertyName: 'siblingParachain',
  })
  siblingParachain?: Parachain;

  constructor(init?: Partial<HistoricalIncentive>) {
    super();
    Object.assign(this, init);
  }
}
