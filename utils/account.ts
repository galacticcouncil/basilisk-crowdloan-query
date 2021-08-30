import { BN } from '@polkadot/util';
import { DatabaseManager } from '@subsquid/hydra-common';
import { Account, Contribution } from '../generated/model';
import { ensure } from '../utils/ensure';
import { encodeAddress,decodeAddress } from '@polkadot/util-crypto';


export const encodeAccountId = (accountId: string) => encodeAddress(decodeAddress(accountId), 2) 

/**
 * Find or create an account based on the accountId (= address)
 */
export const ensureAccount = async (
    store: DatabaseManager,
    accountId: string,
): Promise<Account> => {
    const account = await ensure<Account>(store, Account, accountId, {
        accountId,
        // if we see the account for the first time, we assume
        // it made no contributions so far, otherwise we would have persisted it already
        contributions: [],
        totalContributed: new BN(0)
    });

    // persist the account
    await store.save(account);
    return account;
}

export const updateAccount = async (
    store: DatabaseManager,
    accountId: string,
    contribution: Contribution
) => {
    accountId = encodeAccountId(accountId);
    const account = await store.get(Account, { where: { id: accountId }});
    if (!account || !contribution) return;
    account.totalContributed = account.totalContributed.add(contribution.balance);
    await store.save(account);
}