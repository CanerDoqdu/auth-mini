# auth-mini

A modern, minimalist authentication system built with Next.js, showcasing an artistic **Living Typography** design aesthetic.

## 🎨 About the Project

`auth-mini` is a full-stack authentication solution featuring:

- **User Registration & Login** – Complete signup/login flow with form validation
- **Secure Password Hashing** – bcrypt with 10 salt rounds
- **JWT Authentication** – Token-based auth with 3-day expiration
- **Living Typography UI** – Unique artistic design with glowing text, elegant animations, and minimalist forms
- **MongoDB Integration** – User data persistence with Mongoose
- **TypeScript** – Full type safety across the codebase
- **Performance Optimized** – GPU-accelerated animations, hardware hints, CSS containment

## 🚀 Features

### Authentication System
- POST `/api/signup` – Register new users with validation
- POST `/api/login` – Authenticate and receive JWT token
- Password validation (minimum 6 characters)
- Duplicate email prevention
- HttpOnly secure cookies

### Design Philosophy
- **Minimalist Luxury** – Black (#0a0a0a), white (#f1f1f1), gold (#d4af37)
- **Living Typography** – Titles breathe and glow, creating interactive visual hierarchy
- **Underline Aesthetics** – Form fields use elegant border-bottom design
- **Smooth Animations** – Cubic-bezier timing, staggered reveals, subtle floating

### Pages
- `/` – Landing page with hero section, floating cards, features grid
- `/signup` – Registration form with real-time validation
- `/login` – Authentication form
- `/api/signup`, `/api/login` – API endpoints

## 📋 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (connection string in `.env.local`)

### Installation

```bash
# Clone and install
npm install

# Set up environment
# Create .env.local with:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, CSS3
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB, Mongoose
- **Security:** bcrypt, JWT, HttpOnly cookies
- **Styling:** Custom CSS with performance optimizations

## 📁 Project Structure

```
app/
├── page.tsx              # Landing page
├── login/page.tsx        # Login page
├── signup/page.tsx       # Signup page
├── api/
│   ├── login/route.ts    # Login endpoint
│   ├── signup/route.ts   # Signup endpoint
│   └── session/route.ts  # Session check
├── layout.tsx            # Root layout
└── globals.css           # Global styles

lib/
├── dbConnect.ts          # MongoDB connection

models/
└── User.ts               # User schema & methods
```

## 🎭 Design Highlights

### Typography
- Giant glowing titles (4-7rem) with pulse animations
- Uppercase text with letter-spacing for luxury feel
- Text shadows with gold glow effects

### Interactions
- Smooth fade-in-up animations on page load
- Form labels turn gold on input focus
- Feature cards lift with top-line accent on hover
- Navigation underlines animate from left

### Performance
- `will-change` directives for GPU acceleration
- `backface-visibility: hidden` for smooth transforms
- CSS `contain` property for layout isolation
- Optimized blur filters and low opacity values

## 🔐 Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed and verified server-side
- HttpOnly cookies prevent XSS attacks
- Input validation on signup and login
- Database connection secured via environment variables

## 📝 License

Created February 2026. Open for learning and modification.

## 🚀 Next Steps

- [ ] Profile page implementation
- [ ] Protected routes with middleware
- [ ] OAuth/social login integration
- [ ] Email verification
- [ ] Password reset flow
