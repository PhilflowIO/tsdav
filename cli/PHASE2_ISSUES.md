# Phase 2+ GitHub Issues

This document outlines GitHub issues to be created for future enhancements to the DAV Migration CLI tool.

## Issue Template

When creating these issues on GitHub, use the following template:

```markdown
**Labels**: `enhancement`, `phase-2`
**Milestone**: Phase 2
```

---

## Issue 1: CardDAV Contacts Migration Support

**Title**: Add CardDAV contacts migration support

**Description**:

Extend the migration tool to support contacts (CardDAV) in addition to calendars (CalDAV).

**Requirements**:
- Support fetching contacts from source (Google Contacts, Nextcloud Contacts)
- Create contacts on target (Baïkal CardDAV)
- UID-based duplicate detection (same as calendar events)
- DSGVO-compliant state tracking (contact UIDs only, no names/emails)
- Preserve vCard data format

**Technical Details**:
- Use `tsdav` CardDAV methods (`fetchAddressBooks`, `fetchVCards`, `createVCard`)
- Extend `MigrationEngine` with `migrateContacts()` method
- Add `--type` CLI flag: `calendar` (default), `contacts`, or `both`
- Example: `dav-migrate run --config my-config.json --type contacts`

**Dependencies**:
- tsdav already supports CardDAV (see `/docs/docs/webdav/addressBook`)

**Estimated Effort**: Medium (2-3 days)

---

## Issue 2: VTODO Tasks Migration Support

**Title**: Add VTODO (tasks/reminders) migration support

**Description**:

Support migrating tasks and reminders (VTODO component) in addition to calendar events.

**Requirements**:
- Fetch VTODO objects from source calendars
- Create VTODO objects on target
- Handle task-specific properties (DUE, STATUS, PERCENT-COMPLETE, etc.)
- DSGVO-compliant tracking

**Technical Details**:
- tsdav already has VTODO support (see recent commit: "Add VTODO support")
- Extend `UIDExtractor` to handle VTODO (already done)
- Filter for VTODO in `fetchCalendarObjects` or fetch separately
- Update docs to mention task migration capability

**Dependencies**:
- tsdav VTODO documentation (see `/docs/docs/vtodo.md`)

**Estimated Effort**: Small (1 day)

---

## Issue 3: Microsoft Outlook/Exchange Support

**Title**: Add Microsoft Outlook/Exchange CalDAV support

**Description**:

Enable migration from Microsoft Outlook and Exchange servers.

**Requirements**:
- OAuth2 support for Microsoft Graph API
- Handle Outlook-specific iCal properties
- Test with Office 365 and on-premise Exchange
- Document setup process (Azure AD app registration)

**Technical Details**:
- Microsoft uses OAuth2 (similar to Google)
- CalDAV endpoint: `https://outlook.office365.com/EWS/Exchange.asmx/`
- May need to handle Outlook-specific X-MS-* properties
- Rate limits: Microsoft Graph API quotas

**Research Needed**:
- Does tsdav support Microsoft's CalDAV implementation?
- Are there any known quirks or incompatibilities?

**Estimated Effort**: Large (5-7 days, including testing)

---

## Issue 4: Bi-Directional Calendar Sync

**Title**: Implement bi-directional sync between CalDAV providers

**Description**:

Enable two-way sync to keep calendars synchronized between source and target.

**Requirements**:
- Detect changes on both source and target since last sync
- Conflict resolution strategy (last-modified wins, or interactive)
- Incremental sync (only changed events)
- Use WebDAV sync tokens (RFC 6578)

**Technical Details**:
- Use tsdav's `smartCollectionSync` method
- Track sync tokens in state file
- Handle three-way merge conflicts:
  - Both sides changed → conflict resolution needed
  - One side changed → apply change to other side
  - Deleted on one side → delete on other side (or ask user)

**Dependencies**:
- tsdav `smartCollectionSync` (see `/docs/docs/smart calendar sync.md`)

**Estimated Effort**: Large (7-10 days)

---

## Issue 5: Incremental Sync (Delta Changes Only)

**Title**: Implement incremental sync for efficient updates

**Description**:

Instead of full migration, sync only changed events since last run.

**Requirements**:
- Use WebDAV sync tokens to detect changes
- Only fetch/update changed objects
- Much faster for large calendars with few changes
- Maintain sync tokens in state file

**Technical Details**:
- Use `syncToken` from calendar
- On subsequent runs: Use `syncToken` to fetch only changes
- tsdav's `smartCollectionSync` handles this internally

**Related**: Issue #4 (Bi-Directional Sync) - similar technology

**Estimated Effort**: Medium (3-4 days)

---

## Issue 6: Interactive Conflict Resolution

**Title**: Add interactive conflict resolution mode

**Description**:

When `--interactive` flag is used, ask user to resolve conflicts manually.

**Requirements**:
- Detect conflicts (UID exists on both source and target with different LAST-MODIFIED)
- Show diff view (source vs target)
- Prompt user: Keep source, keep target, skip, or merge
- Resume capability if user cancels mid-conflict

**Technical Details**:
- Use `inquirer` for prompts
- Use `diff` library to show changes
- Store user's choice in state file (don't ask again on resume)

**UI Example**:
```
Conflict detected: Meeting with John (UID: abc123)

Source (Google):        Target (Baïkal):
Date: 2024-01-15       Date: 2024-01-16
Time: 10:00-11:00      Time: 14:00-15:00
Modified: 2024-01-10   Modified: 2024-01-12

Which version to keep?
❯ Keep source (Google)
  Keep target (Baïkal)
  Skip this event
  Show full details
```

**Estimated Effort**: Medium (3-4 days)

---

## Issue 7: Attachment Handling

**Title**: Support calendar event attachments

**Description**:

Preserve event attachments during migration.

**Requirements**:
- Detect if source event has attachments
- Download attachments from source
- Upload attachments to target
- Handle attachment size limits per provider

**Research Needed**:
- Does tsdav support attachments?
- How are attachments stored in CalDAV (inline base64 or external URL)?
- Provider-specific limits (Google: 25MB, etc.)

**Estimated Effort**: Large (depends on tsdav support) - 5-7 days

---

## Issue 8: MCP Server Integration

**Title**: Create MCP server for Claude Chat integration

**Description**:

Build an MCP (Model Context Protocol) server to enable Claude Chat to trigger migrations via conversation.

**Requirements**:
- New tools: `migrate_calendar`, `migration_status`, `migration_preview`
- Integration with existing MigrationEngine
- Conversational config setup (instead of JSON files)
- Progress updates via MCP streaming

**Example Usage** (in Claude Chat):
```
User: Migrate my Google Calendar to Baïkal
Claude: I'll help you migrate your calendars. First, I need some information:
        1. Google account email?
        2. Baïkal server URL?
        ...

[Uses migrate_calendar tool to execute migration]
[Uses migration_status tool to show progress]
```

**Technical Details**:
- Implement as separate package: `dav-migrate-mcp`
- Use `@modelcontextprotocol/sdk`
- Reuse core logic from `dav-migrate`

**Estimated Effort**: Medium (4-5 days)

---

## Issue 9: N8N Node Development

**Title**: Create N8N workflow node for automated migrations

**Description**:

Build an N8N node to enable calendar migrations in automated workflows.

**Requirements**:
- Node accepts source/target configuration
- Triggers migration on schedule or webhook
- Returns migration summary
- Error handling and retries

**Use Cases**:
- Scheduled daily sync (incremental)
- Webhook-triggered migration (when new calendar created)
- Multi-tenant migrations (batch process multiple accounts)

**Technical Details**:
- Package as `n8n-nodes-dav-migrate`
- Reuse `MigrationEngine` from core
- Follow N8N node development guidelines

**Estimated Effort**: Medium (3-4 days)

---

## Issue 10: Web UI with Browser OAuth2 Flow

**Title**: Build web-based UI for calendar migration

**Description**:

Create a browser-based UI to make migrations more user-friendly.

**Requirements**:
- Visual config builder (no JSON editing)
- OAuth2 flow in browser (popup for Google auth)
- Real-time progress dashboard
- Migration history view
- Responsive design (mobile-friendly)

**Technical Details**:
- Frontend: React or Vue.js
- Backend: Express.js API server
- Uses tsdav in browser mode (already compatible)
- OAuth2: Redirect flow instead of refresh token
- State management: IndexedDB for client-side storage

**Estimated Effort**: X-Large (15-20 days)

---

## Issue 11: Baïkal → Baïkal Cross-Instance Migration

**Title**: Support Baïkal-to-Baïkal migrations

**Description**:

Enable migrating from one Baïkal instance to another (e.g., server migration).

**Requirements**:
- Same as generic CalDAV → CalDAV
- Test with Baïkal-specific features
- Document Baïkal-to-Baïkal setup

**Technical Details**:
- Should already work (Baïkal is standard-compliant)
- Test thoroughly with real Baïkal instances
- Add example config: `baikal-to-baikal.json`

**Estimated Effort**: Small (1 day - mostly testing)

---

## Issue 12: Enhanced Error Reporting

**Title**: Improve error messages and troubleshooting

**Description**:

Make error messages more helpful and actionable.

**Requirements**:
- Detailed error codes with links to documentation
- Suggest fixes for common errors
- Export detailed error log (JSON format)
- Integration with `--debug` flag

**Example**:
```
Error: Authentication failed (HTTP 401)
Possible causes:
  1. Invalid credentials
  2. OAuth token expired
  3. Insufficient permissions

Troubleshooting steps:
  - Verify credentials in .env file
  - Regenerate OAuth refresh token
  - Check API permissions in Google Cloud Console

For more help: https://docs.example.com/errors/AUTH_401
```

**Estimated Effort**: Small (2 days)

---

## Issue 13: Migration Templates/Presets

**Title**: Add migration templates for common scenarios

**Description**:

Provide pre-built templates for common migration patterns.

**Requirements**:
- Templates for: Google→Baïkal, Nextcloud→Baïkal, Office365→Baïkal
- `dav-migrate templates` command to list available templates
- `dav-migrate init --template google-to-baikal` to use template

**Estimated Effort**: Small (1 day)

---

## Issue 14: Performance Optimization for Large Calendars

**Title**: Optimize migration for calendars with 10,000+ events

**Description**:

Improve performance for very large calendars.

**Requirements**:
- Batch create operations (if tsdav supports)
- Parallel processing (migrate multiple calendars simultaneously)
- Memory-efficient streaming (don't load all events in memory)
- Progress checkpoints (save state every N events)

**Technical Details**:
- Investigate tsdav batch operations
- Use Node.js streams for large datasets
- Worker threads for parallel processing?

**Estimated Effort**: Medium (4-5 days)

---

## Priority Ranking

Based on user value and implementation complexity:

1. **High Priority**:
   - Issue #2: VTODO Tasks Support (quick win, tsdav already supports it)
   - Issue #11: Baïkal → Baïkal (quick win, testing only)
   - Issue #12: Enhanced Error Reporting (improves UX)

2. **Medium Priority**:
   - Issue #1: CardDAV Contacts
   - Issue #5: Incremental Sync
   - Issue #6: Interactive Conflict Resolution

3. **Low Priority** (requires more research/effort):
   - Issue #3: Microsoft Outlook
   - Issue #4: Bi-Directional Sync
   - Issue #7: Attachments
   - Issue #10: Web UI

4. **Integration Projects** (separate packages):
   - Issue #8: MCP Server
   - Issue #9: N8N Node

---

## GitHub Milestones

Create the following milestones:

1. **Phase 2.1 - Quick Wins** (Issues: #2, #11, #12, #13)
2. **Phase 2.2 - Core Features** (Issues: #1, #5, #6, #14)
3. **Phase 2.3 - Advanced Sync** (Issues: #3, #4, #7)
4. **Phase 3 - Integrations** (Issues: #8, #9, #10)

---

**Next Steps**:
1. Create these issues on the tsdav GitHub repository
2. Apply labels: `enhancement`, `phase-2`, `help-wanted` (for community)
3. Link related issues (e.g., #4 ↔ #5)
4. Create a GitHub Discussion for conflict resolution strategies (as mentioned in CLAUDE.md)
