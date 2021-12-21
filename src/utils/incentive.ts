import { DatabaseManager } from "@subsquid/hydra-common";
import {
  Contribution,
  HistoricalIncentive,
  Incentive,
  Parachain,
} from "../generated/model";
import { Not } from "typeorm";
import { BN } from "@polkadot/util";
import { ensure } from "./ensure";
import { auctionEndingPeriodLength } from "./auction";
import linearScale from "simple-linear-scale";
import { ensureChronicle } from "./chronicle";

// TODO: can we extract precision from polkadot.js?
// BN does not deal with floats, multiply by a 10^6 to prevent more than reasonable precision loss
export const precisionMultiplierBN = BigInt(10) ** BigInt(6);
export const precisionMultiplier = BigInt(Math.pow(10, 6));

if (!process.env.OWN_PARACHAIN_ID)
  throw new Error("env.OWN_PARACHAIN_ID is not specified");
if (!process.env.BSX_MULTIPLIER_MIN)
  throw new Error("env.BSX_MULTIPLIER_MIN is not specified");
if (!process.env.BSX_MULTIPLIER_MAX)
  throw new Error("env.BSX_MULTIPLIER_MAX is not specified");

export const ownParachainId = process.env.OWN_PARACHAIN_ID;
export const bsxMultiplierMin = BigInt(process.env.BSX_MULTIPLIER_MIN) * precisionMultiplier;
export const bsxMultiplierMax = BigInt(process.env.BSX_MULTIPLIER_MAX) * precisionMultiplier;
export const bsxMultiplierNone = BigInt(0);

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
  const siblingParachainPromise = getSiblingParachain(store);

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
    (siblingParachain?.fundsPledged! / precisionMultiplierBN).toString()
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

// find parachains that are not us, and have not won an auction yet
const getSiblingParachain = async (store: DatabaseManager) => {
  return await store.get(Parachain, {
    where: {
      id: Not(ownParachainId),
      hasWonAnAuction: false,
    },
    order: {
      fundsPledged: "DESC",
    },
  });
};

export const calculateLeadPercentageRate = (
  ownParachain: Parachain | undefined,
  siblingParachain: Parachain | undefined
) => {
  // our parachain does not exist yet, no point in calculating incentives
  if (!ownParachain) return BigInt(0);

  // default to 1, to avoit division by 0 errors
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
