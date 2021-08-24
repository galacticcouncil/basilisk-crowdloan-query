// import BN from 'bn.js'
// import { EventContext, StoreContext } from '@subsquid/hydra-common'
// import { Crowdloan } from '../types'
// import { Contribution } from '../generated/model';
import crowdloanContributed from './crowdloan/contributed';

export {
  crowdloanContributed,
};

// export async function crowdloanContributed({
//   store,
//   event,
//   block,
//   extrinsic
// }: EventContext & StoreContext): Promise<void> {
//   let [accountId, paraId, balance] = new Crowdloan.ContributedEvent(event).params;
  
//   const contribution = new Contribution({
//     paraId: paraId.toString(),
//     balance,
//     accountId: accountId.toString(),
//     blockHeight: new BN(block.height)
//   });
//   await store.save(contribution);
// }


// export async function balancesTransfer({
//   store,
//   event,
//   block,
//   extrinsic,
// }: EventContext & StoreContext): Promise<void> {

//   const [from, to, value] = new Balances.TransferEvent(event).params
//   const tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)

//   const fromAcc = await getOrCreate(store, Account, from.toHex())
//   fromAcc.wallet = from.toHuman()
//   fromAcc.balance = fromAcc.balance || new BN(0)
//   fromAcc.balance = fromAcc.balance.sub(value)
//   fromAcc.balance = fromAcc.balance.sub(tip)
//   await store.save(fromAcc)

//   const toAcc = await getOrCreate(store, Account, to.toHex())
//   toAcc.wallet = to.toHuman()
//   toAcc.balance = toAcc.balance || new BN(0)
//   toAcc.balance = toAcc.balance.add(value)
//   await store.save(toAcc)

//   const hbFrom = new HistoricalBalance()
//   hbFrom.account = fromAcc;
//   hbFrom.balance = fromAcc.balance;
//   hbFrom.timestamp = new BN(block.timestamp)
//   await store.save(hbFrom)

//   const hbTo = new HistoricalBalance()
//   hbTo.account = toAcc;
//   hbTo.balance = toAcc.balance;
//   hbTo.timestamp = new BN(block.timestamp)
//   await store.save(hbTo)
// }


