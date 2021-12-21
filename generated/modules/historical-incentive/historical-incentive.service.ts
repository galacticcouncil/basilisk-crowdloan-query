import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { HistoricalIncentive } from './historical-incentive.model';

import { HistoricalIncentiveWhereArgs, HistoricalIncentiveWhereInput } from '../../warthog';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('HistoricalIncentiveService')
export class HistoricalIncentiveService extends HydraBaseService<HistoricalIncentive> {
  @Inject('ParachainService')
  public readonly siblingParachainService!: ParachainService;

  constructor(@InjectRepository(HistoricalIncentive) protected readonly repository: Repository<HistoricalIncentive>) {
    super(HistoricalIncentive, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<HistoricalIncentive[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<HistoricalIncentive[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<HistoricalIncentive> {
    const where = <HistoricalIncentiveWhereInput>(_where || {});

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

      mainQuery = mainQuery.andWhere(
        `"historicalincentive"."sibling_parachain_id" IN (${siblingParachainQuery.getQuery()})`
      );

      parameters = { ...parameters, ...siblingParachainQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
