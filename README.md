# 💒 VivahSetu — Find Your Perfect Life Partner

> India's modern, full-stack matrimony platform built with React.js, Node.js, MongoDB, and Tailwind CSS.

![VivahSetu Banner](https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=400&fit=crop)

## 🌟 Features

### For Users
- 🔐 JWT Authentication (Register, Login, Email Verification, Forgot/Reset Password)
- 👤 Detailed Matrimonial Profile (Personal, Professional, Lifestyle, Family, Partner Preferences)
- 📸 Multiple Photo Upload via Cloudinary (up to 10 photos)
- 💡 Smart Match Recommendations with Compatibility Score
- 🔍 Advanced Search with 10+ Filters
- 💌 Interest System (Send, Accept, Reject, Cancel)
- 🔖 Shortlist / Save Profiles
- 💬 Private Messaging (polling-based, no WebSocket needed)
- 🔔 Notification Center
- 💎 Premium Subscription via Razorpay
- 🌐 Multilingual: English, Hindi, Marathi

### For Admins
- 📊 Admin Dashboard with Analytics
- 👥 User Management (View, Suspend, Delete)
- ✅ Profile Verification (Approve/Reject)
- 💳 Payment Management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| State | Redux Toolkit |
| Routing | React Router v6 |
| Forms | React Hook Form |
| i18n | i18next (EN, HI, MR) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Storage | Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer |
| Security | Helmet, CORS, Rate Limiting, Mongo Sanitize |

---

## 📁 Project Structure

```
VivahaSetu/
├── backend/
│   ├── config/         # DB, Cloudinary, Razorpay config
│   ├── controllers/    # Auth, Profile, Match, Interest, Message, Payment, Notification, Admin
│   ├── middleware/     # Auth, Admin, Rate Limiter, Error Handler, Validator
│   ├── models/         # User, Profile, Photo, Interest, Message, Conversation, Subscription, Payment, Notification, Shortlist
│   ├── routes/         # All API routes
│   ├── services/       # Email, Match, Notification services
│   ├── utils/          # API Response, Token Generator, Helpers, Seed
│   ├── validators/     # Input validators
│   └── server.js
│
└── frontend/
    └── src/
        ├── app/        # Redux store
        ├── components/ # Reusable UI components
        ├── i18n/       # Translations (EN, HI, MR)
        ├── layouts/    # MainLayout, DashboardLayout, AdminLayout
        ├── pages/      # All pages including Admin
        ├── redux/      # Slices: auth, profile, match, notifications, ui
        ├── routes/     # ProtectedOutlet
        ├── services/   # Axios API service
        └── utils/      # Helpers, constants
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (test mode)
- Gmail SMTP (or any SMTP)

### 1. Clone & Navigate
```bash
cd VivahaSetu
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy env file
copy .env.example .env
# Edit .env with your credentials
```

**Backend `.env` values:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vivahsetu
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### 3. Seed the Database
```bash
cd backend
npm run seed
```

**Default accounts after seeding:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vivahsetu.com | Admin@123 |
| User | rahul@example.com | Test@123 |
| User | priya@example.com | Test@123 |

### 4. Start Backend
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| PUT | `/api/auth/change-password` | Change password |
| PUT | `/api/auth/preferences` | Update preferences |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/me` | Get my profile |
| PUT | `/api/profiles/me` | Update profile |
| GET | `/api/profiles/:id` | View profile |
| POST | `/api/profiles/photos` | Upload photo |
| DELETE | `/api/profiles/photos/:id` | Delete photo |
| PUT | `/api/profiles/photos/:id/set-profile` | Set profile photo |

### Matches & Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches/suggestions` | Get suggested matches |
| GET | `/api/matches/search` | Search profiles with filters |

### Interests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interests` | Send interest |
| PUT | `/api/interests/:id/respond` | Accept/Reject |
| DELETE | `/api/interests/:id` | Cancel interest |
| GET | `/api/interests/sent` | Sent interests |
| GET | `/api/interests/received` | Received interests |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/conversations/:userId` | Get/create conversation |
| GET | `/api/messages/:conversationId` | Get messages |
| POST | `/api/messages` | Send message |

### Payments (Razorpay)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/history` | Payment history |
| GET | `/api/payments/subscription` | Subscription details |

---

## 💎 Subscription Plans

| Feature | Free | Silver (₹499/3mo) | Gold (₹999/6mo) |
|---------|------|-------------------|-----------------|
| Profile Views | 10 | Unlimited | Unlimited |
| Interests | 5 | Unlimited | Unlimited |
| Messaging | ✗ | ✓ | ✓ |
| Priority Visibility | ✗ | ✗ | ✓ |
| Premium Badge | ✗ | ✗ | ✓ |

---

## 🔒 Security

- JWT Authentication with expiry
- Password hashing with bcryptjs (rounds: 12)
- Rate limiting (15 req/min for auth)
- MongoDB injection protection (mongo-sanitize)
- Helmet.js for HTTP security headers
- CORS configured for frontend origin
- Input validation on all endpoints

---

## 🌐 Multilingual Support

Switch language from the navbar. Supports:
- 🇬🇧 **English** (default)
- 🇮🇳 **Hindi** (हिंदी)
- 🇮🇳 **Marathi** (मराठी)

Language preference is stored in `localStorage`.

---

## 🚢 Deployment

### Backend (Railway / Render / EC2)
```bash
cd backend
npm start
```
Set all environment variables in your hosting platform.

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

Add `VITE_API_URL=https://your-backend-url/api` to frontend env vars.

### MongoDB (Atlas)
Use MongoDB Atlas for production. Update `MONGO_URI` in backend `.env`.

---

## 📱 Screenshots

| Page | Description |
|------|-------------|
| Home | Hero section, Featured Profiles, Plans, Testimonials |
| Dashboard | Stats, Suggestions, Notifications |
| Profile | Complete profile with photos |
| Search | Filters + Grid/List view |
| Messages | Real-time-like inbox |
| Subscription | Razorpay payment |
| Admin | Full admin panel |

---

## 📄 License

MIT License — Free to use for personal and commercial projects.

---

**Built with ❤️ in India — VivahSetu © 2026**
