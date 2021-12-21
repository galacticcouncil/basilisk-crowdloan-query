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
  ChronicleCreateInput,
  ChronicleCreateManyArgs,
  ChronicleUpdateArgs,
  ChronicleWhereArgs,
  ChronicleWhereInput,
  ChronicleWhereUniqueInput,
  ChronicleOrderByEnum,
} from '../../warthog';

import { Chronicle } from './chronicle.model';
import { ChronicleService } from './chronicle.service';

@ObjectType()
export class ChronicleEdge {
  @Field(() => Chronicle, { nullable: false })
  node!: Chronicle;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class ChronicleConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [ChronicleEdge], { nullable: false })
  edges!: ChronicleEdge[];

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
export class ChronicleConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => ChronicleWhereInput, { nullable: true })
  where?: ChronicleWhereInput;

  @Field(() => ChronicleOrderByEnum, { nullable: true })
  orderBy?: [ChronicleOrderByEnum];
}

@Resolver(Chronicle)
export class ChronicleResolver {
  constructor(@Inject('ChronicleService') public readonly service: ChronicleService) {}

  @Query(() => [Chronicle])
  async chronicles(
    @Args() { where, orderBy, limit, offset }: ChronicleWhereArgs,
    @Fields() fields: string[]
  ): Promise<Chronicle[]> {
    return this.service.find<ChronicleWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => Chronicle, { nullable: true })
  async chronicleByUniqueInput(
    @Arg('where') where: ChronicleWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<Chronicle | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => ChronicleConnection)
  async chroniclesConnection(
    @Args() { where, orderBy, ...pageOptions }: ChronicleConnectionWhereArgs,
    @Info() info: any
  ): Promise<ChronicleConnection> {
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
      result = await this.service.findConnection<ChronicleWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<ChronicleConnection>;
  }
}
