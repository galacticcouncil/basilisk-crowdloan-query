import { BaseModel, NumericField, Model, ManyToOne, StringField, JSONField } from '@subsquid/warthog';

import BN from 'bn.js';

import { Crowdloan } from '../crowdloan/crowdloan.model';
import { Account } from '../account/account.model';

import * as jsonTypes from '../jsonfields/jsonfields.model';

@Model({ api: {} })
export class Contribution extends BaseModel {
  @ManyToOne(() => Crowdloan, (param: Crowdloan) => param.contributions, {
    skipGraphQLField: true,

    modelName: 'Contribution',
    relModelName: 'Crowdloan',
    propertyName: 'crowdloan',
  })
  crowdloan!: Crowdloan;

  @ManyToOne(() => Account, (param: Account) => param.contributions, {
    skipGraphQLField: true,

    modelName: 'Contribution',
    relModelName: 'Account',
    propertyName: 'account',
  })
  account!: Account;

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
  blockHeight!: BN;

  constructor(init?: Partial<Contribution>) {
    super();
    Object.assign(this, init);
  }
}
