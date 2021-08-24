import { BN } from '@polkadot/util';
import { EventContext, StoreContext } from '@subsquid/hydra-common';
import { Account, Contribution, Parachain } from '../../generated/model';
import { Crowdloan } from '../../types';
import { getOrCreate } from '../../utils/getOrCreate';

const crowdloanContributed = async ({
    store,
    event,
    block
}: EventContext & StoreContext) => {
    // parse ContributedEvent params into the desired format
    const { accountId, paraId, balance } = (() => {
        const [accountId, paraId, balance] = new Crowdloan.ContributedEvent(event).params;
        return { 
            accountId: accountId.toString(), 
            paraId: paraId.toString(), 
            balance 
        };
    })();
    
    const account = await getOrCreate(store, Account, accountId);
    const parachain = await getOrCreate(store, Parachain, paraId);

    // schema not really typechecked for required fields here?
    const contribution = new Contribution({
        balance,
        account: account,
        parachain: parachain,
        blockHeight: new BN(block.height)
    });

    parachain.fundsPledged = new BN(parachain.fundsPledged).add(contribution.balance);

    await store.save(account);
    await store.save(parachain)
    await store.save(contribution)
}
export default crowdloanContributed;