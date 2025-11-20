# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your ReactAI application.

## Prerequisites

- A Clerk account (sign up at [clerk.com](https://clerk.com))
- PostgreSQL database configured

## Step 1: Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Add application"
3. Choose your application name
4. Select the authentication methods you want to enable (Email, Google, GitHub, etc.)
5. Click "Create application"

## Step 2: Get Your API Keys

From your Clerk Dashboard:

1. Navigate to **API Keys** in the sidebar
2. Copy the following values:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Step 4: Set Up Clerk Webhooks

Webhooks are used to sync user data from Clerk to your database.

### For Development (using ngrok or similar):

1. Install ngrok: `npm install -g ngrok`
2. Start your Next.js dev server: `npm run dev`
3. In a new terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://xxxx-xx-xxx-xxx-xx.ngrok-free.app`)

### Configure Webhook in Clerk Dashboard:

1. Go to **Webhooks** in the Clerk Dashboard
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
   - For development: `https://xxxx.ngrok-free.app/api/webhooks/clerk`
4. Subscribe to the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Click "Create"
6. Copy the **Signing Secret** and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

### For Production:

Replace the ngrok URL with your actual production domain:
```
https://yourdomain.com/api/webhooks/clerk
```

## Step 5: Database Migration

The User model has already been added to your Prisma schema. Make sure your database is up to date:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to the sign-in page
4. Create a new account or sign in
5. Check your database to verify the user was created

## Features Enabled

✅ **Protected Routes**: All routes except sign-in and sign-up require authentication
✅ **User Sync**: User data is automatically synced to your PostgreSQL database
✅ **User Profile**: Users can manage their profile via the UserButton in the header
✅ **Sign Out**: Users can sign out from the UserButton dropdown

## Customization

### Customize Sign-In/Sign-Up Pages

The sign-in and sign-up pages are located at:
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`

### Customize User Button

You can customize the UserButton appearance in `components/Header.tsx`:

```tsx
<UserButton 
  afterSignOutUrl="/sign-in"
  appearance={{
    elements: {
      avatarBox: "w-10 h-10"
    }
  }}
/>
```

## Troubleshooting

### Webhook not receiving events

1. Make sure your ngrok tunnel is running
2. Verify the webhook URL in Clerk Dashboard is correct
3. Check that you've subscribed to the correct events
4. Verify `CLERK_WEBHOOK_SECRET` is set correctly

### Users not syncing to database

1. Check your database connection string in `.env.local`
2. Verify Prisma migrations are up to date
3. Check the webhook endpoint logs for errors

### Authentication not working

1. Verify all environment variables are set correctly
2. Make sure you're using the correct publishable key for your environment
3. Clear browser cache and cookies
4. Check the browser console for errors

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks Guide](https://clerk.com/docs/integrations/webhooks)
