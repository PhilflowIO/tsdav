---
sidebar_position: 4
---

## `makeAddressBook`

create a new addressbook on target server using RFC 5689 Extended MKCOL

```ts
import { makeAddressBook, DAVNamespaceShort } from 'tsdav';

const result = await makeAddressBook({
  url: 'https://dav.example.com/addressbooks/user/my-contacts/',
  props: {
    [`${DAVNamespaceShort.DAV}:resourcetype`]: {
      [`${DAVNamespaceShort.DAV}:collection`]: {},
      [`${DAVNamespaceShort.CARDDAV}:addressbook`]: {},
    },
    [`${DAVNamespaceShort.DAV}:displayname`]: 'My Contacts',
    [`${DAVNamespaceShort.CARDDAV}:addressbook-description`]: 'Personal contact list',
  },
  headers: {
    authorization: 'Basic x0C9ueWd9Vz8OwS0DEAtkAlj',
  },
});
```

### Arguments

- `url` **required**, the target url for the new addressbook
- `props` **required**, [CARDDAV prop element](https://datatracker.ietf.org/doc/html/rfc6352#section-10.4) in [ElementCompact](../types/ElementCompact.md) form. Must include `resourcetype` with both `collection` and `addressbook` types.
- `depth` [DAVDepth](../types/DAVDepth.md)
- `headers` request headers
- `headersToExclude` array of keys of the headers you want to exclude
- `fetchOptions` options to pass to underlying fetch function

:::caution
The `resourcetype` property must include both `d:collection` and `card:addressbook` for the addressbook to be recognized correctly by CardDAV servers.
:::

### Return Value

array of [DAVResponse](../types/DAVResponse.md)

### Behavior

send an [Extended MKCOL request (RFC 5689)](https://datatracker.ietf.org/doc/html/rfc5689) with [CardDAV properties (RFC 6352)](https://datatracker.ietf.org/doc/html/rfc6352) to create a new addressbook collection

### Tested Servers

- ✅ Nextcloud
- ✅ Radicale
- Expected to work: Baïkal, SOGo, and other RFC-compliant CardDAV servers
