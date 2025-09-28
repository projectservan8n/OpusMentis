# StudyFlow AI - AI-Powered Study Assistant

Transform your study materials into interactive summaries, flashcards, and kanban boards with AI-powered processing.

## 🚀 Features

### MVP Features ✅
- **Authentication & User Management** - Clerk-powered auth with Google login
- **File Upload & Processing** - Support for PDFs, audio, video, and images
- **AI-Powered Content Generation** - OpenAI integration for summaries, flashcards, and study plans
- **Interactive Study Tools**:
  - AI-generated summaries with key topics
  - Drag-and-drop Kanban boards for learning progress
  - Interactive flashcards with Q&A mode
  - Personal note-taking system
- **PDF Export** - Export complete study packs to PDF
- **Subscription Management** - Free, Pro, and Premium tiers with usage limits
- **Admin Panel** - User management and analytics dashboard
- **Responsive Design** - Works on desktop and mobile

### Subscription Tiers
- **Free**: 3 uploads/month, PDFs ≤ 10 pages, Audio/Video ≤ 10 minutes
- **Pro (₱149/mo)**: Unlimited uploads, PDFs ≤ 50 pages, Audio/Video ≤ 1 hour, PDF export
- **Premium (₱399/mo)**: PDFs ≤ 200 pages, Audio/Video ≤ 3 hours, Team sharing

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
- **Authentication**: Clerk (with Google OAuth)
- **Database**: PostgreSQL via Prisma ORM
- **AI Services**: OpenAI (Whisper for transcription, GPT for content generation)
- **File Processing**: pdf-parse, Tesseract.js, fluent-ffmpeg
- **PDF Generation**: pdf-lib
- **Payment Processing**: Stripe (via Clerk subscriptions)
- **Deployment**: Railway (one-click deploy)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Clerk account (free tier available)
- OpenAI API key
- Stripe account (for payments)

### 1. Clone Repository
```bash
git clone <repository-url>
cd studyflow-ai
npm install
```

### 2. Environment Setup
Copy the environment variables from `.env.example`:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

### 4. Development
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔧 Configuration Guide

### Clerk Setup
1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure OAuth providers (Google recommended)
3. Set up webhooks for user management:
   - Endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Copy your publishable and secret keys to `.env`

### Stripe Setup (Optional for MVP)
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Set up products for Pro (₱149/mo) and Premium (₱399/mo) plans
3. Configure webhooks for subscription events
4. Copy your secret key to `.env`

### OpenAI Setup
1. Get an API key from [OpenAI](https://platform.openai.com)
2. Ensure you have access to:
   - Whisper API (for audio/video transcription)
   - GPT-4 or GPT-3.5-turbo (for content generation)
3. Add your API key to `.env`

## 🚀 Railway Deployment

### One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

### Manual Deploy
1. Connect your GitHub repository to Railway
2. Set up environment variables in Railway dashboard
3. Deploy automatically triggers on push to main branch

### Required Environment Variables on Railway
```
DATABASE_URL (automatically provided by Railway Postgres)
CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
OPENAI_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Railway Setup Steps
1. Create a new project on Railway
2. Add a PostgreSQL database service
3. Connect your GitHub repository
4. Set environment variables
5. Deploy!

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── study-packs/       # Study pack viewer
│   ├── upload/            # File upload interface
│   ├── billing/           # Subscription management
│   ├── settings/          # User settings
│   └── admin/             # Admin panel
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── kanban-board.tsx   # Kanban functionality
│   ├── flashcards.tsx     # Flashcard system
│   └── notes.tsx          # Note-taking
├── lib/                   # Utility libraries
│   ├── db.ts              # Database client
│   ├── ai.ts              # OpenAI integration
│   ├── subscriptions.ts   # Plan management
│   └── file-processing.ts # File handling
└── middleware.ts          # Clerk middleware
```

## 🔌 API Endpoints

### Study Packs
- `POST /api/upload` - Upload and process files
- `GET /api/study-packs` - List user's study packs
- `GET /api/study-packs/[id]` - Get study pack details
- `PATCH /api/study-packs/[id]` - Update study pack
- `DELETE /api/study-packs/[id]` - Delete study pack
- `POST /api/study-packs/[id]/export` - Export to PDF

### Notes
- `GET /api/study-packs/[id]/notes` - Get notes for study pack
- `POST /api/study-packs/[id]/notes` - Create new note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user events
- `POST /api/webhooks/stripe` - Stripe payment events

## 🎯 Usage Guide

### For Students
1. **Sign up** with email or Google account
2. **Upload** your study materials (PDFs, audio recordings, etc.)
3. **Wait** for AI processing (1-3 minutes)
4. **Study** with generated summaries, flashcards, and kanban boards
5. **Take notes** and track your progress
6. **Export** everything to PDF for offline study

### For Administrators
1. Access the admin panel at `/admin`
2. Monitor user activity and system health
3. Manage user accounts and subscriptions
4. Export user data and analytics

## 🐛 Troubleshooting

### Common Issues

**File Upload Fails**
- Check file size limits for your plan
- Ensure file type is supported (PDF, audio, video, images)
- Verify OpenAI API key is valid

**AI Processing Stuck**
- Check OpenAI API quota and limits
- Verify network connectivity
- Check application logs for errors

**Authentication Issues**
- Verify Clerk configuration
- Check environment variables
- Ensure webhook endpoints are accessible

**Database Errors**
- Check DATABASE_URL connection string
- Verify database is running and accessible
- Run database migrations if needed

### Getting Help
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Join our [Discord Community](https://discord.gg/studyflow)
- Email support: support@studyflow.ai

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing patterns and conventions
- Add comments for complex logic
- Write tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) for authentication
- [OpenAI](https://openai.com) for AI capabilities
- [Railway](https://railway.app) for hosting
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [Vercel](https://vercel.com) for Next.js

## 📊 Roadmap

### Stretch Features (Post-MVP)
- [ ] Team collaboration and sharing
- [ ] Advanced analytics and progress tracking
- [ ] Mobile app (React Native)
- [ ] Integration with learning management systems
- [ ] Multi-language support
- [ ] Voice interaction and commands
- [ ] Advanced AI tuning and customization
- [ ] Bulk upload and processing
- [ ] API access for third-party integrations

---

**Built with ❤️ for students everywhere**

For questions or support, reach out to us at [support@studyflow.ai](mailto:support@studyflow.ai)