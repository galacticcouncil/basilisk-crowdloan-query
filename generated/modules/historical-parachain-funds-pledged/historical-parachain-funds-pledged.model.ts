import { BaseModel, NumericField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Parachain } from '../parachain/parachain.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class HistoricalParachainFundsPledged extends BaseModel {
  @ManyToOne(() => Parachain, (param: Parachain) => param.historicalFundsPledged, {
    skipGraphQLField: true,

    modelName: 'HistoricalParachainFundsPledged',
    relModelName: 'Parachain',
    propertyName: 'parachain',
  })
  parachain!: Parachain;

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
  fundsPledged!: BN;

  constructor(init?: Partial<HistoricalParachainFundsPledged>) {
    super();
    Object.assign(this, init);
  }
}
