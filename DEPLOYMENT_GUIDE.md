# Deployment Guide for FB ROI Checker

This guide covers how to deploy your application to **Netlify** (or Vercel) using GitHub. This is the recommended "Continuous Deployment" method, which updates your live site automatically whenever you push code changes.

## Step 1: Create a GitHub Repository

1. Log in to your [GitHub account](https://github.com).
2. Click the **+** icon in the top right and select **New repository**.
3. Name it `fb-roi-checker` (or similar).
4. Set it to **Private** (recommended since you have API keys, though we use env vars for safety).
5. **Do not** initialize with README, .gitignore, or License (we already have these).
6. Click **Create repository**.

## Step 2: Push Your Code to GitHub

Copy the URL of your new repository (it looks like `https://github.com/username/repo.git`).

Run the following commands in your VS Code terminal:

```bash
# Link your local code to the new GitHub repo
# REPLACE 'YOUR_REPO_URL' with the actual URL you just copied
git remote add origin YOUR_REPO_URL

# Push your code
git push -u origin master
```

## Step 3: Deployment (Netlify)

1. Log in to [Netlify](https://app.netlify.com).
2. Click **Add new site** > **Import from an existing project**.
3. Select **GitHub**.
4. Authorize Netlify to access your GitHub account if asked.
5. Search for and select your `fb-roi-checker` repository.
6. **Build Settings:**
   - **Build Command:** `npm run build`
   - **Publish directory:** `.next`
   - **Netlify Plugin:** You shouldn't need a special plugin, Next.js support is usually automatic.

## Step 4: Environment Variables (CRITICAL)

Before clicking "Deploy", execute the following:

1. Click **Show advanced** or **Environment Variables**.
2. Add the following keys. You can find these values in your local `.env.local` file or your Supabase/Dodo dashboards.

| Key                             | Value Description                                                 |
| ------------------------------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase Project URL                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key                                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Your Supabase Service Role Key (Found in Supabase Settings > API) |
| `DODO_PAYMENTS_API_KEY`         | Your Dodo Payments Secret Key                                     |
| `DODO_LIVE_MODE`                | `true` for Live, `false` for Test                                 |

3. Click **Deploy Site**.

## Troubleshooting

- **Build Failed?** Check the "Deploy Log".
  - If it complains about missing API keys _during build_, don't worry—we added a fix (`mock client`) for this.
  - If it complains about memory, we added a fix (`--max-old-space-size=4096`) for this.
- **App Broken after Deploy?**
  - Check that you added the Environment Variables correctly in Netlify Settings.
  - Check the browser console (F12) for errors.

## Alternative: Vercel (Recommended for Next.js)

If Netlify gives you trouble, Vercel is built by the creators of Next.js and often works more smoothly.

1. Go to [Vercel.com](https://vercel.com).
2. **Add New...** > **Project**.
3. Import your GitHub Repo.
4. Add the Environment Variables.
5. Click **Deploy**.
