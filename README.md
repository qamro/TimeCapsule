# ⧗ TimeCapsule

> *Send a message to your future self.*

Seal your letters, photos and videos. Unlock them when the moment arrives.

---

<div align="center">
 
**🌐 Live Demo: (https://time-capsule-qamro.vercel.app)** 

</div>

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

## 👨‍💻 Author

Developed by:

**Mohamed Qamar Eddine Bakhouche**

---


## License

**MIT** 

---

<div align="center">
    
## Seal your memories. Trust the future.

</div>
