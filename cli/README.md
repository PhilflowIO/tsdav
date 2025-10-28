# DAV Migration CLI

DSGVO-compliant command-line tool for migrating calendars between CalDAV providers (Google Calendar, Nextcloud, Baïkal).

## Features

- **One-time migration** from Google Calendar and Nextcloud to Baïkal (or any CalDAV provider)
- **DSGVO-compliant**: Zero logging of calendar content (only UIDs and status codes)
- **Resume capability**: Can resume after network failures or interruptions
- **Idempotent**: Safe to re-run without creating duplicates
- **Progress tracking**: Real-time progress bars and detailed summary reports
- **Provider-specific optimizations**: Handles quirks of Google, Nextcloud, and Baïkal
- **Rate limiting**: Respects provider API limits with automatic retry on 429 errors
- **Dry-run mode**: Preview what would be migrated before executing

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication Setup](#authentication-setup)
  - [Google Calendar (OAuth2)](#google-calendar-oauth2)
  - [Nextcloud (Basic Auth)](#nextcloud-basic-auth)
  - [Baïkal (Basic Auth)](#baikal-basic-auth)
- [Usage](#usage)
  - [Commands](#commands)
  - [Examples](#examples)
- [Configuration](#configuration)
- [DSGVO Compliance](#dsgvo-compliance)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Future Enhancements](#future-enhancements)

## Installation

```bash
# Clone the repository
cd cli

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## Quick Start

```bash
# 1. Create a configuration file interactively
dav-migrate init --output my-migration.json

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Validate configuration
dav-migrate validate --config my-migration.json

# 4. Preview what would be migrated (dry-run)
dav-migrate preview --config my-migration.json

# 5. Execute migration
dav-migrate run --config my-migration.json

# 6. If interrupted, resume from where it left off
dav-migrate resume --state .migration-state.json --config my-migration.json
```

## Authentication Setup

### Google Calendar (OAuth2)

Google Calendar requires OAuth2 authentication. Follow these steps:

#### 1. Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Enable the **Google Calendar API**
4. Create OAuth2 credentials:
   - Application type: **Desktop app**
   - Download the credentials JSON

#### 2. Get Refresh Token

Use one of these methods:

**Method A: OAuth2 Playground**
1. Go to [OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Click settings (⚙️) → Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, select "Calendar API v3" → `https://www.googleapis.com/auth/calendar`
5. Click "Authorize APIs" and allow access
6. In Step 2, click "Exchange authorization code for tokens"
7. Copy the **refresh_token**

**Method B: Manual Flow**
```bash
# Use a helper script (not included, see Google OAuth2 docs)
# https://developers.google.com/identity/protocols/oauth2/native-app
```

#### 3. Set Environment Variables

```bash
# .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

#### 4. Configuration Example

See `examples/google-to-baikal.json`

### Nextcloud (Basic Auth)

Nextcloud uses Basic Authentication with app-specific passwords.

#### 1. Generate App-Specific Password

1. Log in to your Nextcloud instance
2. Go to **Settings** → **Security**
3. Under "Devices & sessions", create a new app password
4. Name it "DAV Migration" and copy the generated password

#### 2. Set Environment Variables

```bash
# .env
NEXTCLOUD_USERNAME=your-username
NEXTCLOUD_APP_PASSWORD=generated-app-password
```

#### 3. Configuration Example

```json
{
  "source": {
    "provider": "nextcloud",
    "serverUrl": "https://your-nextcloud-instance.com",
    "authMethod": "Basic",
    "credentials": {
      "username": "env:NEXTCLOUD_USERNAME",
      "password": "env:NEXTCLOUD_APP_PASSWORD"
    }
  }
}
```

See `examples/nextcloud-to-baikal.json`

### Baïkal (Basic Auth)

Baïkal uses standard Basic Authentication.

#### 1. Set Environment Variables

```bash
# .env
BAIKAL_USERNAME=your-username
BAIKAL_PASSWORD=your-password
```

#### 2. Configuration Example

```json
{
  "target": {
    "provider": "baikal",
    "serverUrl": "https://dav.yourdomain.com",
    "authMethod": "Basic",
    "credentials": {
      "username": "env:BAIKAL_USERNAME",
      "password": "env:BAIKAL_PASSWORD"
    }
  }
}
```

## Usage

### Commands

#### `init` - Create Configuration

Create a new migration configuration file interactively.

```bash
dav-migrate init [options]

Options:
  -o, --output <path>  Output config file path (default: "migration-config.json")
```

#### `validate` - Validate Configuration

Validate configuration file and test authentication.

```bash
dav-migrate validate --config <path>

Options:
  -c, --config <path>  Path to migration config file (required)
```

#### `preview` - Dry-Run Preview

Preview what would be migrated without making changes.

```bash
dav-migrate preview --config <path> [options]

Options:
  -c, --config <path>  Path to migration config file (required)
  -s, --state <path>   Load existing state file (optional)
```

#### `run` - Execute Migration

Execute the calendar migration.

```bash
dav-migrate run --config <path> [options]

Options:
  -c, --config <path>  Path to migration config file (required)
  -s, --state <path>   State file path (default: ".migration-state.json")
  --overwrite          Overwrite existing events on target (default: false)
  --interactive        Interactive conflict resolution (default: false)
```

#### `resume` - Resume Migration

Resume migration from an existing state file.

```bash
dav-migrate resume --state <path> --config <path> [options]

Options:
  -s, --state <path>   Path to state file (required)
  -c, --config <path>  Path to migration config file (required)
  --overwrite          Overwrite existing events on target (default: false)
```

### Examples

#### Example 1: Google Calendar → Baïkal

```bash
# Use the example config
cp examples/google-to-baikal.json my-config.json

# Edit .env with your credentials
nano .env

# Validate
dav-migrate validate --config my-config.json

# Preview
dav-migrate preview --config my-config.json

# Run
dav-migrate run --config my-config.json
```

#### Example 2: Nextcloud → Baïkal (Specific Calendars)

```json
{
  "source": { /* nextcloud config */ },
  "target": { /* baikal config */ },
  "options": {
    "calendarFilter": "^(Personal|Work|Family)$"
  }
}
```

```bash
dav-migrate run --config my-config.json
```

#### Example 3: Resume After Interruption

```bash
# If migration was interrupted (CTRL+C, network failure, etc.)
dav-migrate resume --state .migration-state.json --config my-config.json
```

## Configuration

### Full Configuration Schema

```json
{
  "source": {
    "provider": "google" | "nextcloud" | "baikal" | "generic",
    "serverUrl": "https://...",
    "authMethod": "Oauth" | "Basic",
    "credentials": {
      // OAuth2 (for Google)
      "username": "email@example.com",
      "clientId": "env:VAR_NAME or literal value",
      "clientSecret": "env:VAR_NAME or literal value",
      "refreshToken": "env:VAR_NAME or literal value",
      "tokenUrl": "https://..." // optional

      // OR Basic Auth (for Nextcloud/Baïkal)
      "username": "env:VAR_NAME or literal value",
      "password": "env:VAR_NAME or literal value"
    }
  },
  "target": {
    // Same structure as source
  },
  "options": {
    "overwrite": false,          // Overwrite existing events
    "interactive": false,        // Interactive conflict resolution
    "dryRun": false,             // Preview mode
    "rateLimit": {
      "source": 2,               // Requests per second
      "target": 10
    },
    "calendarFilter": "regex",   // Filter calendars by name
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",  // ISO 8601
      "end": "2024-12-31T23:59:59Z"
    }
  }
}
```

### Environment Variable Expansion

Use `env:VAR_NAME` prefix to reference environment variables:

```json
{
  "credentials": {
    "username": "env:GOOGLE_USERNAME",
    "clientId": "env:GOOGLE_CLIENT_ID"
  }
}
```

The tool will automatically expand these at runtime.

### Provider-Specific Server URLs

- **Google Calendar**: `https://apidata.googleusercontent.com/caldav/v2/`
- **Nextcloud**: `https://your-nextcloud-instance.com` (varies by instance)
- **Baïkal**: `https://your-baikal-server.com` (varies by instance)

## DSGVO Compliance

This tool is designed to be fully DSGVO-compliant:

### What is Stored

The state file (`.migration-state.json`) contains **ONLY**:
- Event UIDs (unique identifiers)
- Migration status codes (`migrated`, `skipped`, `failed`)
- HTTP error codes
- Timestamps
- Calendar names and URLs

### What is NOT Stored

- ❌ Event titles
- ❌ Event descriptions
- ❌ Attendee information
- ❌ Locations
- ❌ Any calendar content

### Local Processing

- All operations run on your local machine
- No third-party services are contacted (except source and target servers)
- No analytics or telemetry

### Transparency

- State file is JSON (human-readable)
- You control where state files are saved
- You can inspect state files at any time

## Troubleshooting

### Authentication Errors

**Error: `Failed to authenticate with google`**

- Verify OAuth2 credentials (Client ID, Secret, Refresh Token)
- Check that Google Calendar API is enabled in your project
- Ensure refresh token hasn't expired (regenerate if needed)

**Error: `Failed to authenticate with nextcloud`**

- Verify app-specific password is correct
- Check server URL format (should not include `/remote.php/dav`)
- Ensure CalDAV is enabled on your Nextcloud instance

### Rate Limiting

**Error: `Rate limit exceeded`**

- The tool automatically retries with exponential backoff
- If persistent, reduce rate limit in config:
  ```json
  "options": {
    "rateLimit": {
      "source": 1,  // Slower
      "target": 5
    }
  }
  ```

### UID Extraction Errors

**Error: `Failed to extract UID from iCalendar data`**

- Event may have malformed iCal data
- Check state file for failed UID (will be logged)
- Manually inspect the event on source provider

### Network Interruptions

**Migration stopped mid-way**

- Use the `resume` command:
  ```bash
  dav-migrate resume --state .migration-state.json --config my-config.json
  ```

### Duplicate Events

**Events appearing twice on target**

- This shouldn't happen if using default settings
- Ensure `overwrite: false` in config
- Check state file for UIDs marked as `skipped`

## Architecture

### Components

1. **MigrationEngine**: Main orchestrator
2. **StateManager**: DSGVO-compliant progress tracking
3. **ProviderFactory**: Creates DAVClient instances
4. **RateLimiter**: Throttles requests, handles retries
5. **UIDExtractor**: Parses iCal data to extract UIDs

### Migration Flow

```
1. Load config → Validate schema
2. Create source & target clients → Authenticate
3. Fetch calendars from source
4. For each calendar:
   a. Create calendar on target (if not exists)
   b. Fetch all events from source
   c. Fetch existing events from target (build UID set)
   d. For each event:
      - Extract UID
      - Check if already migrated (state file)
      - Check if exists on target
      - Migrate if new
      - Log status (success/skipped/failed)
5. Generate summary report
```

### Conflict Resolution

**UID-Based Duplicate Detection:**
- Events are identified by their UID (iCalendar standard)
- If UID exists on target → skip (unless `--overwrite`)
- State file tracks migrated UIDs for resume capability

**Idempotent Design:**
- Safe to re-run without creating duplicates
- State file ensures events aren't migrated twice

## Future Enhancements

See [Phase 2+ Features](https://github.com/natelindev/tsdav/issues) for planned enhancements:

- [ ] Contacts migration (CardDAV)
- [ ] Tasks migration (VTODO)
- [ ] Microsoft Outlook/Exchange support
- [ ] Bi-directional sync
- [ ] Incremental sync (delta changes only)
- [ ] Interactive conflict resolution (show diffs)
- [ ] Attachment handling
- [ ] MCP server integration (Claude Chat)
- [ ] N8N node development
- [ ] Web UI with browser OAuth2 flow
- [ ] Baïkal → Baïkal (cross-instance)

## License

MIT

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Read the code comments (especially DSGVO-related)
2. Maintain zero content logging (state file must be metadata-only)
3. Add tests for new features
4. Update README with examples

## Support

- **Issues**: [GitHub Issues](https://github.com/natelindev/tsdav/issues)
- **Discussions**: [GitHub Discussions](https://github.com/natelindev/tsdav/discussions)
- **Documentation**: [tsdav Docs](https://tsdav.vercel.app/)

---

Built with [tsdav](https://github.com/natelindev/tsdav) - WebDAV, CalDAV, and CardDAV client for Node.js and the Browser.
