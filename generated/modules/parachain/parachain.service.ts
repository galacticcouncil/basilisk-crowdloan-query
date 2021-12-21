import { Service, Inject } from 'typedi';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WhereInput, HydraBaseService } from '@subsquid/warthog';

import { Parachain } from './parachain.model';

import { ParachainWhereArgs, ParachainWhereInput } from '../../warthog';

import { HistoricalParachainFundsPledged } from '../historical-parachain-funds-pledged/historical-parachain-funds-pledged.model';
import { HistoricalParachainFundsPledgedService } from '../historical-parachain-funds-pledged/historical-parachain-funds-pledged.service';
import { Bid } from '../bid/bid.model';
import { BidService } from '../bid/bid.service';
import { Crowdloan } from '../crowdloan/crowdloan.model';
import { CrowdloanService } from '../crowdloan/crowdloan.service';
import { HistoricalIncentive } from '../historical-incentive/historical-incentive.model';
import { HistoricalIncentiveService } from '../historical-incentive/historical-incentive.service';
import { Incentive } from '../incentive/incentive.model';
import { IncentiveService } from '../incentive/incentive.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@Service('ParachainService')
export class ParachainService extends HydraBaseService<Parachain> {
  @Inject('HistoricalParachainFundsPledgedService')
  public readonly historicalFundsPledgedService!: HistoricalParachainFundsPledgedService;
  @Inject('BidService')
  public readonly bidparachainService!: BidService;
  @Inject('CrowdloanService')
  public readonly crowdloanparachainService!: CrowdloanService;
  @Inject('HistoricalIncentiveService')
  public readonly historicalincentivesiblingParachainService!: HistoricalIncentiveService;
  @Inject('IncentiveService')
  public readonly incentivesiblingParachainService!: IncentiveService;

  constructor(@InjectRepository(Parachain) protected readonly repository: Repository<Parachain>) {
    super(Parachain, repository);
  }

  async find<W extends WhereInput>(
    where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Parachain[]> {
    return this.findWithRelations<W>(where, orderBy, limit, offset, fields);
  }

  findWithRelations<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): Promise<Parachain[]> {
    return this.buildFindWithRelationsQuery(_where, orderBy, limit, offset, fields).getMany();
  }

  buildFindWithRelationsQuery<W extends WhereInput>(
    _where?: any,
    orderBy?: string | string[],
    limit?: number,
    offset?: number,
    fields?: string[]
  ): SelectQueryBuilder<Parachain> {
    const where = <ParachainWhereInput>(_where || {});

    // remove relation filters to enable warthog query builders

    const { historicalFundsPledged_some, historicalFundsPledged_none, historicalFundsPledged_every } = where;

    if (+!!historicalFundsPledged_some + +!!historicalFundsPledged_none + +!!historicalFundsPledged_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.historicalFundsPledged_some;
    delete where.historicalFundsPledged_none;
    delete where.historicalFundsPledged_every;
    // remove relation filters to enable warthog query builders

    const { bidparachain_some, bidparachain_none, bidparachain_every } = where;

    if (+!!bidparachain_some + +!!bidparachain_none + +!!bidparachain_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.bidparachain_some;
    delete where.bidparachain_none;
    delete where.bidparachain_every;
    // remove relation filters to enable warthog query builders

    const { crowdloanparachain_some, crowdloanparachain_none, crowdloanparachain_every } = where;

    if (+!!crowdloanparachain_some + +!!crowdloanparachain_none + +!!crowdloanparachain_every > 1) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.crowdloanparachain_some;
    delete where.crowdloanparachain_none;
    delete where.crowdloanparachain_every;
    // remove relation filters to enable warthog query builders

    const {
      historicalincentivesiblingParachain_some,
      historicalincentivesiblingParachain_none,
      historicalincentivesiblingParachain_every,
    } = where;

    if (
      +!!historicalincentivesiblingParachain_some +
        +!!historicalincentivesiblingParachain_none +
        +!!historicalincentivesiblingParachain_every >
      1
    ) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.historicalincentivesiblingParachain_some;
    delete where.historicalincentivesiblingParachain_none;
    delete where.historicalincentivesiblingParachain_every;
    // remove relation filters to enable warthog query builders

    const { incentivesiblingParachain_some, incentivesiblingParachain_none, incentivesiblingParachain_every } = where;

    if (
      +!!incentivesiblingParachain_some + +!!incentivesiblingParachain_none + +!!incentivesiblingParachain_every >
      1
    ) {
      throw new Error(`A query can have at most one of none, some, every clauses on a relation field`);
    }

    delete where.incentivesiblingParachain_some;
    delete where.incentivesiblingParachain_none;
    delete where.incentivesiblingParachain_every;

    let mainQuery = this.buildFindQueryWithParams(<any>where, orderBy, undefined, fields, 'main').take(undefined); // remove LIMIT

    let parameters = mainQuery.getParameters();

    const historicalFundsPledgedFilter =
      historicalFundsPledged_some || historicalFundsPledged_none || historicalFundsPledged_every;

    if (historicalFundsPledgedFilter) {
      const historicalFundsPledgedQuery = this.historicalFundsPledgedService
        .buildFindQueryWithParams(
          <any>historicalFundsPledgedFilter,
          undefined,
          undefined,
          ['id'],
          'historicalFundsPledged'
        )
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...historicalFundsPledgedQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'parachain.historicalFundsPledged',
          'historicalFundsPledged_filtered',
          `historicalFundsPledged_filtered.id IN (${historicalFundsPledgedQuery.getQuery()})`
        )
        .groupBy('parachain_id')
        .addSelect('count(historicalFundsPledged_filtered.id)', 'cnt_filtered')
        .addSelect('parachain.id', 'parachain_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('parachain.historicalFundsPledged', 'historicalFundsPledged_total')
        .groupBy('parachain_id')
        .addSelect('count(historicalFundsPledged_total.id)', 'cnt_total')
        .addSelect('parachain.id', 'parachain_id');

      const subQuery = `
                SELECT
                    f.parachain_id parachain_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.parachain_id = f.parachain_id`;

      if (historicalFundsPledged_none) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    historicalFundsPledged_subq.parachain_id
                FROM
                    (${subQuery}) historicalFundsPledged_subq
                WHERE
                    historicalFundsPledged_subq.cnt_filtered = 0
                )`);
      }

      if (historicalFundsPledged_some) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    historicalFundsPledged_subq.parachain_id
                FROM
                    (${subQuery}) historicalFundsPledged_subq
                WHERE
                    historicalFundsPledged_subq.cnt_filtered > 0
                )`);
      }

      if (historicalFundsPledged_every) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    historicalFundsPledged_subq.parachain_id
                FROM
                    (${subQuery}) historicalFundsPledged_subq
                WHERE
                    historicalFundsPledged_subq.cnt_filtered > 0
                    AND historicalFundsPledged_subq.cnt_filtered = historicalFundsPledged_subq.cnt_total
                )`);
      }
    }

    const bidparachainFilter = bidparachain_some || bidparachain_none || bidparachain_every;

    if (bidparachainFilter) {
      const bidparachainQuery = this.bidparachainService
        .buildFindQueryWithParams(<any>bidparachainFilter, undefined, undefined, ['id'], 'bidparachain')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...bidparachainQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'parachain.bidparachain',
          'bidparachain_filtered',
          `bidparachain_filtered.id IN (${bidparachainQuery.getQuery()})`
        )
        .groupBy('parachain_id')
        .addSelect('count(bidparachain_filtered.id)', 'cnt_filtered')
        .addSelect('parachain.id', 'parachain_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('parachain.bidparachain', 'bidparachain_total')
        .groupBy('parachain_id')
        .addSelect('count(bidparachain_total.id)', 'cnt_total')
        .addSelect('parachain.id', 'parachain_id');

      const subQuery = `
                SELECT
                    f.parachain_id parachain_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.parachain_id = f.parachain_id`;

      if (bidparachain_none) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    bidparachain_subq.parachain_id
                FROM
                    (${subQuery}) bidparachain_subq
                WHERE
                    bidparachain_subq.cnt_filtered = 0
                )`);
      }

      if (bidparachain_some) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    bidparachain_subq.parachain_id
                FROM
                    (${subQuery}) bidparachain_subq
                WHERE
                    bidparachain_subq.cnt_filtered > 0
                )`);
      }

      if (bidparachain_every) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    bidparachain_subq.parachain_id
                FROM
                    (${subQuery}) bidparachain_subq
                WHERE
                    bidparachain_subq.cnt_filtered > 0
                    AND bidparachain_subq.cnt_filtered = bidparachain_subq.cnt_total
                )`);
      }
    }

    const crowdloanparachainFilter = crowdloanparachain_some || crowdloanparachain_none || crowdloanparachain_every;

    if (crowdloanparachainFilter) {
      const crowdloanparachainQuery = this.crowdloanparachainService
        .buildFindQueryWithParams(<any>crowdloanparachainFilter, undefined, undefined, ['id'], 'crowdloanparachain')
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...crowdloanparachainQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'parachain.crowdloanparachain',
          'crowdloanparachain_filtered',
          `crowdloanparachain_filtered.id IN (${crowdloanparachainQuery.getQuery()})`
        )
        .groupBy('parachain_id')
        .addSelect('count(crowdloanparachain_filtered.id)', 'cnt_filtered')
        .addSelect('parachain.id', 'parachain_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('parachain.crowdloanparachain', 'crowdloanparachain_total')
        .groupBy('parachain_id')
        .addSelect('count(crowdloanparachain_total.id)', 'cnt_total')
        .addSelect('parachain.id', 'parachain_id');

      const subQuery = `
                SELECT
                    f.parachain_id parachain_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.parachain_id = f.parachain_id`;

      if (crowdloanparachain_none) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    crowdloanparachain_subq.parachain_id
                FROM
                    (${subQuery}) crowdloanparachain_subq
                WHERE
                    crowdloanparachain_subq.cnt_filtered = 0
                )`);
      }

      if (crowdloanparachain_some) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    crowdloanparachain_subq.parachain_id
                FROM
                    (${subQuery}) crowdloanparachain_subq
                WHERE
                    crowdloanparachain_subq.cnt_filtered > 0
                )`);
      }

      if (crowdloanparachain_every) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    crowdloanparachain_subq.parachain_id
                FROM
                    (${subQuery}) crowdloanparachain_subq
                WHERE
                    crowdloanparachain_subq.cnt_filtered > 0
                    AND crowdloanparachain_subq.cnt_filtered = crowdloanparachain_subq.cnt_total
                )`);
      }
    }

    const historicalincentivesiblingParachainFilter =
      historicalincentivesiblingParachain_some ||
      historicalincentivesiblingParachain_none ||
      historicalincentivesiblingParachain_every;

    if (historicalincentivesiblingParachainFilter) {
      const historicalincentivesiblingParachainQuery = this.historicalincentivesiblingParachainService
        .buildFindQueryWithParams(
          <any>historicalincentivesiblingParachainFilter,
          undefined,
          undefined,
          ['id'],
          'historicalincentivesiblingParachain'
        )
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...historicalincentivesiblingParachainQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'parachain.historicalincentivesiblingParachain',
          'historicalincentivesiblingParachain_filtered',
          `historicalincentivesiblingParachain_filtered.id IN (${historicalincentivesiblingParachainQuery.getQuery()})`
        )
        .groupBy('parachain_id')
        .addSelect('count(historicalincentivesiblingParachain_filtered.id)', 'cnt_filtered')
        .addSelect('parachain.id', 'parachain_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('parachain.historicalincentivesiblingParachain', 'historicalincentivesiblingParachain_total')
        .groupBy('parachain_id')
        .addSelect('count(historicalincentivesiblingParachain_total.id)', 'cnt_total')
        .addSelect('parachain.id', 'parachain_id');

      const subQuery = `
                SELECT
                    f.parachain_id parachain_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.parachain_id = f.parachain_id`;

      if (historicalincentivesiblingParachain_none) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    historicalincentivesiblingParachain_subq.parachain_id
                FROM
                    (${subQuery}) historicalincentivesiblingParachain_subq
                WHERE
                    historicalincentivesiblingParachain_subq.cnt_filtered = 0
                )`);
      }

      if (historicalincentivesiblingParachain_some) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    historicalincentivesiblingParachain_subq.parachain_id
                FROM
                    (${subQuery}) historicalincentivesiblingParachain_subq
                WHERE
                    historicalincentivesiblingParachain_subq.cnt_filtered > 0
                )`);
      }

      if (historicalincentivesiblingParachain_every) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    historicalincentivesiblingParachain_subq.parachain_id
                FROM
                    (${subQuery}) historicalincentivesiblingParachain_subq
                WHERE
                    historicalincentivesiblingParachain_subq.cnt_filtered > 0
                    AND historicalincentivesiblingParachain_subq.cnt_filtered = historicalincentivesiblingParachain_subq.cnt_total
                )`);
      }
    }

    const incentivesiblingParachainFilter =
      incentivesiblingParachain_some || incentivesiblingParachain_none || incentivesiblingParachain_every;

    if (incentivesiblingParachainFilter) {
      const incentivesiblingParachainQuery = this.incentivesiblingParachainService
        .buildFindQueryWithParams(
          <any>incentivesiblingParachainFilter,
          undefined,
          undefined,
          ['id'],
          'incentivesiblingParachain'
        )
        .take(undefined); //remove the default LIMIT

      parameters = { ...parameters, ...incentivesiblingParachainQuery.getParameters() };

      const subQueryFiltered = this.getQueryBuilder()
        .select([])
        .leftJoin(
          'parachain.incentivesiblingParachain',
          'incentivesiblingParachain_filtered',
          `incentivesiblingParachain_filtered.id IN (${incentivesiblingParachainQuery.getQuery()})`
        )
        .groupBy('parachain_id')
        .addSelect('count(incentivesiblingParachain_filtered.id)', 'cnt_filtered')
        .addSelect('parachain.id', 'parachain_id');

      const subQueryTotal = this.getQueryBuilder()
        .select([])
        .leftJoin('parachain.incentivesiblingParachain', 'incentivesiblingParachain_total')
        .groupBy('parachain_id')
        .addSelect('count(incentivesiblingParachain_total.id)', 'cnt_total')
        .addSelect('parachain.id', 'parachain_id');

      const subQuery = `
                SELECT
                    f.parachain_id parachain_id, f.cnt_filtered cnt_filtered, t.cnt_total cnt_total
                FROM
                    (${subQueryTotal.getQuery()}) t, (${subQueryFiltered.getQuery()}) f
                WHERE
                    t.parachain_id = f.parachain_id`;

      if (incentivesiblingParachain_none) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    incentivesiblingParachain_subq.parachain_id
                FROM
                    (${subQuery}) incentivesiblingParachain_subq
                WHERE
                    incentivesiblingParachain_subq.cnt_filtered = 0
                )`);
      }

      if (incentivesiblingParachain_some) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    incentivesiblingParachain_subq.parachain_id
                FROM
                    (${subQuery}) incentivesiblingParachain_subq
                WHERE
                    incentivesiblingParachain_subq.cnt_filtered > 0
                )`);
      }

      if (incentivesiblingParachain_every) {
        mainQuery = mainQuery.andWhere(`parachain.id IN
                (SELECT
                    incentivesiblingParachain_subq.parachain_id
                FROM
                    (${subQuery}) incentivesiblingParachain_subq
                WHERE
                    incentivesiblingParachain_subq.cnt_filtered > 0
                    AND incentivesiblingParachain_subq.cnt_filtered = incentivesiblingParachain_subq.cnt_total
                )`);
      }
    }

    mainQuery = mainQuery.setParameters(parameters);

    return mainQuery.take(limit || 50).skip(offset || 0);
  }
}
