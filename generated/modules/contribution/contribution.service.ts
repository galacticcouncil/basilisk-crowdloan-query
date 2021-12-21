import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Contribution } from './contribution.model';

import { ContributionWhereArgs, ContributionWhereInput } from '../../warthog';

import { Crowdloan } from '../crowdloan/crowdloan.model';
import { CrowdloanService } from '../crowdloan/crowdloan.service';
import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('ContributionService')
export class ContributionService extends HydraBaseService<Contribution> {
  @Inject('CrowdloanService')
  public readonly crowdloanService!: CrowdloanService;
  @Inject('AccountService')
  public readonly accountService!: AccountService;

  constructor(@InjectRepository(Contribution) protected readonly repository: Repository<Contribution>) {
    super(Contribution, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Contribution[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Contribution[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Contribution> {
    const where = <ContributionWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders
    const { crowdloan } = where;
    delete where.crowdloan;

    // remove relation filters to enable warthog query builders
    const { account } = where;
    delete where.account;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (crowdloan) {
      // OTO or MTO
      const crowdloanQuery = this.crowdloanService
        .buildFindQueryWithParams(<any>crowdloan, undefined, undefined, ['id'], 'crowdloan')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"contribution"."crowdloan_id" IN (${crowdloanQuery.getQuery()})`);

      parameters = { ...parameters, ...crowdloanQuery.getParameters() };
    }

    if (account) {
      // OTO or MTO
      const accountQuery = this.accountService
        .buildFindQueryWithParams(<any>account, undefined, undefined, ['id'], 'account')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"contribution"."account_id" IN (${accountQuery.getQuery()})`);

      parameters = { ...parameters, ...accountQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
