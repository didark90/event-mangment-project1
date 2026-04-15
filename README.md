# EventHub — Event Management Platform

A full-stack event management platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **shadcn/ui**, **Prisma ORM** (SQLite), and **NextAuth.js**. Users can register, create events, browse events, manage their dashboard, and contact support — all with a polished dark/light mode UI.

---

## Features

- **Authentication** — Register / Login with email & password (bcrypt hashed, JWT sessions)
- **Events CRUD** — Create, Read, Update, and Delete events with ownership checks
- **Dashboard** — Stats overview, upcoming/past events, category breakdown with animated charts
- **Search & Filter** — Real-time search by title, location, description + category filter
- **Contact Form** — Send messages to admin with field validation
- **Dark / Light Mode** — Toggle or follow system preference (emerald green theme)
- **Responsive Design** — Mobile-first layout with hamburger menu on small screens
- **Smooth Animations** — Framer Motion page transitions, animated charts, icon spin

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite via Prisma ORM |
| Authentication | NextAuth.js v4 (Credentials + JWT) |
| State Management | Zustand (client routing) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Date Formatting | date-fns |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts      # POST — User registration
│   │   │   └── [...nextauth]/route.ts # POST — Login / Logout / Session
│   │   ├── events/
│   │   │   ├── route.ts               # GET (list) / POST (create)
│   │   │   └── [id]/route.ts          # GET / PUT / DELETE single event
│   │   └── contact/route.ts           # POST (send) / GET (list messages)
│   ├── globals.css                    # Theme variables (light + dark)
│   ├── layout.tsx                     # Root layout with ThemeProvider
│   └── page.tsx                       # Main entry — client-side view router
├── components/
│   ├── ui/                            # shadcn/ui component library (20+)
│   ├── theme-provider.tsx             # next-themes wrapper
│   ├── theme-toggle.tsx               # Sun/Moon animated toggle
│   ├── navbar.tsx                     # Responsive header with auth + theme
│   ├── footer.tsx                     # Sticky footer with links
│   ├── home-view.tsx                  # Landing page (hero, stats, features)
│   ├── auth-view.tsx                  # Login / Register tabbed forms
│   ├── dashboard-view.tsx             # User dashboard with stats
│   ├── events-view.tsx                # Events CRUD with search/filter/dialogs
│   └── contact-view.tsx               # Contact form + info cards
├── lib/
│   ├── auth.ts                        # NextAuth configuration
│   ├── db.ts                          # Prisma client singleton
│   └── utils.ts                       # Tailwind merge utility
├── store/
│   └── app-store.ts                   # Zustand store (view routing)
├── types/
│   └── next-auth.d.ts                 # NextAuth type augmentation
└── hooks/
    ├── use-toast.ts                   # Toast notification hook
    └── use-mobile.ts                  # Mobile detection hook

prisma/
└── schema.prisma                      # Database schema (User, Event, ContactMessage)

db/
└── custom.db                          # SQLite database file
```

---

## Getting Started

1 - This is for localhost 

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- A terminal / command prompt

### 0. Install Bun (Required)
This project is optimized for Bun runtime, so you must install it.
```bash
curl -fsSL https://bun.sh/install | bash
```
Then restart your terminal and verify:

```bash
bun --version
```
### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd eventhub
```

### 2. Install Dependencies

```bash
bun install
# or: npm install
```

### 3. Set Up Environment Variables

The `.env` file is already created with defaults. Verify its contents:

```env
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

> **Tip:** Replace `NEXTAUTH_SECRET` with a random string for production. You can generate one with:
> ```bash
> openssl rand -base64 32
> ```

### 4. Initialize the Database

```bash
bun run db:push
```

This creates the SQLite database and all tables (User, Event, ContactMessage) from `prisma/schema.prisma`.

### 5. Start the Development Server

```bash
bun run dev
```

The app will be available at **http://localhost:3000**.

---

This is for docker images run :

1. Build Docker Image
```bash
docker-compose build
```

2. Build Docker Image
   
```bash
docker-compose up -d
```
3. Build Docker Image
   
```bash
docker-compose build

```
5. Access the App
```bash
http://localhost:3000
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 3000) |
| `bun run lint` | Run ESLint to check code quality |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:migrate` | Run Prisma migrations |
| `bun run db:reset` | Reset database (drops all data) |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/[...nextauth]` | Login with credentials | No |
| `GET` | `/api/auth/session` | Get current session | No |

### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| `GET` | `/api/events` | List all events (supports `?userId=` and `?category=` filters) | No |
| `POST` | `/api/events` | Create a new event | Yes |
| `GET` | `/api/events/:id` | Get a single event by ID | No |
| `PUT` | `/api/events/:id` | Update an event (owner only) | Yes (owner) |
| `DELETE` | `/api/events/:id` | Delete an event (owner only) | Yes (owner) |

### Contact

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| `POST` | `/api/contact` | Submit a contact message | No |
| `GET` | `/api/contact` | List all contact messages | No |

---

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Primary key |
| `name` | String | Full name |
| `email` | String (unique) | Email address |
| `password` | String | Bcrypt hashed password |
| `role` | String | User role (default: "user") |
| `createdAt` | DateTime | Account creation date |
| `updatedAt` | DateTime | Last update date |

### Events Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Primary key |
| `title` | String | Event title |
| `description` | String | Event description |
| `date` | DateTime | Event date & time |
| `location` | String | Event location |
| `category` | String | Category (conference, workshop, meetup, etc.) |
| `status` | String | Status (upcoming, past) |
| `userId` | String | Foreign key to User |
| `createdAt` | DateTime | Creation date |
| `updatedAt` | DateTime | Last update date |

### ContactMessages Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (cuid) | Primary key |
| `name` | String | Sender name |
| `email` | String | Sender email |
| `subject` | String | Message subject |
| `message` | String | Message content |
| `isRead` | Boolean | Whether admin has read it |
| `createdAt` | DateTime | Sent date |
| `updatedAt` | DateTime | Last update date |

---

## Pages Overview

| Page | Description |
|------|-------------|
| **Home** | Landing page with hero section, statistics, feature cards, and call-to-action |
| **Login / Register** | Tabbed authentication forms with validation and error handling |
| **Dashboard** | Stats cards, upcoming events list, category breakdown with animated bars |
| **Events** | Browse, search, filter, create, edit, view details, and delete events |
| **Contact** | Contact information cards and message submission form |

---

## How to Use

1. **Register** — Click "Get Started" in the navbar, then fill in the registration form
2. **Login** — Enter your email and password on the Sign In tab
3. **Create Event** — Go to Events page and click "Create Event" button
4. **Manage Events** — View, edit, or delete your own events from the Events page
5. **Dashboard** — See stats, upcoming events, and category breakdown
6. **Contact** — Fill out the contact form to send a message to support
7. **Toggle Theme** — Click the sun/moon icon in the navbar to switch dark/light mode

---

## License

This project is for educational purposes. Built with Next.js, Tailwind CSS, and shadcn/ui.
