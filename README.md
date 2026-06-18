# ⧗ TimeCapsule

> *Send a message to your future self.*

Seal your letters, photos and videos. Unlock them when the moment arrives.

---

## Features

- ✉️ **Write letters** — rich text editor with beautiful typography
- 📸 **Upload photos** — seal a visual memory in time
- 🎬 **Upload videos** — hear your own voice from the past
- ⏳ **Lock durations** — 1 month, 1 year, 5 years, 10 years, or custom date
- 🔔 **Live countdown** — real-time countdown on every sealed capsule
- 🔐 **Google auth** — secure sign-in, your memories are private
- 🌍 **Real-time sync** — Firestore keeps everything in sync
- 📱 **Fully responsive** — beautiful on mobile, tablet, and desktop

---

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React 18, Vite, CSS Modules |
| Animation | Framer Motion            |
| Auth      | Firebase Authentication  |
| Database  | Cloud Firestore          |
| Deploy    | Vercel                   |

---

## Project Structure

```
src/
├── components/
│   ├── capsule/
│   │   ├── CapsuleCard.jsx         # Dashboard card with countdown
│   │   └── LockDurationPicker.jsx  # Beautiful duration selector
│   ├── layout/
│   │   └── Navbar.jsx              # Responsive navigation
│   └── ui/
│       ├── Button.jsx              # Reusable button
│       └── Toast.jsx               # Notification toasts
├── context/
│   ├── AuthContext.jsx             # Firebase auth state
│   └── CapsuleContext.jsx          # Capsule state + actions
├── hooks/
│   ├── useCountdown.js             # Live countdown timer
│   └── useToast.js                 # Toast notifications
├── pages/
│   ├── LandingPage.jsx             # Cinematic hero + features
│   ├── LoginPage.jsx               # Google sign-in
│   ├── DashboardPage.jsx           # All capsules view
│   ├── CreatePage.jsx              # 3-step creation flow
│   └── CapsuleViewPage.jsx         # Immersive unlock experience
├── services/
│   ├── firebase.js                 # Firebase init (no enableNetwork)
│   ├── auth.js                     # Auth methods
│   └── db.js                       # Firestore operations
├── styles/
│   └── globals.css                 # Design tokens + animations
└── utils/
    └── helpers.js                  # Dates, formatting, file utils
```

---

## Setup

### 1. Install

```bash
git clone https://github.com/yourusername/timecapsule.git
cd timecapsule
npm install
```

### 2. Firebase

1. Go to **console.firebase.google.com** → Create project
2. Enable **Authentication** → Google sign-in
3. Enable **Firestore Database** → Start in test mode
4. Register a Web App → copy config

### 3. Environment variables

```bash
cp .env.example .env
```

Fill in your Firebase values.

### 4. Firestore rules (after testing)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### 5. Run locally

```bash
npm run dev
```

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard → Settings → Environment Variables.

---

## Data Model

```
users/{uid}/
  capsules/{capsuleId}
    title       string
    type        'letter' | 'image' | 'video'
    content     string (text or base64)
    unlockDate  Timestamp
    opened      boolean
    createdAt   Timestamp
    updatedAt   Timestamp
```

---

## License

MIT — Seal your memories. Trust the future.
