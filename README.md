# Alfa App (MarketPulse Workspace)

Mobile-first marketing operations app for distributing campaign creatives and tracking posting status.

- **Admin** — reviews marketer registrations, sends flyer / personalized content (1:1 or bulk), monitors posting outcomes.
- **Marketer** — signs up, awaits approval, receives creatives, marks **Posted** / **Not Posted**, chats with admin.

> **Note:** This is currently a **frontend prototype**. There is no real backend API. Auth, users, conversations, actions, and notifications live in React context + `localStorage`.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Icons / motion | Lucide React, Motion |
| Phone / location | `libphonenumber-js` |
| State | `AppContext` + `localStorage` |
| i18n | English / Spanish (`src/utils/i18n.ts`) |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) copy env template
cp .env.example .env

# 3. Run dev server (http://localhost:3000)
npm run dev
```

Other scripts:

```bash
npm run build    # production build
npm run preview  # preview build
npm run lint     # TypeScript check (tsc --noEmit)
```

---

## Demo accounts

Use these to follow the flows below without signing up.

| Role | Email | Password | Status |
|------|--------|----------|--------|
| **Admin** | `admin@marketingapp.com` | `Admin@123` | Approved |
| **Marketer** | `marketer@marketingapp.com` | `Marketer@123` | Approved |
| Marketer (pending) | `elena.rostova@vanguard.com` | `Marketer@123` | Pending |
| Marketer (pending) | `marcus.thorne@apex.co` | `Marketer@123` | Pending |
| Marketer (rejected) | `carlos.mendez@promo.net` | `Marketer@123` | Rejected |

Seed data: `src/data/mockData.ts`.

---

## High-level architecture

```
┌─────────────┐     authView      ┌──────────────┐
│  LoginView  │ ◄───────────────► │  SignUpView  │
└──────┬──────┘                   └──────────────┘
       │ login success (approved)
       ▼
┌──────────────────────────────────────────────────┐
│                    AppShell                       │
│  Header · Active screen · BottomNav · Modals      │
└──────────────────────────────────────────────────┘
       │
       ├── Conversations (list + detail)
       ├── Bulk Sender          ← Admin only
       ├── Marketer Requests    ← built, not wired in nav yet
       ├── Notifications
       └── Profile
```

**Entry:** `src/main.tsx` → `src/App.tsx` → `AppProvider` → Login / SignUp / `AppShell`.

**State:** `src/context/AppContext.tsx` owns users, conversations, message actions, notifications, auth, toasts.

---

## Roles & navigation

### Admin tabs (4)

1. **Conversations** — inbox of all marketer threads  
2. **Bulk Sender** — broadcast / multi-recipient content  
3. **Notifications**  
4. **Profile**

### Marketer tabs (3)

1. **Conversations** — opens assigned thread directly (no inbox list)  
2. **Notifications**  
3. **Profile**

---

## End-to-end product flow

```
Marketer signs up (pending)
        │
        ▼
Admin reviews request → Approve / Reject
        │
        ├── Rejected → Marketer blocked at login
        │
        └── Approved → Marketer logs in
                            │
                            ▼
              Admin sends flyer / personalized content
              (chat composer or Bulk Sender)
                            │
                            ▼
              Marketer marks Posted or Not Posted
                            │
                            ▼
              Admin sees status + notifications
```

---

## Marketer flow (step by step)

### A. Registration (Sign Up)

**Screen:** `SignUpView` — 2 wizard steps.

#### Step 1 — Personal profile

1. Open app → **Sign Up** (from Login).
2. Upload profile photo (optional; JPG/PNG/WEBP, max 5MB).
3. Enter **Name** (required, min 2 chars).
4. Enter **Instagram** handle (optional).
5. Select **Preferred Flyer Language** (`en` / `es`).
6. Select **Preferred Flyer Category** from dropdown:
   - Work Injury
   - Car Accident
7. Tap **Continue**.

#### Step 2 — Account & location

1. Enter **Email** + **Password** (min 8 chars, letter + number).
2. Select **Country** (syncs phone dial code).
3. Enter **Phone** (digit limit is country-aware via `libphonenumber-js`).
4. Select / enter **State / Province**.
5. Enter **City** (letters only — no numbers).
6. Enter **Postal Code** (exactly **6 digits**).
7. Tap **Sign Up**.

**Result:**

- User created with `role: 'Marketer'`, `approvalStatus: 'pending'`
- Welcome conversation + notification seeded
- Redirected to **Login** with success message
- **Not** auto-logged in

### B. Login & approval gate

1. Enter email / password on Login.
2. Outcomes:
   - **Rejected** → blocked; status screen shown.
   - **Pending** → intended: wait for admin approval (see [Known gaps](#known-gaps--follow-while-building)).
   - **Approved** → enters app → Conversations tab.

### C. After approval — daily work

1. **Open Conversations** — assigned admin thread is shown.
2. Receive **creative** messages (flyer images, caption, notes).
3. For each postable creative:
   - Tap **Posted** → status saved (`markAsPosted`).
   - Or tap **Not Posted** → choose reason + optional comments (`NotPostedModal` → `markAsNotPosted`).
4. Reply with text messages when needed.
5. Check **Notifications** for new content / reminders.
6. Update **Profile** (name, phone, preferences) as needed.
7. **Sign out** from Profile.

### D. Onboarding tour (intended)

`WelcomeTourModal` + `completeTour()` exist for first-time marketers (6 steps: Conversations, Flyer Cards, Posting Status, Copy Message, Notifications, Profile).  
**Not currently mounted** in `AppShell` — wire this when implementing onboarding.

---

## Admin flow (step by step)

### A. Login

1. Login as `admin@marketingapp.com` / `Admin@123`.
2. Lands on **Conversations** list (“All Marketers / Conversations”).

### B. Review marketer requests (intended)

**Screen:** `MarketerRequestsView`  
**APIs ready:** `approveMarketer(userId)`, `rejectMarketer(userId, reason?)`

Intended steps:

1. Open **Marketer Requests** tab (filter: Pending / Approved / Rejected / All).
2. Open a marketer dossier (profile, location, preferences, Instagram).
3. **Approve** → `approvalStatus: 'approved'`, `reviewedAt` set.
4. **Reject** → `approvalStatus: 'rejected'`, optional `rejectionReason`.
5. **Revoke** (approved → reject flow) if access must be removed.

> **Current status:** View + context methods exist, but the tab is **not wired** into `BottomNav` / `AppShell` yet. See [Known gaps](#known-gaps--follow-while-building).

### C. Send content (1:1 chat)

1. Open a marketer conversation from the inbox.
2. Compose message:
   - Plain **text**, or
   - **Flyer** / **Personalized** creative (images + caption / notes).
3. Send → appears in marketer thread as postable content (`postingStatus: 'pending'`).
4. Marketer’s Posted / Not Posted updates show back in the thread / notifications.

### D. Bulk Content Sender

**Tab:** Bulk Sender (`BulkContentSenderView` → `sendBulkMessage`)

1. Choose content category: Flyer / Personalized / None.
2. Add title, body text, optional images.
3. Select recipients: **All** or specific conversations.
4. Send → messages delivered into selected threads.

### E. Monitor & follow up

1. **Notifications** — posting outcomes, content required, etc.
2. **Conversations** — unread badges, posting status on creative cards.
3. **Profile** — account info / logout.

---

## Content & posting model

| Concept | Values / notes |
|---------|----------------|
| Message type | `text` \| `creative` |
| Content category | `flyer` \| `personalized` \| `none` |
| Posting status | `pending` → `posted` \| `not_posted` |
| Action storage key | `` `${userId}_${messageId}` `` |
| Not Posted reasons | Approval Pending, Content Issue, Incorrect Information, Scheduling Issue, Client Request, Platform Issue, Duplicate Content, Other |

---

## Sign-up validation rules (current)

| Field | Rule |
|-------|------|
| Name | Required, min 2 characters |
| Flyer language | Required (`en` / `es`) |
| Flyer category | Required dropdown (`work_injury` / `car_accident`) |
| Email | Valid format; must be unique |
| Password | Min 8 chars, at least 1 letter + 1 number |
| Phone | Valid for selected country; max digits capped while typing |
| City | Letters only (name — no digits) |
| Postal code | Exactly **6 digits** |

Helpers: `src/utils/countries.ts`.

---

## Project structure

```
src/
  main.tsx
  App.tsx                          # Auth gate → Login | SignUp | AppShell
  index.css
  types/index.ts                   # User, Message, Conversation, etc.
  data/mockData.ts                 # Demo users, chats, notifications
  context/AppContext.tsx           # All app state + localStorage
  utils/
    i18n.ts                        # en / es translations
    countries.ts                   # Country, phone, city, postal helpers
    imageAssets.ts
    download.ts
  components/
    auth/                          # LoginView, SignUpView
    layout/AppShell.tsx
    navigation/                    # Header, BottomNav
    conversations/                 # List, Detail, ContentMessageCard, ImageViewer
    bulk/BulkContentSenderView.tsx # Admin bulk send
    admin/MarketerRequestsView.tsx # Approve / reject UI (not wired)
    onboarding/WelcomeTourModal.tsx# Marketer tour (not mounted)
    notifications/NotificationsView.tsx
    profile/                       # ProfileView, EditProfileModal
    modals/NotPostedModal.tsx
    common/                        # Toast, LanguageSelector, CopyButton
```

---

## Persistence (`localStorage`)

| Key | Stores |
|-----|--------|
| `marketpulse_users_v4` | Users list |
| `marketpulse_current_uid_v4` | Logged-in user id |
| `marketpulse_auth_v4` | Auth flag |
| `marketpulse_actions_v4` | Posted / Not Posted actions |
| `marketpulse_conversations_v4` | Conversations by user |
| `marketpulse_notifications_v4` | Notifications by user |
| `marketpulse_lang` | UI language (`en` \| `es`) |

> Init may still **read** older `*_v3` keys for users/auth/uid, then **write** `*_v4`. Clear site data if demo state looks stale.

---

## How to work on this codebase

Follow this order when implementing or debugging features:

1. **Clarify role** — Admin vs Marketer changes different tabs and context methods.
2. **Start from types** — `src/types/index.ts` for fields and statuses.
3. **Wire through context** — add/change behavior in `AppContext`, then connect UI.
4. **Auth / approval** — Login + SignUp + `approveMarketer` / `rejectMarketer`.
5. **Messaging** — `sendMessage` / `sendBulkMessage` → creative cards → posting actions.
6. **Keep i18n in sync** — add strings to both `en` and `es` in `i18n.ts`.
7. **Respect mock constraints** — no API yet; persist via `localStorage` patterns already in context.

### Suggested implementation priority

1. Wire **Marketer Requests** into Admin nav + `AppShell` routing.  
2. Enforce **pending** block in `login()` (match Login UI).  
3. Mount **WelcomeTourModal** for marketers with `hasCompletedTour === false`.  
4. Align brand naming (Login “Alfa” vs shell “MarketPulse”) if product decides one name.  
5. Replace mock/`localStorage` with a real backend when ready.

---

## Known gaps (follow while building)

| Gap | Detail |
|-----|--------|
| Welcome tour not shown | `WelcomeTourModal` + `completeTour` exist but are not rendered after login. |
| No backend | All data is client-side mock + `localStorage`. |

### Approval flow (wired)

1. Marketer signs up → `approvalStatus: 'pending'` (no app access).
2. Admin opens **Requests** tab → reviews profile → **Approve** / **Reject**.
3. Approved marketer can log in and use Conversations / Notifications / Profile.
4. Pending or rejected marketers are blocked at login (and cleared from any stale session).

---

## Environment

See `.env.example`:

- `GEMINI_API_KEY` — optional / AI Studio injection  
- `APP_URL` — hosted app URL when deployed  

Not required for basic local demo of auth, chat, and posting flows.

---

## License / project status

Private prototype (`package.json` name: `react-example`). Use this README as the source of truth for **Admin** and **Marketer** working steps until a backend and full navigation wiring land.
