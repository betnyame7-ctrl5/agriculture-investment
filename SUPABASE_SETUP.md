# Agriculture Investment Platform - Setup & Deployment Guide

This application is built with **React, TypeScript, Tailwind CSS, and Express**. It features an integrated, full-featured relational SQLite database engine that works out-of-the-box with zero setup required, as well as native support and schemas for **Supabase**.

---

## 1. Quick Start (Running Out-of-the-Box)

The platform comes pre-configured with:
- **Pre-seeded Admin Account**:
  - **Email**: `admin@agricultureinvestment.com`
  - **Password**: `AdminAgro2026!`
- **Pre-configured Livestock Packages**:
  - `DOG PACKAGE` (GH₵15.00)
  - `GOAT PACKAGE` (GH₵40.00)
  - `COW PACKAGE` (GH₵80.00)
- **Official Mobile Money Details**:
  - **Network**: TELECEL
  - **Number**: 0507399029
  - **Account Name**: JOYCE ASABEA

---

## 2. Connecting to External Supabase

If you wish to host your database on [Supabase](https://supabase.com):

### Step A: Create a Supabase Project
1. Log in to [app.supabase.com](https://app.supabase.com) and click **New Project**.
2. Name your project (e.g., `agriculture-investment`) and set a secure database password.
3. Select the closest region (e.g., Frankfurt or London for Europe/West Africa).

### Step B: Run the SQL Schema
1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Open the file `supabase_schema.sql` located in the root of this project.
3. Copy and paste the entire script into the SQL Editor.
4. Click **Run** to execute the script. This will create:
   - All 9 application tables: `profiles`, `investment_packages`, `investments`, `deposits`, `withdrawals`, `transactions`, `notifications`, `support_messages`, and `site_settings`.
   - Comprehensive **Row Level Security (RLS)** policies ensuring users can only read/write their own records while administrators maintain full oversight.

### Step C: Configure Environment Variables
Copy the project URL and API keys from **Project Settings > API**:
```env
# .env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## 3. Email Verification Service

The application implements a strict 5-digit verification code system:
1. When a user registers, a random 5-digit code is generated and saved with a 15-minute expiration timestamp.
2. The code is dispatched via email and logged to the administrative audit log (`email_logs`).
3. For local or sandbox testing, the server logs the exact verification code in the server console, and the admin dashboard includes an **Outgoing Verification Email Log Viewer** so administrators can view dispatched codes.
4. To integrate with production SMTP (SendGrid, Mailgun, AWS SES, or Gmail):
   - Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in your environment.

---

## 4. Admin Account Creation

To designate an administrator:
1. **Default seeded administrator**:
   - `admin@agricultureinvestment.com` / `AdminAgro2026!`
2. **Promote any registered user**:
   - Run SQL in Supabase or SQLite:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
     ```

---

## 5. Deployment Guide

To deploy this application to production:
1. Build the production assets:
   ```bash
   npm run build
   ```
2. Start the full-stack server:
   ```bash
   npm run start
   ```
3. Compatible hosting providers:
   - Google Cloud Run (Containerized)
   - Render / Railway / Fly.io
   - VPS (Ubuntu with Node.js 20+)
