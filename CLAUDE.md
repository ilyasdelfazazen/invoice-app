# coffeePanorama — Claude Code Instructions

## Context
This is a back-office invoicing app for Specialty Coffee Equipment (Tanger).
The project lives at `coffeePanorama/code/`.
The frontend is an Angular monorepo that got messy during setup and needs to be cleaned up.

---

## Current messy state (what went wrong)
Running `ng generate application` created things in the wrong places:
- `frontend/projects/web/` — Angular put it here automatically
- `frontend/UI/web/` and `frontend/UI/mobile/` — manually created, empty
- `frontend/ui-mobile/` — leftover from a bad command
- The correct structure was never fully created

---

## Target structure (what we want)

```
coffeePanorama/
├── etude/                          ← keep as is (PDFs, docs)
└── code/
    ├── backend/                    ← keep as is (Express already set up)
    └── frontend/                   ← Angular monorepo workspace
        ├── projects/
        │   ├── web/                ← Angular app (PC dashboard)
        │   │   └── src/
        │   │       └── app/
        │   │           ├── app.module.ts
        │   │           ├── app-routing.module.ts
        │   │           └── components/
        │   └── mobile/             ← Ionic + Angular app (Android/iOS)
        │       └── src/
        │           └── app/
        │               ├── app.module.ts
        │               ├── app-routing.module.ts
        │               └── components/
        └── libs/
            ├── services/           ← shared API calls (invoices, clients, products)
            ├── models/             ← shared TypeScript interfaces
            ├── utils/              ← shared calculation logic (HT, TVA, TTC)
            └── styles/
                ├── variables.scss  ← CSS vars: --color-primary, --font-size-md...
                ├── typography.scss ← fonts, sizes, weights
                ├── mixins.scss     ← reusable SCSS helpers
                └── index.scss      ← imports all of the above
```

---

## What to fix

### 1. Clean up the mess
- Delete `frontend/UI/` folder entirely (it's empty and misplaced)
- Delete `frontend/ui-mobile/` folder entirely (leftover artifact)
- Keep `frontend/projects/web/` — this is correct, just needs `components/` folder inside `src/app/`

### 2. Generate the mobile app correctly
```bash
cd coffeePanorama/code/frontend
ng generate application mobile --routing --style=scss --no-standalone
```
When asked about SSR → answer No

### 3. Create components folders
```bash
mkdir -p projects/web/src/app/components
mkdir -p projects/mobile/src/app/components
```

### 4. Create the libs folder structure
```bash
mkdir -p libs/services
mkdir -p libs/models
mkdir -p libs/utils
mkdir -p libs/styles
touch libs/styles/variables.scss
touch libs/styles/typography.scss
touch libs/styles/mixins.scss
touch libs/styles/index.scss
```

### 5. Populate variables.scss
Add this content to `libs/styles/variables.scss`:
```scss
:root {
  --color-primary:     #2C6E49;
  --color-secondary:   #4C956C;
  --color-accent:      #D4A017;
  --color-danger:      #E63946;
  --color-bg:          #F8F5F0;
  --color-text:        #1A1A1A;
  --color-text-muted:  #6B6B6B;

  --font-size-sm:   12px;
  --font-size-md:   14px;
  --font-size-lg:   18px;
  --font-size-xl:   24px;

  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;

  --shadow-sm:  0 1px 4px rgba(0,0,0,0.08);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.12);
}
```

### 6. Populate index.scss
Add this content to `libs/styles/index.scss`:
```scss
@import './variables';
@import './typography';
@import './mixins';
```

### 7. Import shared styles in both apps
In `projects/web/src/styles.scss` add at the top:
```scss
@import '../../../libs/styles/index';
```

In `projects/mobile/src/global.scss` add at the top:
```scss
@import '../../../libs/styles/index';
```

---

## Rules to follow
- Use `--no-standalone` for all Angular generate commands (this project uses NgModules)
- Use `--no-ssr` or answer No to SSR prompts
- Never touch `frontend/node_modules/`
- Never touch `frontend/angular.json` manually — only Angular CLI should modify it
- The `libs/` folder is shared between web and mobile — no UI code goes there, only logic and styles

---

## Stack reminder
- Frontend web: Angular 17, SCSS, NgModules
- Frontend mobile: Ionic 7 + Angular 17, Capacitor 5
- Backend: Express.js + Node.js, Mongoose, MongoDB
- Auth: JWT + bcrypt
- PDF: jsPDF (client-side)
- Share: Capacitor Share plugin → WhatsApp
