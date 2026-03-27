# ⏱ Timesheet

Application de suivi de temps multi-clients et multi-projets, construite avec **Next.js 15**, **Supabase** et **TypeScript**.

---

## Stack

| Couche | Technologie |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| État serveur | TanStack React Query v5 |
| État local | Zustand |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Langage | TypeScript strict |

---

## Fonctionnalités

- **Authentification** – inscription / connexion par e-mail
- **Clients** – création, modification, suppression
- **Projets** – création, modification, suppression, taux horaire
- **Timer** – démarrage / arrêt en un clic, un seul timer actif à la fois
- **Saisie manuelle** – ajout d'une entrée avec heure de début et de fin
- **Tags** – étiquetage des entrées de temps
- **Analytiques** – total d'heures par projet pour le mois en cours
- **Realtime** – synchronisation automatique via Supabase Realtime

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd timesheet
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
```

Renseigner les valeurs dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<votre-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-clé-anon>
```

### 4. Initialiser la base de données

Dans le **SQL Editor** de votre projet Supabase, exécuter le fichier :

```
supabase/migrations/001_initial.sql
```

Ce script crée :
- Les tables (`users`, `clients`, `projects`, `time_entries`, `tags`, `time_entry_tags`)
- Les index
- Les triggers `updated_at`
- Les politiques **Row Level Security**
- Le trigger de création de profil à l'inscription

### 5. Démarrer en développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```
src/
├── app/                  # Pages (App Router)
│   ├── auth/             # Page de connexion / inscription
│   ├── clients/          # Page clients
│   ├── projects/         # Page projets
│   ├── entries/          # Page entrées de temps
│   ├── layout.tsx
│   └── page.tsx          # Dashboard
├── components/           # Composants React
├── hooks/                # Hooks React Query (useClients, useProjects…)
├── services/             # Appels Supabase (clients, projects, timeEntries, tags)
├── store/                # Store Zustand (timer)
├── lib/                  # Utilitaires (supabase client, formatage)
└── types/                # Types TypeScript (schéma DB)
supabase/
└── migrations/
    └── 001_initial.sql   # Migration initiale complète
```

---

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run type-check` | Vérification TypeScript |
| `npm run lint` | Linting ESLint |
