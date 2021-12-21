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
  BidCreateInput,
  BidCreateManyArgs,
  BidUpdateArgs,
  BidWhereArgs,
  BidWhereInput,
  BidWhereUniqueInput,
  BidOrderByEnum,
} from '../../warthog';

import { Bid } from './bid.model';
import { BidService } from './bid.service';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class BidEdge {
  @Field(() => Bid, { nullable: false })
  node!: Bid;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class BidConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [BidEdge], { nullable: false })
  edges!: BidEdge[];

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
export class BidConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => BidWhereInput, { nullable: true })
  where?: BidWhereInput;

  @Field(() => BidOrderByEnum, { nullable: true })
  orderBy?: [BidOrderByEnum];
}

@Resolver(Bid)
export class BidResolver {
  constructor(@Inject('BidService') public readonly service: BidService) {}

  @Query(() => [Bid])
  async bids(@Args() { where, orderBy, limit, offset }: BidWhereArgs, @Fields() fields: string[]): Promise<Bid[]> {
    return this.service.find<BidWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Bid, { nullable: true })
  async bidByUniqueInput(@Arg('where') where: BidWhereUniqueInput, @Fields() fields: string[]): Promise<Bid | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => BidConnection)
  async bidsConnection(
    @Args() { where, orderBy, ...pageOptions }: BidConnectionWhereArgs,
    @Info() info: any
  ): Promise<BidConnection> {
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
      result = await this.service.findConnection<BidWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<BidConnection>;
  }

  @FieldResolver(() => Parachain)
  async parachain(@Root() r: Bid, @Ctx() ctx: BaseContext): Promise<Parachain | null> {
    return ctx.dataLoader.loaders.Bid.parachain.load(r);
  }
}
