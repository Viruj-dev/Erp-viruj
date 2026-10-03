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

## PostHog analytics

Set `NEXT_PUBLIC_POSTHOG_KEY` to the PostHog project token in `apps/web/.env.local` and in the web deployment environment. Set `NEXT_PUBLIC_POSTHOG_HOST` to your regional ingestion endpoint (`https://us.i.posthog.com` by default, or `https://eu.i.posthog.com` for EU projects). Restart development or rebuild the deployment after changing these public variables. Analytics is disabled when the key is absent.

The app tracks initial page views and route changes, identifies signed-in staff by their internal user ID, and resets identity after logout or account changes. Unknown route segments are replaced with `:id`; query strings, URL fragments, page titles, and referrer URLs are excluded. Autocapture, session replay, surveys, and automatic exception capture are disabled to avoid collecting clinical data. Do not send patient details, form values, or clinical records in custom events.

Verify with your project configured: open the ERP, navigate between modules, and check `$pageview` events in PostHog's live events view. Sign in and confirm the staff ID appears; sign out and confirm subsequent events are anonymous. Inspect event properties to confirm routes contain no record identifiers or query parameters.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
