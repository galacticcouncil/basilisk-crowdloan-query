import { BaseModel, NumericField, Model, OneToMany, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Contribution } from '../contribution/contribution.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Account extends BaseModel {
  @StringField({})
  accountId!: string;

  @NumericField({
    transformer: {
      to: (entityValue: BN) => (entityValue !== undefined ? entityValue.toString(10) : null),
      from: (dbValue: string) =>
        dbValue !== undefined && dbValue !== null && dbValue.length > 0 ? new BN(dbValue, 10) : undefined,
    },
  })
  totalContributed!: BN;

  @OneToMany(() => Contribution, (param: Contribution) => param.account, {
    modelName: 'Account',
    relModelName: 'Contribution',
    propertyName: 'contributions',
  })
  contributions?: Contribution[];

  constructor(init?: Partial<Account>) {
    super();
    Object.assign(this, init);
  }
}
