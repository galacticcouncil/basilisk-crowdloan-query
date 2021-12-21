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
  IncentiveCreateInput,
  IncentiveCreateManyArgs,
  IncentiveUpdateArgs,
  IncentiveWhereArgs,
  IncentiveWhereInput,
  IncentiveWhereUniqueInput,
  IncentiveOrderByEnum,
} from '../../warthog';

import { Incentive } from './incentive.model';
import { IncentiveService } from './incentive.service';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class IncentiveEdge {
  @Field(() => Incentive, { nullable: false })
  node!: Incentive;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class IncentiveConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [IncentiveEdge], { nullable: false })
  edges!: IncentiveEdge[];

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
export class IncentiveConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => IncentiveWhereInput, { nullable: true })
  where?: IncentiveWhereInput;

  @Field(() => IncentiveOrderByEnum, { nullable: true })
  orderBy?: [IncentiveOrderByEnum];
}

@Resolver(Incentive)
export class IncentiveResolver {
  constructor(@Inject('IncentiveService') public readonly service: IncentiveService) {}

  @Query(() => [Incentive])
  async incentives(
    @Args() { where, orderBy, limit, offset }: IncentiveWhereArgs,
    @Fields() fields: string[]
  ): Promise<Incentive[]> {
    return this.service.find<IncentiveWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Incentive, { nullable: true })
  async incentiveByUniqueInput(
    @Arg('where') where: IncentiveWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<Incentive | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => IncentiveConnection)
  async incentivesConnection(
    @Args() { where, orderBy, ...pageOptions }: IncentiveConnectionWhereArgs,
    @Info() info: any
  ): Promise<IncentiveConnection> {
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
      result = await this.service.findConnection<IncentiveWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<IncentiveConnection>;
  }

  @FieldResolver(() => Parachain)
  async siblingParachain(@Root() r: Incentive, @Ctx() ctx: BaseContext): Promise<Parachain | null> {
    return ctx.dataLoader.loaders.Incentive.siblingParachain.load(r);
  }
}
