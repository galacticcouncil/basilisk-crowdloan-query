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
  CrowdloanCreateInput,
  CrowdloanCreateManyArgs,
  CrowdloanUpdateArgs,
  CrowdloanWhereArgs,
  CrowdloanWhereInput,
  CrowdloanWhereUniqueInput,
  CrowdloanOrderByEnum,
} from '../../warthog';

import { Crowdloan } from './crowdloan.model';
import { CrowdloanService } from './crowdloan.service';

import { Parachain } from '../parachain/parachain.model';
import { ParachainService } from '../parachain/parachain.service';
import { Contribution } from '../contribution/contribution.model';
import { ContributionService } from '../contribution/contribution.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class CrowdloanEdge {
  @Field(() => Crowdloan, { nullable: false })
  node!: Crowdloan;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class CrowdloanConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [CrowdloanEdge], { nullable: false })
  edges!: CrowdloanEdge[];

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
export class CrowdloanConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => CrowdloanWhereInput, { nullable: true })
  where?: CrowdloanWhereInput;

  @Field(() => CrowdloanOrderByEnum, { nullable: true })
  orderBy?: [CrowdloanOrderByEnum];
}

@Resolver(Crowdloan)
export class CrowdloanResolver {
  constructor(@Inject('CrowdloanService') public readonly service: CrowdloanService) {}

  @Query(() => [Crowdloan])
  async crowdloans(
    @Args() { where, orderBy, limit, offset }: CrowdloanWhereArgs,
    @Fields() fields: string[]
  ): Promise<Crowdloan[]> {
    return this.service.find<CrowdloanWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Crowdloan, { nullable: true })
  async crowdloanByUniqueInput(
    @Arg('where') where: CrowdloanWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<Crowdloan | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => CrowdloanConnection)
  async crowdloansConnection(
    @Args() { where, orderBy, ...pageOptions }: CrowdloanConnectionWhereArgs,
    @Info() info: any
  ): Promise<CrowdloanConnection> {
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
      result = await this.service.findConnection<CrowdloanWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<CrowdloanConnection>;
  }

  @FieldResolver(() => Parachain)
  async parachain(@Root() r: Crowdloan, @Ctx() ctx: BaseContext): Promise<Parachain | null> {
    return ctx.dataLoader.loaders.Crowdloan.parachain.load(r);
  }

  @FieldResolver(() => Contribution)
  async contributions(@Root() r: Crowdloan, @Ctx() ctx: BaseContext): Promise<Contribution[] | null> {
    return ctx.dataLoader.loaders.Crowdloan.contributions.load(r);
  }
}
