import { BN } from '@polkadot/util';
import { DatabaseManager } from '@subsquid/hydra-common';
import { Bid, Parachain } from '../generated/model';
import { ensure } from "./ensure"
import { ensureParachain } from './parachain';

export const ensureBid = async (
    store: DatabaseManager,
    paraId: string,
    balance: BN,
    leasePeriodStart: BN,
    leasePeriodEnd: BN,
) => {
    const id = `${leasePeriodStart.toString()}-${leasePeriodEnd.toString()}`;
    const parachain = await ensureParachain(store, paraId);

    const bid = await ensure<Bid>(store, Bid, id, {
        parachain,
        balance,
        leasePeriodStart,
        leasePeriodEnd
    });

    // update the bid if it already existed before
    bid.parachain = parachain;
    bid.balance = balance;

    await store.save(bid);
}