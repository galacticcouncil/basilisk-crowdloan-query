import { DatabaseManager } from "@subsquid/hydra-common";
import {
  Chronicle,
  HistoricalIncentive,
  Incentive,
  Parachain,
} from "../generated/model";
import { Not } from "typeorm";
import { ensure } from "./ensure";

// TODO: can we extract precision from polkadot.js?
// BN does not deal with floats, multiply by a 10^6 to prevent more than reasonable precision loss
export const precisionMultiplierBN = BigInt(10) ** BigInt(6);
export const precisionMultiplier = BigInt(Math.pow(10, 6));

if (!process.env.OWN_PARACHAIN_ID)
  throw new Error("env.OWN_PARACHAIN_ID is not specified");

if (!process.env.OWN_TARGET_AUCTION_INDEX)
  throw new Error("env.OWN_PARACHAIN_ID is not specified");

export const ownParachainId = process.env.OWN_PARACHAIN_ID;

const ensureHistoricalIncentive = async (
  store: DatabaseManager,
  siblingParachain: Parachain | undefined,
  leadPercentageRate: bigint,
  blockHeight: bigint
) => {
  const historicalIncentive = await ensure(
    store,
    HistoricalIncentive,
    blockHeight.toString(),
    { blockHeight, leadPercentageRate, siblingParachain }
  );

  return store.save(historicalIncentive);
};

const incentiveID = "incentive";
const ensureIncentive = async (
  store: DatabaseManager,
  siblingParachain: Parachain | undefined,
  leadPercentageRate: bigint,
  blockHeight: bigint,
) => {
  const incentive = await ensure(store, Incentive, incentiveID, {
    blockHeight,
    leadPercentageRate,
    siblingParachain,
  });

  store.save(incentive);
  return incentive;
};

const updateIncentive = async (
  store: DatabaseManager,
  updatedIncentive: Partial<Incentive>
) => {
  const incentive = await store.get(Incentive, { where: { id: incentiveID } });
  if (incentive) {
    Object.assign(incentive, updatedIncentive);
    await store.save(incentive);
  }
};

export const determineIncentives = async (
  store: DatabaseManager,
  blockHeight: bigint
) => {
  const ownParachainPromise = getOwnParachain(store);
  const siblingParachainPromise = getRivalSibling(store);

  const [ownParachain, siblingParachain] = await Promise.all([
    ownParachainPromise,
    siblingParachainPromise,
  ]);

  // our parachain didnt register for a crowdloan yet, skip calculating incentives
  if (!ownParachain) return;

  const leadPercentageRate = calculateLeadPercentageRate(
    ownParachain,
    siblingParachain
  );

  console.log(
    "calculateLeadPercentageRate",
    (leadPercentageRate / precisionMultiplierBN).toString(),
    (ownParachain.fundsPledged / precisionMultiplierBN).toString(),
    // TODO undefined handling
    (siblingParachain?.fundsPledged! || BigInt(1) / precisionMultiplierBN).toString()
  );

  // ensure the historical entity
  await ensureHistoricalIncentive(
    store,
    siblingParachain,
    leadPercentageRate,
    blockHeight
  );

  // ensure the latest incentives
  await ensureIncentive(
    store,
    siblingParachain,
    leadPercentageRate,
    blockHeight,
  ),
    // update the latest incentives
    await updateIncentive(store, {
      siblingParachain,
      leadPercentageRate,
      blockHeight,
    });
};

// find our own parachain
const getOwnParachain = async (store: DatabaseManager) => {
  return await store.get(Parachain, {
    where: {
      id: ownParachainId,
    },
  });
};

/**
 * 
 * find All parachains that are not us, and have not won an auction yet
 * @important > return them in descending order according to fundsPledged
 */ 
const getSiblings = async (store: DatabaseManager) => {
  return await store.getMany(Parachain, {
    where: {
      id: Not(ownParachainId),
      hasWonAnAuction: false,
    },
    order: {
      fundsPledged: "DESC",
    },
  });
};

const getMostRecentAuctionIndex = async (store: DatabaseManager) => {
  const chronicle = await store.get(Chronicle, {
    where: {
      id: 'chronicle'
    }
  })
  return chronicle?.mostRecentAuctionIndex
};

// get parachain competing with us for the auction index we are targeting
const getRivalSibling = async (store: DatabaseManager) => {

  const siblingsPromise = getSiblings(store);
  const currentAuctionIndexPromise = getMostRecentAuctionIndex(store);
  const [siblings, currentAuctionIndexBigInt] = await Promise.all([
    siblingsPromise,
    currentAuctionIndexPromise,
  ]);
  const currentAuctionIndex = Number(currentAuctionIndexBigInt)
  const ownTargetAuctionIndex = Number(process.env.OWN_TARGET_AUCTION_INDEX);
  const auctionsUntilOurTarget = Math.max( 0, ownTargetAuctionIndex - currentAuctionIndex )
  // if ownTargetAuctionIndex - currentAuctionIndex is a negative number,
  // meaning,  our target auction has passed,
  // then this code implements the assumption that we are therefore going for
  // the current auction,  and that our competition is therefore
  // the sibling with most funds pledged, that is,  the first sibling in the array
  const siblingCompetingForOurTarget = siblings[auctionsUntilOurTarget]

  return siblingCompetingForOurTarget
  // becuase siblings are arranged in descending order according to fundsPledged,
  // we want the sibling that is at the same position in its line as 
  // our target auction index is in its line
  // because that is the sibling in place to win that auction ( irrespective of us )
  // so that sibling is our competition,  and reward modifier(s) are calculated
  // based on comparing us to them in some way.
};

export const calculateLeadPercentageRate = (
  ownParachain: Parachain | undefined,
  siblingParachain: Parachain | undefined
) => {
  // our parachain does not exist yet, no point in calculating incentives
  if (!ownParachain) return BigInt(0);

  // default to 1, to avoid division by 0 errors
  const ownParachainFundsPledged =
    (ownParachain?.fundsPledged || BigInt(1)) * precisionMultiplierBN;
  const siblingParachainFundsPledged =
    (siblingParachain?.fundsPledged || BigInt(1)) * precisionMultiplierBN;

  /**
   * Percentage change between ownParachain.fundsPledged and siblingParachain.fundsPledged
   *
   * Example:
   * own: 125
   * sibling: 100
   * lead: 25%
   *
   * This calculation can be verified here:
   * https://www.calculatorsoup.com/calculators/algebra/percent-change-calculator.php
   */
  const leadPercentageRateMod =
    ((ownParachainFundsPledged - siblingParachainFundsPledged) /
      (siblingParachainFundsPledged / precisionMultiplierBN)) *
    BigInt(100);

  return leadPercentageRateMod;
};
