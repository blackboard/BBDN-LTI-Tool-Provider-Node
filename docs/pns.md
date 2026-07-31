# Platform Notification Service (PNS)

PNS lets a platform push a signed notice to a tool webhook instead of relying on an OIDC launch. This
tool implements the tool side of it, currently for Asset Processor submission notices.

Spec: <https://standards.1edtech.org/lti/specifications/proposals/lti-platform-notification-service/specification>

Endpoints are listed in the [README](../README.md#platform-notification-service-pns). The
`Platform Notifications` page in the UI wraps all of them.

## Flow

1. Launch the Asset Processor placement from the platform. The launch carries a
   `platformnotificationservice` claim naming the platform's PNS endpoint and the notice types it
   supports.
2. `POST /pns/register` reads that claim from the most recent launch, asks the platform which notice
   types it supports, and registers this tool's `/pns` endpoint as the handler.
3. A student submits to a content item the processor is attached to.
4. The platform posts a signed notice to `/pns`. The tool verifies it and records the delivery.
5. `POST /pns/verify` re-reads the platform's registered handlers and compares them against what is
   stored here. It never writes, so it is safe to call at any time.

Registration needs a prior launch: the deployment and client ids come from the launch claim, not from
configuration. `POST /pns/unregister` clears the handler on the platform.

## Notice payload

Below is a real `LtiAssetProcessorSubmissionNotice`, with hosts and identifiers replaced by
placeholders. JWT header:

```json
{ "kid": "<key-id>", "alg": "RS256" }
```

Body:

```json
{
  "https://purl.imsglobal.org/spec/lti-aip/claim/activity": {
    "activity_id": "_77428_1"
  },
  "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "<deployment-id>",
  "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
  "https://purl.imsglobal.org/spec/lti/claim/notice": {
    "id": "9a3a9bf3-b517-4394-87db-ddda210a5092",
    "timestamp": "2026-07-31T06:51:07.611796Z",
    "type": "LtiAssetProcessorSubmissionNotice"
  },
  "iss": "https://platform.example.com",
  "https://purl.imsglobal.org/spec/lti-aip/claim/submission": {
    "submission_id": "_907_1"
  },
  "nonce": "c90a06fd-cb7c-4e9e-af67-57e0838a0878",
  "https://purl.imsglobal.org/spec/lti/claim/context": {
    "id": "_28490_1",
    "label": "COURSE-101",
    "title": "Example Course"
  },
  "aud": "<client-id>",
  "exp": 1785480967,
  "https://purl.imsglobal.org/spec/lti-ap/claim/assetservice": {
    "assets": [
      {
        "asset_id": "_294_1",
        "url": "https://platform.example.com/learn/api/v1/lti/assets/_294_1/data",
        "title": "Submission_Text.html",
        "filename": "Submission_Text.html",
        "checksum": "B4b35OS5/BzXi1WreI6lSg==",
        "size": 11,
        "content_type": "text/html"
      }
    ],
    "scope": [
      "https://purl.imsglobal.org/spec/lti-ap/scope/asset.readonly"
    ]
  },
  "iat": 1785480667,
  "https://purl.imsglobal.org/spec/lti/claim/for_user": {
    "user_id": "<user-id>",
    "eula_accepted_at": "2026-07-31T06:51:07.611909Z"
  }
}
```

### Claims

| Claim | Contents |
|---|---|
| `lti/claim/notice` | notice `id`, `timestamp`, `type`. The `id` is the idempotency key |
| `lti-aip/claim/activity` | the platform item the processor is attached to |
| `lti-aip/claim/submission` | the submission that triggered the notice |
| `lti-ap/claim/assetservice` | one entry per submitted asset, each with a fetch url, plus the scope needed to fetch |
| `lti/claim/for_user` | the submitting user, and when they accepted the EULA |
| `lti/claim/context` | course id, label, title |
| `lti/claim/deployment_id`, `lti/claim/version` | standard LTI claims |
| `iss`, `aud`, `iat`, `exp`, `nonce` | standard JWT claims |

Two things worth knowing when writing a consumer:

- **There is no `assetreport` claim on the notice.** The report endpoint comes from the Asset
  Processor launch, not from the notice, so a tool that only receives notices cannot post a report
  without having seen a launch.
- **`activity` and `submission` use the `lti-aip` prefix while `assetservice` uses `lti-ap`.** This
  tool reads either prefix for `assetservice` so it keeps working if that changes.

## Verification

The notice JWT carries a `kid` and is verified against the platform's JWKS using the same path as a
launch JWT, so no separate key handling is needed. A delivery is only marked verified when the
signature checks out and the required notice claims are present.

If a platform cannot publish its key in a JWKS, set `pns_platform_public_key` in
`server/config/config.json` to a PEM public key and the tool will fall back to it.

Repeat notices carrying a notice `id` already seen are recorded and flagged as duplicates rather than
rejected, so retry behaviour stays visible.

## Testing retries

`POST /pns/failmode` with `{"enabled": true}` makes `/pns` return 500 while still recording each
delivery. That lets you watch a platform's retry sequence and its eventual give-up behaviour: every
attempt shares one notice `id`, and each attempt is re-signed so the nonce differs.

The body must be a JSON boolean. The string `"true"` is not truthy here and will leave fail mode off.

Turn it off again with `{"enabled": false}` when you are done, and confirm by reading `GET /pns`
rather than trusting the response.

## Notes

- Deliveries are stored in `server/src/database/pns-deliveries-data.json`, which is gitignored
  because it contains real launch data. Stop the tool before editing or clearing it, otherwise the
  in-memory copy is written back.
- As with the other Asset Processor workflows in this tool, validation is deliberately light. Asset
  checksums are not verified.
