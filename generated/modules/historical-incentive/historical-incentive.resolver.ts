import {
  Arg,
  Args,
  Mutation,
  Query,
  Root,
  Resolver,
  FieldResolver,
  ObjectType,
  Field,
  Int,
  ArgsType,
  Info,
  Ctx,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { Inject } from 'typedi';
import { Min } from 'class-validator';
import {
  Fields,
  StandardDeleteResponse,
  UserId,
  PageInfo,
  RawFields,
  NestedFields,
  BaseContext,
} from '@subsquid/warthog';

import {
  HistoricalIncentiveCreateInput,
  HistoricalIncentiveCreateManyArgs,
  HistoricalIncentiveUpdateArgs,
  HistoricalIncentiveWhereArgs,
  HistoricalIncentiveWhereInput,
  HistoricalIncentiveWhereUniqueInput,
  HistoricalIncentiveOrderByEnum,
} from '../../warthog';

import { HistoricalIncentive } from './historical-incentive.model';
import { HistoricalIncentiveService } from './historical-incentive.service';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class HistoricalIncentiveEdge {
  @Field(() => HistoricalIncentive, { nullable: false })
  node!: HistoricalIncentive;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalIncentiveConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalIncentiveEdge], { nullable: false })
  edges!: HistoricalIncentiveEdge[];

  @Field(() => PageInfo, { nullable: false })
  pageInfo!: PageInfo;
}

@ArgsType()
export class ConnectionPageInputOptions {
  @Field(() => Int, { nullable: true })
  @Min(0)
  first?: number;

  @Field(() => String, { nullable: true })
  after?: string; // V3: TODO: should we make a RelayCursor scalar?

  @Field(() => Int, { nullable: true })
  @Min(0)
  last?: number;

  @Field(() => String, { nullable: true })
  before?: string;
}

@ArgsType()
export class HistoricalIncentiveConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalIncentiveWhereInput, { nullable: true })
  where?: HistoricalIncentiveWhereInput;

  @Field(() => HistoricalIncentiveOrderByEnum, { nullable: true })
  orderBy?: [HistoricalIncentiveOrderByEnum];
}

@Resolver(HistoricalIncentive)
export class HistoricalIncentiveResolver {
  constructor(@Inject('HistoricalIncentiveService') public readonly service: HistoricalIncentiveService) {}

  @Query(() => [HistoricalIncentive])
  async historicalIncentives(
    @Args() { where, orderBy, limit, offset }: HistoricalIncentiveWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalIncentive[]> {
    return this.service.find<HistoricalIncentiveWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalIncentive, { nullable: true })
  async historicalIncentiveByUniqueInput(
    @Arg('where') where: HistoricalIncentiveWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalIncentive | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalIncentiveConnection)
  async historicalIncentivesConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalIncentiveConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalIncentiveConnection> {
    const rawFields = graphqlFields(info, {}, { excludedFields: ['__typename'] });

    let result: any = {
      totalCount: 0,
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    // If the related database table does not have any records then an error is thrown to the client
    // by warthog
    try {
      result = await this.service.findConnection<HistoricalIncentiveWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<HistoricalIncentiveConnection>;
  }

  @FieldResolver(() => Parachain)
  async siblingParachain(@Root() r: HistoricalIncentive, @Ctx() ctx: BaseContext): Promise<Parachain | null> {
    return ctx.dataLoader.loaders.HistoricalIncentive.siblingParachain.load(r);
  }
}
