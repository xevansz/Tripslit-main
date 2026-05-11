# TripSplit — Product Requirements (Iteration 3)

Premium mobile super-app for group travel — splitting, fintech wallet, group QR pay, AI assistant, vendor marketplace, safety, gamification.

## Tech
- Expo Router (file-based) · FastAPI + MongoDB · Claude Sonnet 4.5 (Emergent Universal Key) · JWT + bcrypt + mocked OTP
- 55 backend endpoints, 55/55 tests passing
- ~30 functional screens, no dead links

## Feature → Screen Map (31 features distributed contextually)

| # | Feature | Lives in |
|---|---|---|
| 1 | Group split creation | Add Expense flow + Trip Dashboard |
| 2 | Shared wallet | `/trip/[id]/wallet` (treasury card, contributions, transactions) |
| 3 | Auto expense split + OCR | Add Expense → "Scan receipt with OCR" CTA |
| 4 | Realtime UPI settlement | `/trip/[id]/settlement` (UPI banner + status) |
| 5 | Discovery of popular locations | `/discover` (4 destinations, AR/VR) |
| 6 | Polls | `/trip/[id]/polls` (vote bars + %) |
| 7 | Auto-generated trip journals | `/trip/[id]/journal` (AI-tagged entries) |
| 8 | Itinerary management | `/trip/[id]/itinerary` (timeline + Google Calendar sync) |
| 9 | Packing checklist | `/trip/[id]/packing` (group assignments) |
| 10 | Multi-currency | Profile → /profile/language (7 currencies) |
| 11 | Exportable analytics | `/trip/[id]/reports` (PDF/CSV export) |
| 12 | AI budget prediction | Trip Wallet (Insights) + TripBuddy AI |
| 13 | Gamification | `/profile/achievements` (XP + 6 badges) |
| 14 | Smart journals (AI) | Same as #7 with AI tag chips |
| 15 | Personalised recs | Home "Recommended for you" carousel |
| 16 | Parental tracking | `/profile/parental` |
| 17 | SOS alerts | `/sos` (pulsing button + contacts) |
| 18 | Integrated vendor booking | Vendors tab + `/vendor/[id]` |
| 19 | Travel insurance | Vendors → Insurance category (SafeTravel) |
| 20 | AR/VR previews | Vendor detail AR/VR row + Discover AR badges |
| 21 | Chatbot (TripBuddy) | Tabs → TripBuddy AI |
| 22 | Multi-language | `/profile/language` (6 languages) |
| 23 | Group photo album + map pins | `/trip/[id]/album` |
| 24 | Smart notifications | `/notifications` (5 filters, 6 seeded) |
| 25 | Roles & permissions | Trip Dashboard → Members tab (Organizer/Treasurer/Member + trust score) |
| 26 | Custom privacy controls | `/profile/privacy` (3 toggles) |
| 27 | Emergency contact sharing | `/sos` + `/profile/parental` |
| 28 | Document vault | `/profile/vault` (encrypted, 4 docs) |
| 29 | In-app chat | `/trip/[id]/chat` (group chat) |
| 30 | Google Calendar | Itinerary → Calendar sync button |
| 31 | Advanced search filters | Vendors tab (8 categories + search) |

## Bottom-nav (5 tabs)
Home · Trips · TripBuddy AI · Vendors · Profile

## Smart Business Enhancements
- **Premium subscription** (yearly = 33% saves) — recurring SaaS revenue
- **Vendor marketplace take-rate** — 8 vendors across 4 fintech-relevant categories (Stay, Food, Cab, eSIM, Insurance, ATM)
- **Group QR Pay** processing-fee opportunity — the unique fintech USP
- **Gamification XP** drives DAU/retention
