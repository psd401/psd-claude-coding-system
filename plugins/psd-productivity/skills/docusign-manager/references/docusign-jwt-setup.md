# DocuSign JWT Authentication Setup

## Overview

DocuSign uses JWT (JSON Web Token) Grant authentication for server-to-server API access without user interaction. This requires a one-time setup in the DocuSign admin console and a one-time browser consent.

## Prerequisites

- DocuSign enterprise admin access
- Access to the DocuSign Admin Console (admin.docusign.com)

## Step 1: Create an Integration (App)

1. Go to **Settings → Apps and Keys** in DocuSign admin
2. Click **Add App and Integration Key**
3. Name it: `PSD Migration Export`
4. Copy the **Integration Key** (this is your `DOCUSIGN_INTEGRATION_KEY`)
5. Under **Authentication**, select **Authorization Code Grant** (needed for initial consent)
6. Add a redirect URI: `https://httpbin.org/get` (temporary, for consent only)

## Step 2: Generate RSA Keypair

1. In the app settings, click **Generate RSA**
2. DocuSign will show you a private key and public key
3. **CRITICAL**: Copy the private key immediately — it is only shown once
4. Save the private key to a PEM file in the Geoffrey secrets directory:
   ```bash
   mkdir -p ~/Library/Mobile\ Documents/com~apple~CloudDocs/Geoffrey/secrets/
   nano ~/Library/Mobile\ Documents/com~apple~CloudDocs/Geoffrey/secrets/docusign-private-key.pem
   # Paste the private key content, save
   ```
5. The file should contain the full RSA private key block (header, base64 content, footer)

## Step 3: Get Your User ID and Account ID

1. In DocuSign admin, go to **Settings → Apps and Keys**
2. Your **User ID** (GUID) is shown at the top → `DOCUSIGN_USER_ID`
3. Your **Account ID** (GUID) is shown under "API Account ID" → `DOCUSIGN_ACCOUNT_ID`

## Step 4: Grant JWT Consent (One-Time)

This step requires a browser. Open this URL (replace YOUR_INTEGRATION_KEY):

**Production:**
```
https://account.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=https://httpbin.org/get
```

1. Log in with the DocuSign admin account
2. Click **Allow** to grant consent
3. You will be redirected to httpbin.org — this is expected. The consent is now stored.
4. You only need to do this **once** per integration key.

## Step 5: Configure Environment Variables

Add to your `.env` file:

```
DOCUSIGN_INTEGRATION_KEY=your-integration-key-guid
DOCUSIGN_USER_ID=your-user-id-guid
DOCUSIGN_ACCOUNT_ID=your-api-account-id-guid
DOCUSIGN_RSA_KEY_PATH=/path/to/docusign-private-key.pem
DOCUSIGN_ENVIRONMENT=production
```

## Step 6: Test

```bash
cd plugins/psd-productivity/skills/docusign-manager/scripts
bun health_check.js
```

Expected output:
```json
{
  "status": "healthy",
  "accountId": "your-account-id",
  "accountName": "Peninsula School District",
  "environment": "production",
  "baseUri": "https://na2.docusign.net/restapi/v2.1"
}
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `consent_required` | JWT consent not granted | Open the consent URL (Step 4) in a browser |
| `invalid_grant` | RSA key mismatch | Regenerate keypair in DocuSign admin, update PEM file |
| `account not found` | Wrong Account ID | Check Settings → Apps and Keys for correct API Account ID |
| Token expires | Normal — 1 hour lifetime | Client auto-refreshes. No action needed. |

## Security Notes

- The RSA private key is stored in the Geoffrey iCloud secrets directory (encrypted at rest)
- Never commit the private key to git
- The Integration Key and User ID are GUIDs, not secrets
- JWT tokens are short-lived (1 hour) and not stored on disk
