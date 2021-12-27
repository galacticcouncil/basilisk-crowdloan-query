import { DatabaseManager } from "@subsquid/hydra-common";
import { Contribution, Crowdloan } from "../generated/model";
import { ensure } from "./ensure";
import { ensureParachain } from "./parachain";
import { ensureAccount, updateAccount } from "./account";

/**
 * Create a new contribution and assign all the useful relationships to it
 */
export const createContribution = async (
  store: DatabaseManager,
  crowdloan: Crowdloan,
  accountId: string,
  balance: bigint,
  blockHeight: bigint,
  contributionReward: bigint,
): Promise<Contribution> => {
  // alternatively use UUID to generate a unique ID for the entity
  // calculate an incremental ID based on
  // the count of existing user's contributions to this parachain/crowdloan
  const id = await (async () => {
    const userContributions = await store.getMany(Contribution, {
      where: {
        account: accountId,
      },
    });

    return `${accountId}-${userContributions.length}`;
  })();

  const account = await ensureAccount(store, accountId);

  const contribution = new Contribution({
    id,
    crowdloan,
    account,
    balance,
    blockHeight,
    contributionReward
  });

  await updateAccount(store, accountId, contribution);

  await store.save(contribution);
  return contribution;
};

/**
 * Find or create a crowdloan with default values,
 * using the `paraId` as the unique ID
 */
export const ensureCrowdloan = async (
  store: DatabaseManager,
  paraId: string
): Promise<Crowdloan> => {
  // fetch the parachain associated with the crowdloan
  const parachain = await ensureParachain(store, paraId);
  // ensure the crowdloan with appropriate default parameters
  const crowdloan = await ensure<Crowdloan>(store, Crowdloan, paraId, {
    parachain,
    contributions: [],
    raised: BigInt(0),
  });

  // persist the crowdloan
  await store.save(crowdloan);
  return crowdloan;
};

/**
 * Increment raised funds of the given crowdloan,
 * by the given amount.
 */
export const updateCrowdloanFunds = async (
  store: DatabaseManager,
  crowdloan: Crowdloan,
  newFunds: bigint
) => {
  crowdloan.raised = crowdloan.raised + newFunds;
  await store.save(crowdloan);
};
