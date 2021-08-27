import { DatabaseManager } from '@subsquid/hydra-common';
import { Account } from '../generated/model';
import { ensure } from '../utils/ensure';

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
        contributions: []
    });

    // persist the account
    await store.save(account);
    return account;
}