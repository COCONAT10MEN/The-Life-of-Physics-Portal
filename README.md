# Learning Management System

A fullstack Learning Management System (LMS) built with Next.js, Prisma, MySQL, and modern frontend technologies. This project enables educators to create, manage, and deliver online courses, while providing students with an interactive and engaging learning experience.

[Live Demo](https://lms.shounoop.vercel.app)

---

## Table of Contents

- [Learning Management System](#learning-management-system)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Database Setup](#database-setup)
    - [Running Locally](#running-locally)
  - [Database Schema](#database-schema)
  - [Folder Structure](#folder-structure)
  - [Contribution](#contribution)
  - [License](#license)
  - [Contact \& Links](#contact--links)

---

## Features

- User authentication and authorization (Clerk)
- Course creation, editing, and management
- Chapter and lesson organization
- Video streaming (Mux integration)
- File uploads and attachments
- Student progress tracking
- Exams, quizzes, and feedback
- Chapter progress and homework submission tracking
- Dashboard analytics
- Responsive, modern UI (Tailwind CSS)

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Radix UI, Clerk Auth
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** MySQL (PlanetScale compatible)
- **Video:** Mux
- **Other:** Zustand, Zod, React Hook Form, UploadThing, LiveKit

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MySQL database (PlanetScale or local)
- [Mux](https://mux.com/) and [Clerk](https://clerk.dev/) accounts for full functionality

### Installation

```bash
git clone https://github.com/shounoop/learning-management-system.git
cd learning-management-system
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the following:

```
DATABASE_URL=your_mysql_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
UPLOADTHING_SECRET=your_uploadthing_secret
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate deploy
```

### Running Locally

```bash
npm run dev
```

---

## Database Schema

![Database Schema](https://github.com/shounoop/learning-management-system/assets/85869774/42c64380-bdf3-40f1-a5b6-07dcb835eb4a)

See [`prisma/schema.prisma`](prisma/schema.prisma) for details.

---

## Folder Structure

```
├── actions/         # Server actions and business logic
├── app/             # Next.js app directory (routes, pages, layouts)
├── components/      # Reusable React components
├── constants/       # App-wide constants
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and libraries
├── prisma/          # Prisma schema and migrations
├── public/          # Static assets (images, icons)
├── scripts/         # Utility scripts
├── types.ts         # TypeScript types
```

---

## Contribution

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

MIT

---

## Contact & Links

- Author: [shounoop](https://github.com/shounoop)
- [Project Repository](https://github.com/shounoop/learning-management-system)
- [Live Demo](https://lms.shounoop.vercel.app)
