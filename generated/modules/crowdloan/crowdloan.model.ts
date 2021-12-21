import { BaseModel, NumericField, Model, ManyToOne, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Parachain } from '../parachain/parachain.model';
import { Contribution } from '../contribution/contribution.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Crowdloan extends BaseModel {
  @ManyToOne(() => Parachain, (param: Parachain) => param.crowdloanparachain, {
    skipGraphQLField: true,

    modelName: 'Crowdloan',
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
  raised!: BN;

  @OneToMany(() => Contribution, (param: Contribution) => param.crowdloan, {
    modelName: 'Crowdloan',
    relModelName: 'Contribution',
    propertyName: 'contributions',
  })
  contributions?: Contribution[];

  constructor(init?: Partial<Crowdloan>) {
    super();
    Object.assign(this, init);
  }
}
