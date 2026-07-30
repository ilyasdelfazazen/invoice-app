# SCE Manager

> **Full-stack back-office application** — Angular web dashboard + Ionic mobile app (Android & iOS), powered by a shared REST API.  
> Built for a real specialty coffee equipment company in Tanger, Morocco.

<div align="center">

![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic_7-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor_5-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

</div>

---

## What is this?

A production-ready back-office tool built for a real business. The admin manages clients, a product catalogue, and finances — then generates professional PDF invoices and shares them directly via WhatsApp in one tap. No third-party invoicing platform. No subscriptions. A fast, private, purpose-built product.

The project ships as **two apps from a single Angular monorepo**:
- A **web dashboard** (Angular 17) for desktop office use
- A **native mobile app** (Ionic 7 + Capacitor 5) deployed on Android and iOS devices

---

## Features

### Core
| Feature | Details |
|---|---|
| 🔐 Authentication | JWT login — single admin, bcrypt-hashed password, HTTP interceptor auto-attaches token |
| 👥 Clients | Full CRUD — company, ICE, city, address, phone, email, client code |
| 📦 Products | Full CRUD — reference, designation, unit, price HT |
| 🧾 Invoice builder | Multi-step: client → line items → summary. Per-line discount, auto HT / TVA / TTC calculation |
| 📄 Proforma & Invoice | Create as proforma, convert to invoice in one tap. Custom invoice number support |
| 📊 Operations | Track expenses and revenues — category, status (open/paid), context (personal/business), mark as paid |
| 📈 Dashboard | Revenue, total invoices, open operations — real data, no mocks |
| ⚙️ Settings | Company info + logo upload, language, dark/light theme, change password |

### PDF & Sharing
| Feature | Details |
|---|---|
| 📄 PDF engine | Custom layout rendered client-side with **jsPDF** — logo, client block, line table, totals, stamp area |
| 📲 Native share | Capacitor **Filesystem** writes PDF to device cache, Capacitor **Share** opens native share sheet → WhatsApp |
| 📥 Operations PDF | Export filtered operations report as PDF — same engine, different layout |

### Mobile-specific
| Feature | Details |
|---|---|
| 📱 iOS safe area | Dynamic Island and notch support — CSS `env(safe-area-inset-*)` applied throughout |
| 🔍 Pinch-to-zoom | Disabled for native app feel — viewport meta configured correctly |
| 📲 Download tab | Settings → Download: Android APK direct download + iOS App Store link |

### Internationalisation
| Feature | Details |
|---|---|
| 🌐 4 languages | French, English, Dutch, Arabic — full UI coverage |
| 🔄 RTL support | Arabic triggers right-to-left layout automatically |
| 🌙 Dark / Light mode | CSS custom properties — instant switch, persisted across sessions |

---

## Architecture

```
sce-manager/
├── backend/                        Express REST API
│   └── src/
│       ├── config/                 DB connection + JWT config
│       ├── models/                 Mongoose schemas (Admin, Application, Client, Product, Invoice, Operation)
│       ├── routes/                 6 route files
│       ├── controllers/            Business logic, separated per resource
│       └── middleware/             JWT auth guard + centralized error handler
│
└── frontend/                       Angular monorepo (single node_modules)
    ├── projects/
    │   ├── web/                    Angular 17 — PC dashboard (PrimeNG)
    │   └── mobile/                 Ionic 7 + Angular — Android & iOS
    └── libs/                       Shared across both apps
        ├── services/               API calls (auth, clients, products, invoices, operations, pdf)
        ├── models/                 TypeScript interfaces
        ├── utils/                  Invoice calculation logic (HT, TVA, TTC)
        ├── styles/                 SCSS design tokens (CSS custom properties)
        ├── guards/                 Auth route guard
        ├── interceptors/           JWT interceptor + global error interceptor
        ├── resolvers/              Route data prefetching (no loading flicker)
        └── environments/           environment.ts / environment.prod.ts
```

---

## Key Technical Decisions

**Angular monorepo with shared libs** — Both `web` and `mobile` import from `libs/`. Services, models, interceptors, PDF engine are written once and work on both platforms. Zero duplication.

**Client-side PDF generation** — jsPDF runs entirely in the browser / WebView. No server-side rendering, no cloud service, no cost per PDF. The layout is hand-coded in millimetres: logo sizing with aspect-ratio preservation, column alignment, footer totals block.

**Capacitor native bridge** — After PDF generation, the file is written to the device cache via `Filesystem.writeFile`, then `Share.share` opens the native OS share sheet. On Android, WhatsApp appears directly.

**Route resolvers** — Every page that needs data uses an Angular resolver. The data is fetched before navigation completes — no skeleton screens, no loading spinners on page entry.

**Environment-based CORS** — The Express backend switches allowed origins at runtime based on `NODE_ENV`. Dev allows `localhost:4200` and `localhost:8100`. Production locks to the real domain. No manual file edits when switching environments.

**i18n with ngx-translate** — Translation JSON files live in `libs/assets/i18n/`. Both apps share the same files. Arabic triggers `dir="rtl"` on the document root.

---

## Invoice Calculation

```typescript
// libs/utils/invoice.utils.ts
export function calculateLine(qty: number, unitPrice: number, discountPct: number) {
  const gross       = qty * unitPrice;
  const discount    = gross * discountPct;
  const line_total  = gross - discount;
  return { discount_amount: discount, line_total_ht: line_total };
}

export function calculateTotals(lines: { line_total_ht: number }[], tvaRate: number) {
  const total_ht  = lines.reduce((s, l) => s + l.line_total_ht, 0);
  const tva       = total_ht * tvaRate;
  const total_ttc = total_ht + tva;
  return { total_ht, tva_amount: tva, total_ttc };
}
```

---

## Data Model

```
Admin (1)
  └── JWT session

Application (1)
  └── Company info, logo (base64), bank details

Client (n)
  └── Invoice (n)
        └── InvoiceLine (n) ──► Product ref (name, price snapshot)

Operation (n)
  └── Standalone — expense or revenue tracking
```

5 MongoDB collections. ObjectId references between documents — no embedding, full query flexibility.

---

## Stack

| Layer | Technology |
|---|---|
| Web UI | Angular 17, PrimeNG, SCSS |
| Mobile UI | Ionic 7, Angular 17 |
| Native bridge | Capacitor 5 (Android + iOS) |
| PDF engine | jsPDF (client-side, zero server cost) |
| Sharing | Capacitor Share + Filesystem |
| State / routing | Angular Router, Route Resolvers, Guards |
| i18n | ngx-translate — FR / EN / NL / AR (RTL) |
| HTTP client | Angular HttpClient + interceptors |
| REST API | Express.js + Node.js |
| ODM | Mongoose |
| Database | MongoDB |
| Auth | JWT + bcrypt |
| Security | helmet, cors (env-based), sanitized error responses |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 17+
- Ionic CLI 7+
- MongoDB (local or Atlas)

### 1. Clone
```bash
git clone https://github.com/ilyasdelfazazen/invoice-system.git
cd invoice-system
```

### 2. Backend
```bash
cd backend
npm install
```

Create `.env`:
```env
MONGO_URI=mongodb://localhost:27017/sce-manager
JWT_SECRET=your_secret_key
PORT=3000
```

```bash
nodemon src/app.js
```

### 3. Web dashboard
```bash
cd frontend
npm install
ng serve --project=web
# → http://localhost:4200
```

### 4. Mobile app (browser preview)
```bash
ng serve --project=mobile
# → http://localhost:8100
```

### 5. Mobile app (Android device)
```bash
ng build mobile
npx cap sync android
npx cap open android
# Build and run from Android Studio
```

---

## Deployment Checklist

When going to production on a VPS:

| File | Change |
|---|---|
| `libs/environments/environment.prod.ts` | Set `apiUrl` to `https://yourdomain.com/api` |
| `backend/src/app.js` | Add `https://yourdomain.com` to the `production` origins array |
| Server | Start with `NODE_ENV=production` (pm2 or systemd) |
| Mobile | Rebuild APK after changing `environment.prod.ts`, re-sync Capacitor |

The backend must be served over **HTTPS** (nginx + Let's Encrypt). The Android app and CORS config are already cleaned of all HTTP dev flags — no changes needed there.

---

## Roadmap

- [x] Angular monorepo setup — shared libs, environments, styles
- [x] Express REST API — 6 resources, JWT auth, error handling
- [x] Web — full CRUD for clients, products, invoices, operations
- [x] Web — multi-step invoice builder with live HT/TVA/TTC calculation
- [x] Web — PDF generation (jsPDF, client-side, faithful proforma layout)
- [x] Web — dashboard with real revenue and status stats
- [x] Web — settings: company info, logo upload, language, theme, password
- [x] Mobile — Ionic UI matching web feature parity
- [x] Mobile — native PDF share via Capacitor (WhatsApp)
- [x] Mobile — iOS Dynamic Island & notch safe area support
- [x] i18n — French, English, Dutch, Arabic (RTL)
- [x] Dark / Light mode
- [x] Download tab — APK direct download + iOS App Store link
- [x] Production CORS config — env-based origin switching
- [ ] Deploy to VPS with nginx + SSL
- [ ] Publish iOS build to App Store

---

## Author

Built by **Ilyas Delfazazen** — [@ilyasdelfazazen](https://github.com/ilyasdelfazazen)

> *Built for real business. Runs on real devices. Ships as a real product.*

---

<div align="center">
  <sub>Made with ☕ in Morocco</sub>
</div>
