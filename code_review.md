# TripSplit — Code Review

### Backend
#### 4. Borrow list query mixes IDs and names — `borrow.py` L40–44
Resolved / not applicable: Borrow participants intentionally support both registered TripSplit users and external contacts. Registered users are stored by user ID, while non-registered contacts are stored by name. list_borrows() queries from_user/to_user by the authenticated user's ID, so registered users remain discoverable even if their display name changes. External contacts are creator-local records and are intentionally name-based.

TODO — Fix Borrow netPosition
 Determine how to identify the current user's direction when a borrow involves a non-TripSplit contact.
 Make the backend determine whether each borrow is owed to the current user or owed by the current user.
 Return that direction with each borrow (e.g. owed_to_me / i_owe).
 Update borrow.tsx so netPosition = owed_to_me − i_owe.
 While doing this, reconcile the inconsistent identity checks in list_borrows() (ID) vs update_borrow() (name).

Priority: later — not blocking the current cleanup pass.

### Frontend
* Implement Forgot Password flow

Check whether the backend already has password-reset endpoints.
Add the required API methods.
Create the forgot-password screen.
Implement email/OTP/reset-password flow.
Connect “Forgot password?” on the login screen.
Test the complete reset flow end-to-end.

* Request and lend and remind buttons implementation - borrow.tsx
* "Add" button in borrow header in non-functionall - borrow.tsx

#### 18. `api.ts` base URL resolution is fragile — `api.ts` L5–7
```typescript
const BASE =
  Updates.manifest?.extra?.backendUrl ??
  Constants.expoConfig?.extra?.backendUrl;
```
`Updates.manifest` is the over-the-air update manifest, not the primary config source. For local dev and standard builds, this will always be `undefined`, so the fallback to `Constants.expoConfig` always runs. The OTA path should only be tried in production. In development the `BASE` should come from environment variables directly (`process.env.EXPO_PUBLIC_BACKEND_URL`).

---

## ♻️ Refactoring Suggestions

### Backend

---

#### R1. Extract `_is_trip_member` into a shared utility
Move the function to `app/core/utils.py` (or add it to `app/db/`) and import it everywhere. This eliminates duplication and ensures consistent behaviour.

---

#### R2. Replace `dict` return type annotation for `current_user` with a proper Pydantic model
`current_user` returns `Dict[str, Any]`. A `UserInDB` Pydantic model would catch shape mismatches at development time and improve IDE auto-complete throughout all route handlers.

---

#### R3. `DummyStore._resolve_dot_notation` has an infinite recursion risk — `dummy_store.py` L85
```python
remaining = ".".join(parts[parts.index(part) :])  # ← re-includes current part
```
`parts.index(part)` finds the **first** occurrence of `part` in the list, not the current index. If `part` appears multiple times (e.g. nested objects with the same key name), this creates an incorrect `remaining` path and could infinitely recurse. Use `enumerate` instead:
```python
for i, part in enumerate(parts):
    ...
    remaining = ".".join(parts[i:])
```

---

#### R4. Hard-coded demo data in route handlers should be moved to fixtures
`tools.py` (365 lines), `vendors.py` VENDOR_SEED, `notifications.py` NOTIFS_SEED, and `vendors.py` recommendations/discover are all hard-coded in the route files. These should be in `data/seed_fixtures.py` or loaded from JSON files, keeping route handlers thin.

---

#### R5. Pinned dependency versions are outdated — `requirements.txt`
- `fastapi==0.110.1` — current stable is 0.115.x
- `uvicorn==0.25.0` — current is 0.34.x
- `motor==3.3.1` — current is 3.7.x
- `pymongo==4.5.0` — current is 4.10.x
- `bcrypt==4.1.3` — current is 4.3.x

Several are mixed (some pinned `==`, some range `>=`) which is inconsistent. Use `>=` with a known-good lower bound for flexibility, or use a `pip-tools`-managed `requirements.txt` + `requirements.in`.

---

#### R6. Unused dependencies in `requirements.txt`
`boto3`, `requests-oauthlib`, `python-jose`, `pandas`, `numpy`, `jq`, `typer`, `passlib` are listed but nowhere imported or used in the codebase. These inflate the install footprint and introduce unnecessary CVE surface area.

---

#### R7. `CORS_ORIGINS = ["*"]` is defined but never used — `config.py` L30
The value is never passed to `CORSMiddleware` in `main.py`, which hard-codes `allow_origins=["*"]` directly. This makes the config entry a misleading dead variable.

---

#### R8. `JWT_SECRET` default is insecure but gets only a warning
```python
JWT_SECRET = os.environ.get("JWT_SECRET", "tripsplit_secret")
if JWT_SECRET == "tripsplit_secret":
    _logger.warning(...)
```
For a production system this should raise a hard error, not just log a warning. Or enforce it via Pydantic `BaseSettings` which can fail-fast on missing required env vars.

---

### Frontend

---

#### R9. `any` types are widespread — reduces type safety
Files: `auth.tsx` (`User = any`, `signUp(data: any)`), `home.tsx` (`useState<any>`, `useState<any[]>`), `borrow.tsx` (`e: any`). The `User`, `Trip`, `Expense`, `Borrow` interfaces are all defined in `api.ts` but often not imported into screens that use the same data.

---

#### R10. Inline styles scattered throughout screens
Most screens mix `StyleSheet.create()` styles with inline `style={{ ... }}` props. For example, in `home.tsx` there are dozens of inline styles like `style={{ flexDirection: "row", gap: 10 }}`. These should use the existing `spacing`/`radius` tokens from `theme.ts` via named styles.

---

#### R11. `font` and `shadow` tokens from `theme.ts` are almost never used
`theme.ts` exports `font`, `shadow`, `radius`, and `spacing` tokens, but most screens define their own hardcoded `fontSize`, `fontWeight`, `borderRadius` values instead of referencing these tokens. This makes the design system inconsistent and hard to update globally.

---

#### R12. No loading skeleton / shimmer — only plain "Loading..." text
Multiple screens (wallet, borrow, trips) show a plain `<Text>Loading...</Text>`. A shimmer/skeleton UI would be more appropriate for a "premium" app.

---

#### R13. Error boundaries are absent
There is no React error boundary wrapping the app or major screen trees. An unhandled JS exception will crash the whole app with a red screen rather than showing a graceful fallback.

---

## 🔒 Security Issues

| # | Issue | Severity |
|---|---|---|
| S1 | OTP always `"123456"` — authentication bypassable | **Critical** |
| S2 | Default `JWT_SECRET = "tripsplit_secret"` in production | **High** |
| S3 | CORS `allow_origins=["*"]` in production | **Medium** |
| S4 | No rate-limiting on `/auth/login` or `/auth/signup` | **Medium** |
| S5 | No password minimum length/complexity validation in `SignupReq` | **Medium** |
| S6 | User token not re-validated on app resume (frontend) | **Low** |

---

## 📈 Performance Issues

| # | Issue | Location |
|---|---|---|
| P1 | N+1 API call pattern (loop of `await`) in wallet screen | `wallet.tsx` L47–59 |
| P2 | Balance endpoint makes N+1 DB queries (one per trip) | `expenses.py` L82–84 |
| P3 | No pagination — `to_list(500)` on expenses | `expenses.py` L65 |
| P4 | In-memory `_session_cache` in AI routes has no eviction | `ai.py` L30 — grows forever |
| P5 | `DummyStore._save()` writes the entire JSON file on every mutation | `dummy_store.py` L50–54 |

---

## 🏗️ Architecture Notes

- **Missing**: No `DELETE` endpoint for trips or expenses — users have no way to remove data.
- **Missing**: No `PATCH /trips/{id}` to update trip budget, dates, or members after creation.
- **Missing**: The `trip_id` on wallet/transactions is never validated against the trip_id in the borrow schema, allowing cross-trip wallet transactions.
- **Missing**: No pagination/cursor on list endpoints — the `to_list(100/200/500)` hard caps will silently truncate data.
- **Note**: The `tools.py` trip-tools endpoint returns 100% static mock data regardless of `trip_id`. There is no actual DB persistence for journal entries, itinerary, packing lists, polls, chat, or photo album — these are completely non-functional.
- **Note**: `discover` endpoint has no authentication (`user` dependency removed), but `recommendations` does. These are inconsistent.
