import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Bid } from './bid.model';

import { BidWhereArgs, BidWhereInput } from '../../warthog';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('BidService')
export class BidService extends HydraBaseService<Bid> {
  @Inject('ParachainService')
  public readonly parachainService!: ParachainService;

  constructor(@InjectRepository(Bid) protected readonly repository: Repository<Bid>) {
    super(Bid, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Bid[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Bid[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Bid> {
    const where = <BidWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders
    const { parachain } = where;
    delete where.parachain;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    if (parachain) {
      // OTO or MTO
      const parachainQuery = this.parachainService
        .buildFindQueryWithParams(<any>parachain, undefined, undefined, ['id'], 'parachain')
        .take(undefined); // remove the default LIMIT

      mainQuery = mainQuery.andWhere(`"bid"."parachain_id" IN (${parachainQuery.getQuery()})`);

      parameters = { ...parameters, ...parachainQuery.getParameters() };
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
