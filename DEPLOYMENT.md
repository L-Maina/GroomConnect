# GroomConnect Vercel Deployment Guide

## 🚀 Quick Deploy

### Step 1: Set Up Supabase (Database + Storage)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Get your credentials from **Project Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Get database connection from **Project Settings > Database**:
   - `DATABASE_URL`
   - `DIRECT_DATABASE_URL`

4. **Create Storage Buckets** (for file uploads):
   - Go to Storage in Supabase dashboard
   - Create buckets: `avatars`, `portfolio`, `business-logos`, `service-images`
   - Set to public or configure RLS policies

### Step 2: Set Up Pusher (Real-time Chat)

1. Go to [pusher.com](https://pusher.com) and create an app
2. Get your credentials:
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

### Step 3: Set Up Cloudinary (Image Storage)

1. Go to [cloudinary.com](https://cloudinary.com) and create account
2. Get your credentials from Dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Step 4: Deploy to Vercel

**Via Vercel Dashboard:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `L-Maina/GroomConect`
3. Add environment variables (see below)
4. Click **Deploy**

**Via CLI:**
```bash
vercel login
vercel --prod
```

## 📋 Environment Variables

Add these in **Vercel Dashboard > Project > Settings > Environment Variables**:

### Required (Core)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `DIRECT_DATABASE_URL` | Same as DATABASE_URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | Random 32+ character string |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL |

### Required (Real-time + Storage)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher app key |
| `PUSHER_APP_ID` | Pusher app ID |
| `PUSHER_SECRET` | Pusher secret |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster (e.g., us2) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Optional (Payments)
| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal secret |

### Optional (Notifications)
| Variable | Description |
|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |

## 🔄 Database Migration

After first deploy, run migrations:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma generate
npx prisma db push
```

Or add to Vercel build settings:
- **Build Command**: `prisma generate && prisma migrate deploy && next build`

## 📊 Production Features Comparison

| Feature | Local (SQLite) | Vercel (Supabase) | How It Works |
|---------|---------------|-------------------|--------------|
| **Database** | SQLite ✅ | Supabase PostgreSQL ✅ | Connection pooling via `DATABASE_URL` |
| **Real-time Chat** | Socket.io ✅ | Pusher ✅ | Managed WebSocket service |
| **File Uploads** | Local filesystem ✅ | Cloudinary ✅ | Cloud image storage with CDN |
| **Auth** | JWT + Cookies ✅ | JWT + Cookies ✅ | Works everywhere |
| **API Routes** | Next.js ✅ | Vercel Serverless ✅ | Auto-scaling |

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel Edge   │     │  Pusher Cloud   │
│   (Next.js)     │◄───►│   (WebSocket)   │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│    Supabase     │     │   Cloudinary    │
│   (PostgreSQL)  │     │   (Images)      │
└─────────────────┘     └─────────────────┘
```

## 🔧 Switching to PostgreSQL

The default schema uses SQLite. For production:

1. **Option A**: Rename schema file
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```

2. **Option B**: Update the datasource in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_DATABASE_URL")
   }
   ```

## 🛠️ Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` includes `?sslmode=require`
- Check Supabase project is not paused (free tier)

### Pusher Not Working
- Verify cluster matches your region
- Check auth endpoint: `/api/pusher/auth`

### File Uploads Failing
- Verify Cloudinary credentials
- Check file size < 10MB

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
# Regenerate Prisma client
npx prisma generate
```

## 📝 Production Checklist

- [ ] Supabase database configured
- [ ] Pusher real-time configured
- [ ] Cloudinary storage configured
- [ ] JWT_SECRET set (32+ chars)
- [ ] Custom domain configured
- [ ] Payment gateways configured (optional)
- [ ] Email service configured (optional)
- [ ] SMS service configured (optional)

## 🔐 Security Notes

1. **Never commit** `.env` or `.env.local` to Git
2. **Rotate keys** if they're ever exposed
3. **Use RLS policies** in Supabase for data protection
4. **Enable rate limiting** in Vercel (Pro plan)

## 📞 Support

- [Supabase Docs](https://supabase.com/docs)
- [Pusher Docs](https://pusher.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Vercel Docs](https://vercel.com/docs)
