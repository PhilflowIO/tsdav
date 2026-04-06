import fsp from 'fs/promises';

import { createAccount } from '../../../account';
import { createVCard, fetchAddressBooks, fetchVCards, makeAddressBook } from '../../../addressBook';
import { DAVNamespaceShort } from '../../../consts';
import { deleteObject } from '../../../request';
import { DAVAccount } from '../../../types/models';
import { getBasicAuthHeaders } from '../../../util/authHelpers';

let authHeaders: {
  authorization?: string;
};

let account: DAVAccount;

beforeAll(async () => {
  authHeaders = getBasicAuthHeaders({
    username: process.env.CREDENTIAL_NEXTCLOUD_USERNAME,
    password: process.env.CREDENTIAL_NEXTCLOUD_PASSWORD,
  });
  account = await createAccount({
    account: {
      serverUrl: `${process.env.CREDENTIAL_NEXTCLOUD_SERVER_URL}/remote.php/dav`,
      accountType: 'carddav',
    },
    headers: authHeaders,
  });
});

test('fetchAddressBooks should be able to fetch addressBooks', async () => {
  const addressBooks = await fetchAddressBooks({
    account,
    headers: authHeaders,
  });
  expect(addressBooks.length > 0).toBe(true);
  expect(addressBooks.every((a) => a.url.length > 0)).toBe(true);
});

test('createVCard should be able to create vcard', async () => {
  const addressBooks = await fetchAddressBooks({
    account,
    headers: authHeaders,
  });
  const vcard1 = await fsp.readFile(`${__dirname}/../data/vcard/1.vcf`, 'utf8');
  const createResult = await createVCard({
    addressBook: addressBooks[0],
    vCardString: vcard1,
    filename: '1.vcf',
    headers: authHeaders,
  });

  expect(createResult.ok).toBe(true);

  const deleteResult = await deleteObject({
    url: new URL('1.vcf', addressBooks[0].url).href,
    headers: authHeaders,
  });

  expect(deleteResult.ok).toBe(true);
});

test('fetchVCards should be able to fetch vcards', async () => {
  const addressBooks = await fetchAddressBooks({
    account,
    headers: authHeaders,
  });

  const vcard2 = await fsp.readFile(`${__dirname}/../data/vcard/2.vcf`, 'utf8');
  const createResult = await createVCard({
    addressBook: addressBooks[0],
    vCardString: vcard2,
    filename: '2.vcf',
    headers: authHeaders,
  });

  expect(createResult.ok).toBe(true);

  const vcards = await fetchVCards({
    addressBook: addressBooks[0],
    headers: authHeaders,
  });

  expect(vcards.length > 0).toBe(true);
  expect(
    vcards.every((o) => o.data.length > 0 && (o.etag?.length ?? 0) > 0 && o.url.length > 0),
  ).toBe(true);

  const deleteResult = await deleteObject({
    url: new URL('2.vcf', addressBooks[0].url).href,
    headers: authHeaders,
  });

  expect(deleteResult.ok).toBe(true);
});

test('makeAddressBook should be able to create addressbook', async () => {
  const testAddressBookUrl = `${process.env.CREDENTIAL_NEXTCLOUD_SERVER_URL}/remote.php/dav/addressbooks/users/${process.env.CREDENTIAL_NEXTCLOUD_USERNAME}/test-addressbook-${Date.now()}/`;

  const createResult = await makeAddressBook({
    url: testAddressBookUrl,
    props: {
      [`${DAVNamespaceShort.DAV}:resourcetype`]: {
        [`${DAVNamespaceShort.DAV}:collection`]: {},
        [`${DAVNamespaceShort.CARDDAV}:addressbook`]: {},
      },
      [`${DAVNamespaceShort.DAV}:displayname`]: 'Test Address Book',
      [`${DAVNamespaceShort.CARDDAV}:addressbook-description`]: 'Test addressbook created by integration test',
    },
    headers: authHeaders,
  });

  expect(createResult.length > 0).toBe(true);
  expect(createResult[0].ok).toBe(true);

  // Verify the addressbook was created by fetching it
  const addressBooks = await fetchAddressBooks({
    account,
    headers: authHeaders,
  });

  const createdAddressBook = addressBooks.find((ab) => ab.url === testAddressBookUrl);
  expect(createdAddressBook).toBeDefined();

  // Cleanup: delete the test addressbook
  const deleteResult = await deleteObject({
    url: testAddressBookUrl,
    headers: authHeaders,
  });

  expect(deleteResult.ok).toBe(true);
});
