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
  ContributionCreateInput,
  ContributionCreateManyArgs,
  ContributionUpdateArgs,
  ContributionWhereArgs,
  ContributionWhereInput,
  ContributionWhereUniqueInput,
  ContributionOrderByEnum,
} from '../../warthog';

import { Contribution } from './contribution.model';
import { ContributionService } from './contribution.service';

import { Crowdloan } from '../crowdloan/crowdloan.model';
import { CrowdloanService } from '../crowdloan/crowdloan.service';
import { Account } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { getConnection, getRepository, In, Not } from 'typeorm';
import _ from 'lodash';

@ObjectType()
export class ContributionEdge {
  @Field(() => Contribution, { nullable: false })
  node!: Contribution;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class ContributionConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [ContributionEdge], { nullable: false })
  edges!: ContributionEdge[];

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
export class ContributionConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => ContributionWhereInput, { nullable: true })
  where?: ContributionWhereInput;

  @Field(() => ContributionOrderByEnum, { nullable: true })
  orderBy?: [ContributionOrderByEnum];
}

@Resolver(Contribution)
export class ContributionResolver {
  constructor(@Inject('ContributionService') public readonly service: ContributionService) {}

  @Query(() => [Contribution])
  async contributions(
    @Args() { where, orderBy, limit, offset }: ContributionWhereArgs,
    @Fields() fields: string[]
  ): Promise<Contribution[]> {
    return this.service.find<ContributionWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Contribution, { nullable: true })
  async contributionByUniqueInput(
    @Arg('where') where: ContributionWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<Contribution | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => ContributionConnection)
  async contributionsConnection(
    @Args() { where, orderBy, ...pageOptions }: ContributionConnectionWhereArgs,
    @Info() info: any
  ): Promise<ContributionConnection> {
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
      result = await this.service.findConnection<ContributionWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<ContributionConnection>;
  }

  @FieldResolver(() => Crowdloan)
  async crowdloan(@Root() r: Contribution, @Ctx() ctx: BaseContext): Promise<Crowdloan | null> {
    return ctx.dataLoader.loaders.Contribution.crowdloan.load(r);
  }

  @FieldResolver(() => Account)
  async account(@Root() r: Contribution, @Ctx() ctx: BaseContext): Promise<Account | null> {
    return ctx.dataLoader.loaders.Contribution.account.load(r);
  }
}
