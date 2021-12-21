import 'graphql-import-node'; // Needed so you can import *.graphql files 

import { makeBindingClass, Options } from 'graphql-binding'
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import * as schema from  './schema.graphql'

export interface Query {
    accounts: <T = Array<Account>>(args: { offset?: Int | null, limit?: Int | null, where?: AccountWhereInput | null, orderBy?: Array<AccountOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    accountByUniqueInput: <T = Account | null>(args: { where: AccountWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    accountsConnection: <T = AccountConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: AccountWhereInput | null, orderBy?: Array<AccountOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bids: <T = Array<Bid>>(args: { offset?: Int | null, limit?: Int | null, where?: BidWhereInput | null, orderBy?: Array<BidOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bidByUniqueInput: <T = Bid | null>(args: { where: BidWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    bidsConnection: <T = BidConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: BidWhereInput | null, orderBy?: Array<BidOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    chronicles: <T = Array<Chronicle>>(args: { offset?: Int | null, limit?: Int | null, where?: ChronicleWhereInput | null, orderBy?: Array<ChronicleOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    chronicleByUniqueInput: <T = Chronicle | null>(args: { where: ChronicleWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    chroniclesConnection: <T = ChronicleConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: ChronicleWhereInput | null, orderBy?: Array<ChronicleOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    contributions: <T = Array<Contribution>>(args: { offset?: Int | null, limit?: Int | null, where?: ContributionWhereInput | null, orderBy?: Array<ContributionOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    contributionByUniqueInput: <T = Contribution | null>(args: { where: ContributionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    contributionsConnection: <T = ContributionConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: ContributionWhereInput | null, orderBy?: Array<ContributionOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    crowdloans: <T = Array<Crowdloan>>(args: { offset?: Int | null, limit?: Int | null, where?: CrowdloanWhereInput | null, orderBy?: Array<CrowdloanOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    crowdloanByUniqueInput: <T = Crowdloan | null>(args: { where: CrowdloanWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    crowdloansConnection: <T = CrowdloanConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: CrowdloanWhereInput | null, orderBy?: Array<CrowdloanOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    historicalIncentives: <T = Array<HistoricalIncentive>>(args: { offset?: Int | null, limit?: Int | null, where?: HistoricalIncentiveWhereInput | null, orderBy?: Array<HistoricalIncentiveOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    historicalIncentiveByUniqueInput: <T = HistoricalIncentive | null>(args: { where: HistoricalIncentiveWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    historicalIncentivesConnection: <T = HistoricalIncentiveConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: HistoricalIncentiveWhereInput | null, orderBy?: Array<HistoricalIncentiveOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    historicalParachainFundsPledgeds: <T = Array<HistoricalParachainFundsPledged>>(args: { offset?: Int | null, limit?: Int | null, where?: HistoricalParachainFundsPledgedWhereInput | null, orderBy?: Array<HistoricalParachainFundsPledgedOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    historicalParachainFundsPledgedByUniqueInput: <T = HistoricalParachainFundsPledged | null>(args: { where: HistoricalParachainFundsPledgedWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    historicalParachainFundsPledgedsConnection: <T = HistoricalParachainFundsPledgedConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: HistoricalParachainFundsPledgedWhereInput | null, orderBy?: Array<HistoricalParachainFundsPledgedOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    incentives: <T = Array<Incentive>>(args: { offset?: Int | null, limit?: Int | null, where?: IncentiveWhereInput | null, orderBy?: Array<IncentiveOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    incentiveByUniqueInput: <T = Incentive | null>(args: { where: IncentiveWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    incentivesConnection: <T = IncentiveConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: IncentiveWhereInput | null, orderBy?: Array<IncentiveOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    parachains: <T = Array<Parachain>>(args: { offset?: Int | null, limit?: Int | null, where?: ParachainWhereInput | null, orderBy?: Array<ParachainOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    parachainByUniqueInput: <T = Parachain | null>(args: { where: ParachainWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    parachainsConnection: <T = ParachainConnection>(args: { first?: Int | null, after?: String | null, last?: Int | null, before?: String | null, where?: ParachainWhereInput | null, orderBy?: Array<ParachainOrderByInput> | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    hello: <T = Hello>(args?: {}, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Mutation {}

export interface Subscription {
    stateSubscription: <T = ProcessorState>(args?: {}, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T>> 
  }

export interface Binding {
  query: Query
  mutation: Mutation
  subscription: Subscription
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
  delegateSubscription(fieldName: string, args?: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
  getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(...args: any[]): T
}

export const Binding = makeBindingClass<BindingConstructor<Binding>>({ schema: schema as any })

/**
 * Types
*/

export type AccountOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'accountId_ASC' |
  'accountId_DESC' |
  'totalContributed_ASC' |
  'totalContributed_DESC'

export type BidOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'parachain_ASC' |
  'parachain_DESC' |
  'balance_ASC' |
  'balance_DESC' |
  'leasePeriodStart_ASC' |
  'leasePeriodStart_DESC' |
  'leasePeriodEnd_ASC' |
  'leasePeriodEnd_DESC'

export type ChronicleOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'lastProcessedBlock_ASC' |
  'lastProcessedBlock_DESC' |
  'mostRecentAuctionStart_ASC' |
  'mostRecentAuctionStart_DESC' |
  'mostRecentAuctionClosingStart_ASC' |
  'mostRecentAuctionClosingStart_DESC'

export type ContributionOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'crowdloan_ASC' |
  'crowdloan_DESC' |
  'account_ASC' |
  'account_DESC' |
  'balance_ASC' |
  'balance_DESC' |
  'blockHeight_ASC' |
  'blockHeight_DESC'

export type CrowdloanOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'parachain_ASC' |
  'parachain_DESC' |
  'raised_ASC' |
  'raised_DESC'

export type HistoricalIncentiveOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'blockHeight_ASC' |
  'blockHeight_DESC' |
  'leadPercentageRate_ASC' |
  'leadPercentageRate_DESC' |
  'siblingParachain_ASC' |
  'siblingParachain_DESC'

export type HistoricalParachainFundsPledgedOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'parachain_ASC' |
  'parachain_DESC' |
  'blockHeight_ASC' |
  'blockHeight_DESC' |
  'fundsPledged_ASC' |
  'fundsPledged_DESC'

export type IncentiveOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'blockHeight_ASC' |
  'blockHeight_DESC' |
  'leadPercentageRate_ASC' |
  'leadPercentageRate_DESC' |
  'siblingParachain_ASC' |
  'siblingParachain_DESC' |
  'totalContributionWeight_ASC' |
  'totalContributionWeight_DESC'

export type ParachainOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'paraId_ASC' |
  'paraId_DESC' |
  'fundsPledged_ASC' |
  'fundsPledged_DESC' |
  'hasWonAnAuction_ASC' |
  'hasWonAnAuction_DESC'

export interface AccountCreateInput {
  accountId: String
  totalContributed: String
}

export interface AccountUpdateInput {
  accountId?: String | null
  totalContributed?: String | null
}

export interface AccountWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  accountId_eq?: String | null
  accountId_contains?: String | null
  accountId_startsWith?: String | null
  accountId_endsWith?: String | null
  accountId_in?: String[] | String | null
  totalContributed_eq?: BigInt | null
  totalContributed_gt?: BigInt | null
  totalContributed_gte?: BigInt | null
  totalContributed_lt?: BigInt | null
  totalContributed_lte?: BigInt | null
  totalContributed_in?: BigInt[] | BigInt | null
  contributions_none?: ContributionWhereInput | null
  contributions_some?: ContributionWhereInput | null
  contributions_every?: ContributionWhereInput | null
  AND?: AccountWhereInput[] | AccountWhereInput | null
  OR?: AccountWhereInput[] | AccountWhereInput | null
}

export interface AccountWhereUniqueInput {
  id: ID_Output
}

export interface BaseWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
}

export interface BidCreateInput {
  parachain: ID_Output
  balance: String
  leasePeriodStart: String
  leasePeriodEnd: String
}

export interface BidUpdateInput {
  parachain?: ID_Input | null
  balance?: String | null
  leasePeriodStart?: String | null
  leasePeriodEnd?: String | null
}

export interface BidWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  balance_eq?: BigInt | null
  balance_gt?: BigInt | null
  balance_gte?: BigInt | null
  balance_lt?: BigInt | null
  balance_lte?: BigInt | null
  balance_in?: BigInt[] | BigInt | null
  leasePeriodStart_eq?: BigInt | null
  leasePeriodStart_gt?: BigInt | null
  leasePeriodStart_gte?: BigInt | null
  leasePeriodStart_lt?: BigInt | null
  leasePeriodStart_lte?: BigInt | null
  leasePeriodStart_in?: BigInt[] | BigInt | null
  leasePeriodEnd_eq?: BigInt | null
  leasePeriodEnd_gt?: BigInt | null
  leasePeriodEnd_gte?: BigInt | null
  leasePeriodEnd_lt?: BigInt | null
  leasePeriodEnd_lte?: BigInt | null
  leasePeriodEnd_in?: BigInt[] | BigInt | null
  parachain?: ParachainWhereInput | null
  AND?: BidWhereInput[] | BidWhereInput | null
  OR?: BidWhereInput[] | BidWhereInput | null
}

export interface BidWhereUniqueInput {
  id: ID_Output
}

export interface ChronicleCreateInput {
  lastProcessedBlock: String
  mostRecentAuctionStart?: String | null
  mostRecentAuctionClosingStart?: String | null
}

export interface ChronicleUpdateInput {
  lastProcessedBlock?: String | null
  mostRecentAuctionStart?: String | null
  mostRecentAuctionClosingStart?: String | null
}

export interface ChronicleWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  lastProcessedBlock_eq?: BigInt | null
  lastProcessedBlock_gt?: BigInt | null
  lastProcessedBlock_gte?: BigInt | null
  lastProcessedBlock_lt?: BigInt | null
  lastProcessedBlock_lte?: BigInt | null
  lastProcessedBlock_in?: BigInt[] | BigInt | null
  mostRecentAuctionStart_eq?: BigInt | null
  mostRecentAuctionStart_gt?: BigInt | null
  mostRecentAuctionStart_gte?: BigInt | null
  mostRecentAuctionStart_lt?: BigInt | null
  mostRecentAuctionStart_lte?: BigInt | null
  mostRecentAuctionStart_in?: BigInt[] | BigInt | null
  mostRecentAuctionClosingStart_eq?: BigInt | null
  mostRecentAuctionClosingStart_gt?: BigInt | null
  mostRecentAuctionClosingStart_gte?: BigInt | null
  mostRecentAuctionClosingStart_lt?: BigInt | null
  mostRecentAuctionClosingStart_lte?: BigInt | null
  mostRecentAuctionClosingStart_in?: BigInt[] | BigInt | null
  AND?: ChronicleWhereInput[] | ChronicleWhereInput | null
  OR?: ChronicleWhereInput[] | ChronicleWhereInput | null
}

export interface ChronicleWhereUniqueInput {
  id: ID_Output
}

export interface ContributionCreateInput {
  crowdloan: ID_Output
  account: ID_Output
  balance: String
  blockHeight: String
}

export interface ContributionUpdateInput {
  crowdloan?: ID_Input | null
  account?: ID_Input | null
  balance?: String | null
  blockHeight?: String | null
}

export interface ContributionWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  balance_eq?: BigInt | null
  balance_gt?: BigInt | null
  balance_gte?: BigInt | null
  balance_lt?: BigInt | null
  balance_lte?: BigInt | null
  balance_in?: BigInt[] | BigInt | null
  blockHeight_eq?: BigInt | null
  blockHeight_gt?: BigInt | null
  blockHeight_gte?: BigInt | null
  blockHeight_lt?: BigInt | null
  blockHeight_lte?: BigInt | null
  blockHeight_in?: BigInt[] | BigInt | null
  crowdloan?: CrowdloanWhereInput | null
  account?: AccountWhereInput | null
  AND?: ContributionWhereInput[] | ContributionWhereInput | null
  OR?: ContributionWhereInput[] | ContributionWhereInput | null
}

export interface ContributionWhereUniqueInput {
  id: ID_Output
}

export interface CrowdloanCreateInput {
  parachain: ID_Output
  raised: String
}

export interface CrowdloanUpdateInput {
  parachain?: ID_Input | null
  raised?: String | null
}

export interface CrowdloanWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  raised_eq?: BigInt | null
  raised_gt?: BigInt | null
  raised_gte?: BigInt | null
  raised_lt?: BigInt | null
  raised_lte?: BigInt | null
  raised_in?: BigInt[] | BigInt | null
  parachain?: ParachainWhereInput | null
  contributions_none?: ContributionWhereInput | null
  contributions_some?: ContributionWhereInput | null
  contributions_every?: ContributionWhereInput | null
  AND?: CrowdloanWhereInput[] | CrowdloanWhereInput | null
  OR?: CrowdloanWhereInput[] | CrowdloanWhereInput | null
}

export interface CrowdloanWhereUniqueInput {
  id: ID_Output
}

export interface HistoricalIncentiveCreateInput {
  blockHeight: String
  leadPercentageRate: String
  siblingParachain?: ID_Input | null
}

export interface HistoricalIncentiveUpdateInput {
  blockHeight?: String | null
  leadPercentageRate?: String | null
  siblingParachain?: ID_Input | null
}

export interface HistoricalIncentiveWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  blockHeight_eq?: BigInt | null
  blockHeight_gt?: BigInt | null
  blockHeight_gte?: BigInt | null
  blockHeight_lt?: BigInt | null
  blockHeight_lte?: BigInt | null
  blockHeight_in?: BigInt[] | BigInt | null
  leadPercentageRate_eq?: BigInt | null
  leadPercentageRate_gt?: BigInt | null
  leadPercentageRate_gte?: BigInt | null
  leadPercentageRate_lt?: BigInt | null
  leadPercentageRate_lte?: BigInt | null
  leadPercentageRate_in?: BigInt[] | BigInt | null
  siblingParachain?: ParachainWhereInput | null
  AND?: HistoricalIncentiveWhereInput[] | HistoricalIncentiveWhereInput | null
  OR?: HistoricalIncentiveWhereInput[] | HistoricalIncentiveWhereInput | null
}

export interface HistoricalIncentiveWhereUniqueInput {
  id: ID_Output
}

export interface HistoricalParachainFundsPledgedCreateInput {
  parachain: ID_Output
  blockHeight: String
  fundsPledged: String
}

export interface HistoricalParachainFundsPledgedUpdateInput {
  parachain?: ID_Input | null
  blockHeight?: String | null
  fundsPledged?: String | null
}

export interface HistoricalParachainFundsPledgedWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  blockHeight_eq?: BigInt | null
  blockHeight_gt?: BigInt | null
  blockHeight_gte?: BigInt | null
  blockHeight_lt?: BigInt | null
  blockHeight_lte?: BigInt | null
  blockHeight_in?: BigInt[] | BigInt | null
  fundsPledged_eq?: BigInt | null
  fundsPledged_gt?: BigInt | null
  fundsPledged_gte?: BigInt | null
  fundsPledged_lt?: BigInt | null
  fundsPledged_lte?: BigInt | null
  fundsPledged_in?: BigInt[] | BigInt | null
  parachain?: ParachainWhereInput | null
  AND?: HistoricalParachainFundsPledgedWhereInput[] | HistoricalParachainFundsPledgedWhereInput | null
  OR?: HistoricalParachainFundsPledgedWhereInput[] | HistoricalParachainFundsPledgedWhereInput | null
}

export interface HistoricalParachainFundsPledgedWhereUniqueInput {
  id: ID_Output
}

export interface IncentiveCreateInput {
  blockHeight: String
  leadPercentageRate: String
  siblingParachain?: ID_Input | null
  totalContributionWeight: String
}

export interface IncentiveUpdateInput {
  blockHeight?: String | null
  leadPercentageRate?: String | null
  siblingParachain?: ID_Input | null
  totalContributionWeight?: String | null
}

export interface IncentiveWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  blockHeight_eq?: BigInt | null
  blockHeight_gt?: BigInt | null
  blockHeight_gte?: BigInt | null
  blockHeight_lt?: BigInt | null
  blockHeight_lte?: BigInt | null
  blockHeight_in?: BigInt[] | BigInt | null
  leadPercentageRate_eq?: BigInt | null
  leadPercentageRate_gt?: BigInt | null
  leadPercentageRate_gte?: BigInt | null
  leadPercentageRate_lt?: BigInt | null
  leadPercentageRate_lte?: BigInt | null
  leadPercentageRate_in?: BigInt[] | BigInt | null
  totalContributionWeight_eq?: BigInt | null
  totalContributionWeight_gt?: BigInt | null
  totalContributionWeight_gte?: BigInt | null
  totalContributionWeight_lt?: BigInt | null
  totalContributionWeight_lte?: BigInt | null
  totalContributionWeight_in?: BigInt[] | BigInt | null
  siblingParachain?: ParachainWhereInput | null
  AND?: IncentiveWhereInput[] | IncentiveWhereInput | null
  OR?: IncentiveWhereInput[] | IncentiveWhereInput | null
}

export interface IncentiveWhereUniqueInput {
  id: ID_Output
}

export interface ParachainCreateInput {
  paraId: String
  fundsPledged: String
  hasWonAnAuction: Boolean
}

export interface ParachainUpdateInput {
  paraId?: String | null
  fundsPledged?: String | null
  hasWonAnAuction?: Boolean | null
}

export interface ParachainWhereInput {
  id_eq?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  createdAt_eq?: DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  createdById_eq?: ID_Input | null
  createdById_in?: ID_Output[] | ID_Output | null
  updatedAt_eq?: DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  updatedById_eq?: ID_Input | null
  updatedById_in?: ID_Output[] | ID_Output | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: DateTime | null
  deletedAt_lt?: DateTime | null
  deletedAt_lte?: DateTime | null
  deletedAt_gt?: DateTime | null
  deletedAt_gte?: DateTime | null
  deletedById_eq?: ID_Input | null
  deletedById_in?: ID_Output[] | ID_Output | null
  paraId_eq?: String | null
  paraId_contains?: String | null
  paraId_startsWith?: String | null
  paraId_endsWith?: String | null
  paraId_in?: String[] | String | null
  fundsPledged_eq?: BigInt | null
  fundsPledged_gt?: BigInt | null
  fundsPledged_gte?: BigInt | null
  fundsPledged_lt?: BigInt | null
  fundsPledged_lte?: BigInt | null
  fundsPledged_in?: BigInt[] | BigInt | null
  hasWonAnAuction_eq?: Boolean | null
  hasWonAnAuction_in?: Boolean[] | Boolean | null
  historicalFundsPledged_none?: HistoricalParachainFundsPledgedWhereInput | null
  historicalFundsPledged_some?: HistoricalParachainFundsPledgedWhereInput | null
  historicalFundsPledged_every?: HistoricalParachainFundsPledgedWhereInput | null
  bidparachain_none?: BidWhereInput | null
  bidparachain_some?: BidWhereInput | null
  bidparachain_every?: BidWhereInput | null
  crowdloanparachain_none?: CrowdloanWhereInput | null
  crowdloanparachain_some?: CrowdloanWhereInput | null
  crowdloanparachain_every?: CrowdloanWhereInput | null
  historicalincentivesiblingParachain_none?: HistoricalIncentiveWhereInput | null
  historicalincentivesiblingParachain_some?: HistoricalIncentiveWhereInput | null
  historicalincentivesiblingParachain_every?: HistoricalIncentiveWhereInput | null
  incentivesiblingParachain_none?: IncentiveWhereInput | null
  incentivesiblingParachain_some?: IncentiveWhereInput | null
  incentivesiblingParachain_every?: IncentiveWhereInput | null
  AND?: ParachainWhereInput[] | ParachainWhereInput | null
  OR?: ParachainWhereInput[] | ParachainWhereInput | null
}

export interface ParachainWhereUniqueInput {
  id: ID_Output
}

export interface BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface DeleteResponse {
  id: ID_Output
}

export interface Account extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  accountId: String
  totalContributed: BigInt
  contributions: Array<Contribution>
}

export interface AccountConnection {
  totalCount: Int
  edges: Array<AccountEdge>
  pageInfo: PageInfo
}

export interface AccountEdge {
  node: Account
  cursor: String
}

export interface BaseModel extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface BaseModelUUID extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface Bid extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  parachain: Parachain
  parachainId: String
  balance: BigInt
  leasePeriodStart: BigInt
  leasePeriodEnd: BigInt
}

export interface BidConnection {
  totalCount: Int
  edges: Array<BidEdge>
  pageInfo: PageInfo
}

export interface BidEdge {
  node: Bid
  cursor: String
}

export interface Chronicle extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  lastProcessedBlock: BigInt
  mostRecentAuctionStart?: BigInt | null
  mostRecentAuctionClosingStart?: BigInt | null
}

export interface ChronicleConnection {
  totalCount: Int
  edges: Array<ChronicleEdge>
  pageInfo: PageInfo
}

export interface ChronicleEdge {
  node: Chronicle
  cursor: String
}

export interface Contribution extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  crowdloan: Crowdloan
  crowdloanId: String
  account: Account
  accountId: String
  balance: BigInt
  blockHeight: BigInt
}

export interface ContributionConnection {
  totalCount: Int
  edges: Array<ContributionEdge>
  pageInfo: PageInfo
}

export interface ContributionEdge {
  node: Contribution
  cursor: String
}

export interface Crowdloan extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  parachain: Parachain
  parachainId: String
  raised: BigInt
  contributions: Array<Contribution>
}

export interface CrowdloanConnection {
  totalCount: Int
  edges: Array<CrowdloanEdge>
  pageInfo: PageInfo
}

export interface CrowdloanEdge {
  node: Crowdloan
  cursor: String
}

export interface Hello {
  greeting: String
}

export interface HistoricalIncentive extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  blockHeight: BigInt
  leadPercentageRate: BigInt
  siblingParachain?: Parachain | null
  siblingParachainId?: String | null
}

export interface HistoricalIncentiveConnection {
  totalCount: Int
  edges: Array<HistoricalIncentiveEdge>
  pageInfo: PageInfo
}

export interface HistoricalIncentiveEdge {
  node: HistoricalIncentive
  cursor: String
}

export interface HistoricalParachainFundsPledged extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  parachain: Parachain
  parachainId: String
  blockHeight: BigInt
  fundsPledged: BigInt
}

export interface HistoricalParachainFundsPledgedConnection {
  totalCount: Int
  edges: Array<HistoricalParachainFundsPledgedEdge>
  pageInfo: PageInfo
}

export interface HistoricalParachainFundsPledgedEdge {
  node: HistoricalParachainFundsPledged
  cursor: String
}

export interface Incentive extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  blockHeight: BigInt
  leadPercentageRate: BigInt
  siblingParachain?: Parachain | null
  siblingParachainId?: String | null
  totalContributionWeight: BigInt
}

export interface IncentiveConnection {
  totalCount: Int
  edges: Array<IncentiveEdge>
  pageInfo: PageInfo
}

export interface IncentiveEdge {
  node: Incentive
  cursor: String
}

export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String | null
  endCursor?: String | null
}

export interface Parachain extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  paraId: String
  fundsPledged: BigInt
  hasWonAnAuction: Boolean
  historicalFundsPledged: Array<HistoricalParachainFundsPledged>
  bidparachain?: Array<Bid> | null
  crowdloanparachain?: Array<Crowdloan> | null
  historicalincentivesiblingParachain?: Array<HistoricalIncentive> | null
  incentivesiblingParachain?: Array<Incentive> | null
}

export interface ParachainConnection {
  totalCount: Int
  edges: Array<ParachainEdge>
  pageInfo: PageInfo
}

export interface ParachainEdge {
  node: Parachain
  cursor: String
}

export interface ProcessorState {
  lastCompleteBlock: Float
  lastProcessedEvent: String
  indexerHead: Float
  chainHead: Float
}

export interface StandardDeleteResponse {
  id: ID_Output
}

/*
GraphQL representation of BigInt
*/
export type BigInt = string

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
The javascript `Date` as string. Type represents date and time as the ISO Date string.
*/
export type DateTime = Date | string

/*
The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).
*/
export type Float = number

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.
*/
export type Int = number

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string