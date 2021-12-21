import { BaseModel, NumericField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Parachain } from '../parachain/parachain.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Bid extends BaseModel {
  @ManyToOne(() => Parachain, (param: Parachain) => param.bidparachain, {
    skipGraphQLField: true,

    modelName: 'Bid',
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
  balance!: BN;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  leasePeriodStart!: BN;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  leasePeriodEnd!: BN;

  constructor(init?: Partial<Bid>) {
    super();
    Object.assign(this, init);
  }
}
