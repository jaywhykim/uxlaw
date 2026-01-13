This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

### Deploy to Vercel (Recommended - Free & Easy)

This Next.js app requires server-side features (API routes, database), so **GitHub Pages won't work** (it only serves static files). 

**Vercel is the best option** - it's free, made by Next.js creators, and supports all Next.js features.

#### Quick Deploy (5 minutes):

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

3. **Click "Add New Project"** and import your GitHub repository

4. **Add Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` - Your database connection string
   - `OPENAI_API_KEY` - Your OpenAI API key

5. **Click Deploy** - Vercel will automatically:
   - Build your app
   - Deploy it to a public URL (e.g., `your-app.vercel.app`)
   - Set up automatic deployments on every push to main

#### Your app will be live at: `https://your-repo-name.vercel.app`

### Alternative: Manual Deployment via GitHub Actions

If you prefer using GitHub Actions, the workflow is already set up in `.github/workflows/deploy.yml`. You'll need to:

1. Get Vercel credentials:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel login` and `vercel link`
   - Get your tokens from [vercel.com/account/tokens](https://vercel.com/account/tokens)

2. Add GitHub Secrets:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - Add: `DATABASE_URL`, `OPENAI_API_KEY`

### Why Not GitHub Pages?

GitHub Pages only serves static HTML/CSS/JS files. This app needs:
- ✅ API routes (`/api/analyze`) - requires a server
- ✅ Database (Prisma) - requires a server
- ✅ Server-side rendering - requires a server

Vercel provides all of this for free with zero configuration!
