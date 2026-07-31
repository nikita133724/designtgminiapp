# Zooma backend contract

This frontend must consume the existing backend from `nikita133724/zooms` without changing its routes, payloads, or WebSocket message types.

## Authentication

Every HTTP request appends Telegram WebApp `initData`:

```text
?init_data=<url-encoded Telegram.WebApp.initData>
```

The WebSocket uses the same query parameter:

```text
/app/ws?init_data=<url-encoded Telegram.WebApp.initData>
```

There is no production demo fallback. Missing `initData` is an access error.

## HTTP API

| Method | Route | Request body | Purpose |
|---|---|---|---|
| GET | `/app/api/state` | none | Full current application state |
| POST | `/app/api/timezone` | `{ timezone, offset_min, locale }` | Save browser timezone |
| GET | `/app/api/addon/config` | none | Add-on tariffs and available account slots |
| POST | `/app/api/promo-activation-pause` | `{ account_id, paused }` | Pause/resume promo activation |
| POST | `/app/api/promo-activation-mode` | `{ account_id, mode }` | Switch between `server` and `extension` mode |
| POST | `/app/api/proxy/manual` | `{ account_id, host, port, login, password }` | Save SOCKS5 proxy |
| POST | `/app/api/chat-ai/settings` | account Chat AI settings | Enable/disable and configure Chat AI |
| POST | `/app/api/tariff/invoice` | `{ tariff_key }` | Create main subscription invoice |
| POST | `/app/api/addon/invoice` | `{ tariff_key, account_id }` | Create add-on account invoice |
| POST | `/app/api/tariff/invoice/cancel` | `{ invoice_id }` | Cancel pending invoice |
| POST | `/app/api/account/reset-casino-data` | `{ account_id }` | Clear casino and proxy data while preserving the slot |
| POST | `/app/api/extension-unbind` | `{ account_id }` | Unbind browser extension |
| POST | `/app/api/extension-reload` | `{ account_id }` | Reload managed extension page |
| POST | `/app/api/account/connect-prompt` | `{ account_id }` | Continue account connection in the bot |

Expected success envelope:

```json
{
  "ok": true,
  "data": {}
}
```

Expected error fields are checked in this order:

```text
detail -> message -> error -> HTTP fallback
```

## WebSocket

The client sends `ping` every 15 seconds and expects `pong`.

Supported JSON message types:

- `bootstrap` — full initial state
- `state` — full state replacement/refresh
- `profile_patch` — merge profile fields
- `accounts_patch` — replace account list and active account id
- `account_patch` — merge one account by `account_id`
- `invoice_patch` — update `pending_invoice`
- `promo_patch` — merge promo statistics
- `tariffs_patch` — replace main tariff list
- `addon_config_patch` — replace add-on configuration

The socket is considered unhealthy after 20 seconds without a message. HTTP `/app/api/state` polling is the fallback, every 5 seconds, while the page is visible.

## Browser storage compatibility

The React client preserves the same keys used by the existing Mini App:

- `zooma_app_tab_v1`
- `zooma_app_tariff_type_v1`
- `zooma_app_invoice_v1`
- `zooma_chat_ai_open_<account_id>`

The following development-only key is forbidden:

- `zooma_app_mock_state_v1`

## Production invariants

- No generated accounts, tariffs, invoices, ping values, or API responses.
- No silent switch to demo mode outside Telegram.
- The approved React/Tailwind visual design remains unchanged.
- Backend routes and message types remain owned by `zooms`.
- Static output must work from the `/app` base path.
