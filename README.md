# CivicHub

Community action platform for neighborhood involvement — with Google auth, ZIP verification, and ad support.

---

## Deploy to Vercel (30 minutes, no coding)

### Step 1 — Set up Supabase (your database + auth)
1. Go to https://supabase.com → **Start your project** → create a free account
2. Click **New Project** → name it `civichub` → pick a region → create
3. Wait ~2 min for it to spin up
4. Go to **Settings → API** → copy your **Project URL** and **anon public** key — you'll need these in Step 4

### Step 2 — Enable Google Auth in Supabase
1. In Supabase: **Authentication → Providers → Google** → toggle it on
2. Go to https://console.cloud.google.com → create a project → enable OAuth
3. Create credentials → OAuth 2.0 Client ID → Web application
4. Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI
5. Copy the Client ID and Secret back into Supabase → Save

### Step 3 — Create the profiles table in Supabase
1. In Supabase: **SQL Editor** → paste and run this:

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  zip text,
  updated_at timestamptz
);
alter table profiles enable row level security;
create policy "Users can read/write own profile"
  on profiles for all using (auth.uid() = id);
```

### Step 4 — Push to GitHub
1. Go to https://github.com → create a free account
2. Click **+** → New repository → name it `civichub` → Public → Create
3. Click **uploading an existing file** → drag the unzipped folder contents in → Commit

### Step 5 — Deploy on Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. **Add New → Project** → find `civichub` → Import
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
4. Click **Deploy** → live in ~60 seconds

### Step 6 — Add your Vercel URL to Supabase
1. In Supabase: **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://civichub.vercel.app`)
3. Add it to **Redirect URLs** too

### Step 7 — Custom domain (optional, ~$12/yr)
1. Buy a domain at https://namecheap.com
2. Vercel → Settings → Domains → add it → follow DNS instructions

---

## Local Development
```
npm install
npm run dev
```
Open http://localhost:5173

Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
