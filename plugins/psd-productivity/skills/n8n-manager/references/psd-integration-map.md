# PSD Systems → n8n Integration Map

## System Credentials

| System | n8n Node/Method | Credential Type | Auth Method | Base URL |
|--------|----------------|-----------------|-------------|----------|
| Freshservice | HTTP Request | httpHeaderAuth | API Key in Authorization header | `https://psd401.freshservice.com/api/v2` |
| PowerSchool | HTTP Request | httpHeaderAuth | Plugin OAuth → Bearer token | `https://<ps-host>/ws/v1` |
| Google Sheets | Google Sheets node | googleSheetsOAuth2Api | OAuth2 | Built-in |
| Gmail | Gmail node | gmailOAuth2 | OAuth2 | Built-in |
| Google Calendar | Google Calendar node | googleCalendarOAuth2Api | OAuth2 | Built-in |
| Google Drive | Google Drive node | googleDriveOAuth2Api | OAuth2 | Built-in |
| Red Rover | HTTP Request | httpBasicAuth | Basic Auth (username:password) | `https://connect.redroverk12.com/api/v1` |
| Slack | Slack node | slackOAuth2Api | OAuth2 Bot Token | Built-in |
| Email (SMTP) | Send Email node | smtp | SMTP credentials | PSD SMTP server |
| n8n Forms | Form Trigger | (none) | Built-in, no auth needed | Self-hosted form pages |

## Freshservice Integration

### Authentication
```
Header: Authorization: Basic <base64(apiKey:X)>
```
Note the `:X` suffix — Freshservice uses the API key as username with `X` as password in Basic auth.

### Common Endpoints
| Operation | Method | Path |
|-----------|--------|------|
| List tickets | GET | `/tickets?workspace_id=2` |
| Get ticket | GET | `/tickets/{id}` |
| Create ticket | POST | `/tickets` |
| Update ticket | PUT | `/tickets/{id}` |
| Add note | POST | `/tickets/{id}/notes` |
| List agents | GET | `/agents` |

### Workspace IDs
| ID | Name |
|----|------|
| 2 | Technology (primary) |
| 3 | Employee Support Services |
| 4 | Business Services |
| 5 | Teaching & Learning |
| 6 | Maintenance |
| 8 | Investigations |
| 9 | Transportation |
| 10 | Safety & Security |
| 11 | Communications |
| 13 | Software Development |

## Red Rover Integration

### Authentication
```
Header: Authorization: Basic <base64(username:password)>
```

### Common Endpoints
| Operation | Method | Path |
|-----------|--------|------|
| Get organization | GET | `/organization` |
| Get absences | GET | `/absences?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` |

## Google Workspace

All Google integrations use OAuth2 credentials configured in the n8n UI. The credential setup requires:
1. Google Cloud Console project with APIs enabled
2. OAuth2 consent screen configured
3. Client ID and Client Secret

## n8n Forms (No External System)

Forms are self-hosted by n8n. Use the Form Trigger node to create forms and the Form node for multi-page forms.

- **Test URL**: Available during development (visible in node settings)
- **Production URL**: Active when workflow is published
- **Hidden fields**: Pre-populate via URL query parameters
- **File uploads**: Supported via the File field type

## Credential Setup Checklist

When connecting a new system:

1. Identify the auth method from the table above
2. Get the credential schema: `bun get_credential_schema.js <credType>`
3. Create the credential: `bun create_credential.js '<json>'`
4. Test with a simple read operation before building full workflows
5. Name credentials with environment prefix: `prod-freshservice-api`, `staging-google-sheets`
