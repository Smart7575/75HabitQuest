# Vercel Deployment Guide for HabitQuest

To deploy this application to Vercel, follow these steps:

## 1. Import to Vercel
1. Push this code to a GitHub, GitLab, or Bitbucket repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New"** -> **"Project"**.
3. Select your repository and click **"Import"**.

## 2. Configure project settings
Vercel should automatically detect that this is a **Vite** project. Ensure the following settings are active:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 3. Environment Variables (Recommended)
While the app has fallback values, it is better to set your Firebase credentials as environment variables in the Vercel dashboard:
1. Go to **Settings** -> **Environment Variables**.
2. Add the following variables (keys must match exactly):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Click **"Save"**.

## 4. Deploy
Click **"Deploy"**. Vercel will build and host your application.

## Note on Routing
The included `vercel.json` ensures that client-side routing works correctly (e.g., refreshing the page on `/tasks` won't result in a 404).
