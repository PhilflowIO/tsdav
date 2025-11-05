/**
 * AddressBook Collection Migrator
 * Implements CardDAV migration for address books with vCard support
 */

import { DAVAddressBook, DAVVCard, DAVNamespaceShort } from 'tsdav';
import chalk from 'chalk';
import { CollectionMigrator, DAVCollection, DAVObject } from './CollectionMigrator';
import { UIDExtractor } from '../utils/uidExtractor';

/**
 * CardDAV-specific migrator for addressbooks (contacts)
 */
export class AddressBookCollectionMigrator extends CollectionMigrator {
  /**
   * Fetch all addressbooks from source
   */
  async fetchSourceCollections(): Promise<DAVCollection[]> {
    // Temporarily override homeUrl to point to addressbook home for fetching
    const originalHomeUrl = this.sourceClient.account?.homeUrl;

    try {
      // Determine the addressbook home URL (same logic as in createCollection)
      const addressbookHomeSet = (this.sourceClient.account as any)?.addressbookHomeSet;

      if (!addressbookHomeSet) {
        // Need to construct the addressbook home URL
        const serverUrl = this.sourceClient.account?.serverUrl?.replace(/\/+$/, '');
        const username = this.sourceClient.account?.credentials?.username;

        if (serverUrl && username) {
          let addressbookHomeUrl: string;

          if (this.config.source.provider === 'nextcloud') {
            addressbookHomeUrl = `${serverUrl}/remote.php/dav/addressbooks/users/${username}/`;
          } else if (this.config.source.provider === 'generic') {
            const principalUrl = this.sourceClient.account?.principalUrl;
            if (principalUrl) {
              addressbookHomeUrl = principalUrl.replace(/principals\/[^/]+\//, 'addressbooks/');
              if (!addressbookHomeUrl.endsWith('/')) addressbookHomeUrl += '/';
            } else {
              addressbookHomeUrl = originalHomeUrl || '';
            }
          } else {
            addressbookHomeUrl = originalHomeUrl || '';
          }

          // Temporarily override homeUrl
          if (this.sourceClient.account) {
            (this.sourceClient.account as any).homeUrl = addressbookHomeUrl;
          }
        }
      }

      const addressBooks = await this.sourceClient.fetchAddressBooks();
      return addressBooks as DAVCollection[];
    } finally {
      // Restore original homeUrl
      if (this.sourceClient.account && originalHomeUrl) {
        (this.sourceClient.account as any).homeUrl = originalHomeUrl;
      }
    }
  }

  /**
   * Fetch all addressbooks from target
   */
  async fetchTargetCollections(): Promise<DAVCollection[]> {
    // Temporarily override homeUrl to point to addressbook home for fetching
    const originalHomeUrl = this.targetClient.account?.homeUrl;

    try {
      // Determine the addressbook home URL (same logic as in createCollection)
      const addressbookHomeSet = (this.targetClient.account as any)?.addressbookHomeSet;

      if (!addressbookHomeSet) {
        // Need to construct the addressbook home URL
        const serverUrl = this.targetClient.account?.serverUrl?.replace(/\/+$/, '');
        const username = this.targetClient.account?.credentials?.username;

        if (serverUrl && username) {
          let addressbookHomeUrl: string;

          if (this.config.target.provider === 'nextcloud') {
            addressbookHomeUrl = `${serverUrl}/remote.php/dav/addressbooks/users/${username}/`;
          } else if (this.config.target.provider === 'generic') {
            const principalUrl = this.targetClient.account?.principalUrl;
            if (principalUrl) {
              addressbookHomeUrl = principalUrl.replace(/principals\/[^/]+\//, 'addressbooks/');
              if (!addressbookHomeUrl.endsWith('/')) addressbookHomeUrl += '/';
            } else {
              addressbookHomeUrl = originalHomeUrl || '';
            }
          } else {
            addressbookHomeUrl = originalHomeUrl || '';
          }

          // Temporarily override homeUrl
          if (this.targetClient.account) {
            (this.targetClient.account as any).homeUrl = addressbookHomeUrl;
          }
        }
      }

      const addressBooks = await this.targetClient.fetchAddressBooks();
      return addressBooks as DAVCollection[];
    } finally {
      // Restore original homeUrl
      if (this.targetClient.account && originalHomeUrl) {
        (this.targetClient.account as any).homeUrl = originalHomeUrl;
      }
    }
  }

  /**
   * Fetch all vCards from an addressbook
   * @param collection - AddressBook to fetch from
   * @param options - Additional options (not used for CardDAV currently)
   */
  async fetchObjectsFromCollection(
    collection: DAVCollection,
    options?: any
  ): Promise<DAVObject[]> {
    const addressBook = collection as DAVAddressBook;

    const vcards = await this.sourceClient.fetchVCards({
      addressBook,
    });

    return vcards.map(vcard => ({
      url: vcard.url,
      data: vcard.data,
      etag: vcard.etag,
    })) as DAVObject[];
  }

  /**
   * Create vCard on target
   */
  async createObjectOnTarget(
    collection: DAVCollection,
    object: DAVObject,
    uid: string
  ): Promise<Response> {
    const addressBook = collection as DAVAddressBook;

    // Generate safe filename from UID
    const filename = `${UIDExtractor.generateFilename(uid)}.vcf`;

    return await this.targetClient.createVCard({
      addressBook,
      filename,
      vCardString: object.data,
    });
  }

  /**
   * Create a new addressbook on target
   */
  async createCollection(displayName: string): Promise<DAVCollection> {
    const addressBookName = displayName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() ||
      `addressbook-${Date.now()}`;

    // Determine the addressbook home URL
    let addressbookHomeUrl: string;

    // Try to get addressbookHomeSet first
    const addressbookHomeSet = (this.targetClient.account as any)?.addressbookHomeSet;

    if (addressbookHomeSet) {
      // If addressbookHomeSet exists, use it
      addressbookHomeUrl = (typeof addressbookHomeSet === 'string' ? addressbookHomeSet : addressbookHomeSet.href)
        .replace(/\/+$/, '');
    } else {
      // Fallback: construct the URL based on provider and server URL
      const serverUrl = this.targetClient.account?.serverUrl?.replace(/\/+$/, '');
      const username = this.targetClient.account?.credentials?.username;

      if (!serverUrl || !username) {
        throw new Error('Could not determine server URL or username from account');
      }

      // Provider-specific URL construction
      if (this.config.target.provider === 'nextcloud') {
        // Nextcloud uses: /remote.php/dav/addressbooks/users/{username}/
        addressbookHomeUrl = `${serverUrl}/remote.php/dav/addressbooks/users/${username}`;
      } else if (this.config.target.provider === 'generic') {
        // For generic CardDAV servers, try to construct from principalUrl
        const principalUrl = this.targetClient.account?.principalUrl;
        if (principalUrl) {
          // Replace 'principals' with 'addressbooks' in the path
          addressbookHomeUrl = principalUrl.replace(/principals\/[^/]+\//, 'addressbooks/').replace(/\/+$/, '');
        } else {
          // Last resort: use homeUrl but warn user
          addressbookHomeUrl = this.targetClient.account?.homeUrl?.replace(/\/+$/, '') || '';
          console.warn(`  Warning: Using homeUrl for addressbooks (may not work): ${addressbookHomeUrl}`);
        }
      } else {
        // Default: try homeUrl
        addressbookHomeUrl = this.targetClient.account?.homeUrl?.replace(/\/+$/, '') || '';
        console.warn(`  Warning: Unknown provider '${this.config.target.provider}', using homeUrl: ${addressbookHomeUrl}`);
      }
    }

    if (!addressbookHomeUrl) {
      throw new Error('Could not determine addressbook home URL from account');
    }

    const newAddressBookUrl = `${addressbookHomeUrl}/${addressBookName}/`;

    // Use makeAddressBook if available (tsdav v2.1.6+), otherwise fallback to makeCollection
    try {
      if (typeof (this.targetClient as any).makeAddressBook === 'function') {
        await (this.targetClient as any).makeAddressBook({
          url: newAddressBookUrl,
          props: {
            [`${DAVNamespaceShort.DAV}:displayname`]: displayName,
            [`${DAVNamespaceShort.CARDDAV}:addressbook-description`]: `Migrated from ${this.config.source.provider}`,
            [`${DAVNamespaceShort.DAV}:resourcetype`]: {
              [`${DAVNamespaceShort.DAV}:collection`]: {},
              [`${DAVNamespaceShort.CARDDAV}:addressbook`]: {},
            },
          },
        });
      } else {
        // Fallback for older tsdav versions or providers that don't support RFC 5689
        await this.targetClient.makeCollection({
          url: newAddressBookUrl,
          props: {
            displayname: displayName,
            [`${DAVNamespaceShort.CARDDAV}:addressbook-description`]: `Migrated from ${this.config.source.provider}`,
          },
        });
      }
    } catch (error) {
      throw new Error(`Failed to create addressbook at ${newAddressBookUrl}: ${(error as Error).message}`);
    }

    // Fetch addressbooks again to get the newly created one
    await this.targetRateLimiter.throttle();
    const updatedAddressBooks = await this.fetchTargetCollections();

    const newAddressBook = updatedAddressBooks.find((ab) => ab.url === newAddressBookUrl);

    if (!newAddressBook) {
      throw new Error(`Failed to create addressbook: ${displayName} at ${newAddressBookUrl}`);
    }

    return newAddressBook as DAVCollection;
  }

  /**
   * Extract UID from vCard data
   */
  extractUID(objectData: string): string | null {
    return UIDExtractor.extractVCardUID(objectData);
  }

  /**
   * Extract UID from vCard data (throws if not found)
   */
  extractUIDOrThrow(objectData: string): string {
    const uid = this.extractUID(objectData);
    if (!uid) {
      throw new Error('Failed to extract UID from vCard data');
    }
    return uid;
  }

  /**
   * Get collection type name for logging
   */
  getCollectionTypeName(): string {
    return 'addressbook';
  }

  /**
   * Get object type name for logging
   */
  getObjectTypeName(): string {
    return 'contact';
  }

  /**
   * Migrate a single addressbook
   * Override base method to track vCard object types
   */
  async migrateCollection(sourceCollection: DAVCollection): Promise<void> {
    const collectionName = this.getDisplayName(sourceCollection);

    // Fetch all vCards from source
    console.log(`  Fetching contacts from source addressbook...`);
    await this.sourceRateLimiter.throttle();

    let allObjects = await this.fetchObjectsFromCollection(sourceCollection);
    console.log(chalk.green(`  ✓ Found ${allObjects.length} contact(s)`));

    if (allObjects.length === 0) {
      console.log(chalk.yellow(`  No contacts to migrate`));
      return;
    }

    // Get or create target addressbook
    const targetCollection = await this.getOrCreateTargetCollection(sourceCollection);
    console.log(chalk.green(`  ✓ Target addressbook: ${this.getDisplayName(targetCollection)}`));

    // Fetch existing vCards from target (for duplicate detection)
    console.log(`  Fetching existing contacts from target addressbook...`);
    await this.targetRateLimiter.throttle();
    const targetObjects = await this.fetchObjectsFromCollection(targetCollection);

    // Build set of existing UIDs on target
    const existingUIDs = new Set<string>();
    for (const obj of targetObjects) {
      try {
        const uid = this.extractUID(obj.data);
        if (uid) existingUIDs.add(uid);
      } catch (error) {
        console.warn(`  Warning: Failed to extract UID from target contact: ${error}`);
      }
    }
    console.log(chalk.green(`  ✓ Found ${existingUIDs.size} existing contact(s) on target`));

    // Add collection to state
    const sourceDisplayName = this.getDisplayName(sourceCollection);
    const targetDisplayName = this.getDisplayName(targetCollection);

    const collectionId = this.stateManager.addCalendar(
      sourceCollection.url,
      sourceDisplayName,
      targetCollection.url,
      targetDisplayName,
      allObjects.length
    );

    // Initialize object counts
    this.stateManager.initializeObjectCounts(collectionId);

    this.stateManager.startCalendar(collectionId);

    // Dry-run mode: just show what would be migrated
    if (this.config.options?.dryRun) {
      this.previewMigration(allObjects, existingUIDs, collectionId);
      return;
    }

    // Migrate contacts with progress bar
    await this.migrateObjects(allObjects, targetCollection, existingUIDs, collectionId);

    // Track object type counts in state (all vCards)
    for (const obj of allObjects) {
      this.stateManager.incrementObjectCount(collectionId, 'VCARD');
    }

    this.stateManager.completeCalendar(collectionId);
  }
}
