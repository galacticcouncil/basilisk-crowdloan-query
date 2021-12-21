import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Incentive } from './incentive.model';

import { IncentiveWhereArgs, IncentiveWhereInput } from '../../warthog';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('IncentiveService')
export class IncentiveService extends HydraBaseService<Incentive> {
  @Inject('ParachainService')
  public readonly siblingParachainService!: ParachainService;

  constructor(@InjectRepository(Incentive) protected readonly repository: Repository<Incentive>) {
    super(Incentive, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Incentive[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Incentive[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Incentive> {
    const where = <IncentiveWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders
    const { siblingParachain } = where;
    delete where.siblingParachain;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (siblingParachain) {
      // OTO or MTO
      const siblingParachainQuery = this.siblingParachainService
        .buildFindQueryWithParams(<any>siblingParachain, undefined, undefined, ['id'], 'siblingParachain')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"incentive"."sibling_parachain_id" IN (${siblingParachainQuery.getQuery()})`);

      parameters = { ...parameters, ...siblingParachainQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
