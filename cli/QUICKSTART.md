# Quick Start Guide - DAV Migration CLI

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Access to source calendar (Google Calendar, Nextcloud, etc.)
- Access to target calendar (Baïkal or any CalDAV server)

## Step 1: Installation

```bash
# Navigate to the cli directory
cd cli

# Install dependencies
npm install

# Build the project
npm run build

# (Optional) Link globally for easier access
npm link
```

## Step 2: Set Up Credentials

### Google Calendar (OAuth2)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth2 credentials (Desktop app)
3. Enable Google Calendar API
4. Get refresh token via [OAuth2 Playground](https://developers.google.com/oauthplayground/)

### Nextcloud (Basic Auth)

1. Go to Nextcloud Settings → Security
2. Create app-specific password

### Create .env file

```bash
cp .env.example .env
nano .env
```

Add your credentials:
```bash
# Google
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Baïkal
BAIKAL_USERNAME=your-username
BAIKAL_PASSWORD=your-password
```

## Step 3: Create Configuration

### Option A: Interactive Setup (Recommended)

```bash
dav-migrate init
```

Follow the prompts to create your configuration.

### Option B: Use Example Config

```bash
# Copy example
cp examples/google-to-baikal.json my-migration.json

# Edit with your details
nano my-migration.json
```

## Step 4: Validate Configuration

Test your credentials:

```bash
dav-migrate validate --config my-migration.json
```

You should see:
```
✓ Config schema is valid
✓ Source provider config is valid
✓ Target provider config is valid
✓ Successfully authenticated with google (found X calendars)
✓ Successfully authenticated with baikal (found Y calendars)
```

## Step 5: Preview Migration (Dry-Run)

See what would be migrated without making changes:

```bash
dav-migrate preview --config my-migration.json
```

Output shows:
- How many calendars will be migrated
- How many events per calendar
- How many would be skipped (already exist)

## Step 6: Execute Migration

Run the actual migration:

```bash
dav-migrate run --config my-migration.json
```

Watch the progress bars as events are migrated.

## Step 7: View Summary

After completion, you'll see:
```
=== Migration Summary ===
Status: completed
Duration: 45.23s

Calendars: 3
Total Events: 2,453
  ✓ Migrated: 2,450
  ⊘ Skipped: 0
  ✗ Failed: 3

State file: .migration-state.json
```

## Troubleshooting

### Authentication Failed

**Google:**
```bash
# Verify credentials
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Regenerate refresh token if expired
```

**Baïkal:**
```bash
# Test basic auth
curl -u $BAIKAL_USERNAME:$BAIKAL_PASSWORD https://your-baikal-server.com
```

### Migration Interrupted

If migration stops (network failure, CTRL+C), resume:

```bash
dav-migrate resume --state .migration-state.json --config my-migration.json
```

### Rate Limiting

If you hit rate limits, slow down:

```json
{
  "options": {
    "rateLimit": {
      "source": 1,
      "target": 5
    }
  }
}
```

## Common Use Cases

### Migrate Specific Calendars Only

Use regex filter in config:

```json
{
  "options": {
    "calendarFilter": "^(Personal|Work)$"
  }
}
```

### Migrate Events Within Date Range

```json
{
  "options": {
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    }
  }
}
```

### Overwrite Existing Events

```bash
dav-migrate run --config my-migration.json --overwrite
```

## Next Steps

- Read full [README.md](README.md) for detailed documentation
- Check [PHASE2_ISSUES.md](PHASE2_ISSUES.md) for upcoming features
- Join [GitHub Discussions](https://github.com/natelindev/tsdav/discussions) for support

## DSGVO Notice

This tool is DSGVO-compliant:
- ✅ Only stores event UIDs (identifiers)
- ❌ Does NOT store event content (titles, descriptions, attendees)
- ✅ All processing happens locally on your machine
- ✅ No third-party services involved

The state file (`.migration-state.json`) contains only metadata for resume capability.

## Support

- **Issues**: [GitHub Issues](https://github.com/natelindev/tsdav/issues)
- **Discussions**: [GitHub Discussions](https://github.com/natelindev/tsdav/discussions)
- **Docs**: [README.md](README.md)

---

Happy migrating! 🚀
