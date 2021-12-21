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
  HistoricalParachainFundsPledgedCreateInput,
  HistoricalParachainFundsPledgedCreateManyArgs,
  HistoricalParachainFundsPledgedUpdateArgs,
  HistoricalParachainFundsPledgedWhereArgs,
  HistoricalParachainFundsPledgedWhereInput,
  HistoricalParachainFundsPledgedWhereUniqueInput,
  HistoricalParachainFundsPledgedOrderByEnum,
} from '../../warthog';

import { HistoricalParachainFundsPledged } from './historical-parachain-funds-pledged.model';
import { HistoricalParachainFundsPledgedService } from './historical-parachain-funds-pledged.service';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class HistoricalParachainFundsPledgedEdge {
  @Field(() => HistoricalParachainFundsPledged, { nullable: false })
  node!: HistoricalParachainFundsPledged;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class HistoricalParachainFundsPledgedConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [HistoricalParachainFundsPledgedEdge], { nullable: false })
  edges!: HistoricalParachainFundsPledgedEdge[];

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
export class HistoricalParachainFundsPledgedConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => HistoricalParachainFundsPledgedWhereInput, { nullable: true })
  where?: HistoricalParachainFundsPledgedWhereInput;

  @Field(() => HistoricalParachainFundsPledgedOrderByEnum, { nullable: true })
  orderBy?: [HistoricalParachainFundsPledgedOrderByEnum];
}

@Resolver(HistoricalParachainFundsPledged)
export class HistoricalParachainFundsPledgedResolver {
  constructor(
    @Inject('HistoricalParachainFundsPledgedService') public readonly service: HistoricalParachainFundsPledgedService
  ) {}

  @Query(() => [HistoricalParachainFundsPledged])
  async historicalParachainFundsPledgeds(
    @Args() { where, orderBy, limit, offset }: HistoricalParachainFundsPledgedWhereArgs,
    @Fields() fields: string[]
  ): Promise<HistoricalParachainFundsPledged[]> {
    return this.service.find<HistoricalParachainFundsPledgedWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => HistoricalParachainFundsPledged, { nullable: true })
  async historicalParachainFundsPledgedByUniqueInput(
    @Arg('where') where: HistoricalParachainFundsPledgedWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<HistoricalParachainFundsPledged | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => HistoricalParachainFundsPledgedConnection)
  async historicalParachainFundsPledgedsConnection(
    @Args() { where, orderBy, ...pageOptions }: HistoricalParachainFundsPledgedConnectionWhereArgs,
    @Info() info: any
  ): Promise<HistoricalParachainFundsPledgedConnection> {
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
      result = await this.service.findConnection<HistoricalParachainFundsPledgedWhereInput>(
        where,
        orderBy,
        pageOptions,
        rawFields
      );
    } catch (err) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<HistoricalParachainFundsPledgedConnection>;
  }

  @FieldResolver(() => Parachain)
  async parachain(@Root() r: HistoricalParachainFundsPledged, @Ctx() ctx: BaseContext): Promise<Parachain | null> {
    return ctx.dataLoader.loaders.HistoricalParachainFundsPledged.parachain.load(r);
  }
}
