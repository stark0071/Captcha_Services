# 🔐 Secure Login with CAPTCHA System

A full-stack web application that features a secure login system with built-in CAPTCHA verification to stop bots in their tracks. This project uses a modern React + Express stack with Drizzle ORM and security best practices.

[➡ View on GitHub](https://github.com/stark0071/Captcha_Services/tree/main/SecureCaptcha)

---

## 🌐 Overview

This app demonstrates how to build a secure login system that protects against automated login attempts using server-generated CAPTCHA images. It's built with:

- 🖥️ **React (TypeScript)** for the frontend using **Shadcn UI** components  
- 🚀 **Express.js (TypeScript)** for the backend  
- 🧠 **Drizzle ORM** for managing the database  
- 🔐 CAPTCHA protection using server-side image generation

---

## 🧱 System Architecture

### Frontend

- **Framework**: React with TypeScript  
- **UI Components**: [Shadcn UI](https://ui.shadcn.com) (based on Radix UI)  
- **Styling**: Tailwind CSS  
- **Form State**: React Hook Form  
- **Data Fetching**: React Query  
- **Routing**: Wouter

🧩 The frontend follows a component-based structure:
- **Feature Components**: Handle business logic (e.g. `LoginForm`)
- **UI Components**: Reusable, styled components (Shadcn-style)

### Backend

- **Framework**: Express.js with TypeScript  
- **API**: RESTful API endpoints  
- **Session Management**: `express-session` with in-memory store  
- **CAPTCHA Generation**: Custom CAPTCHA using the `canvas` package

📁 The backend is modularly organized:
- Auth routes
- CAPTCHA session tracking
- CAPTCHA generation & verification logic

### Database

- **ORM**: Drizzle ORM  
- **Schema Definition**: Shared in `shared/schema.ts`  
- **Validation**: Zod for runtime type checking and data validation

Schema includes:
- ✅ User accounts  
- 🧠 CAPTCHA sessions

---

## 🧩 Key Components

### Frontend Components

- `LoginForm`: Handles input of user credentials and CAPTCHA
- `CaptchaDisplay`: Shows CAPTCHA image and supports refresh
- UI elements from the Shadcn UI kit

### Backend Components

- `server/index.ts`: Express server entry point
- `server/routes.ts`: Defines API routes
- `server/storage.ts`: Handles DB interaction
- `server/captcha.ts`: CAPTCHA image generation and validation logic

### Shared Code

- `shared/schema.ts`: Database schema and Zod validation schemas

---

## 🔁 Data Flow

### Login Flow

1. User visits the login page  
2. Backend generates a CAPTCHA and starts a session  
3. CAPTCHA image and form are shown to the user  
4. User submits credentials + CAPTCHA answer  
5. Backend checks the credentials and CAPTCHA  
6. ✅ If valid: user is logged in and redirected  
   ❌ If invalid: error message is shown

### CAPTCHA Verification

- CAPTCHA text is generated and rendered as an image  
- Stored securely in both session and database  
- User input is checked against stored CAPTCHA  
- Tracks verification attempts to prevent abuse

---

## 📦 External Dependencies

### Frontend

- `@radix-ui/*`: UI primitives  
- `@tanstack/react-query`: Data fetching  
- `@hookform/resolvers`: Form + Zod integration  
- `class-variance-authority`, `clsx`: Styling helpers  
- `wouter`: Lightweight React router

### Backend

- `express`: Web framework  
- `canvas`: CAPTCHA image rendering  
- `@neondatabase/serverless`: PostgreSQL connection  
- `drizzle-orm`, `drizzle-zod`: ORM + validation

---

## 🚀 Deployment Strategy

The project is built to work well on [Replit](https://replit.com/) and can also be deployed elsewhere.

### 🛠 Development

```bash
npm run dev

Uses tsx to run TypeScript directly without a separate build step.

📦 Production
Frontend: Built with Vite into static assets
Backend: Bundled using ESBuild
Output is placed in the dist directory for deployment
🔧 Runtime Config
Environment variables expected:

env
Copy code
DATABASE_URL=your_postgres_url
SESSION_SECRET=your_session_secret
🗃️ Database Migration
Handled by Drizzle:

bash
Copy code
npm run db:push
Pushes your schema to the database.

▶️ Usage Example
To try it locally:

Clone the repo:

bash
Copy code
git clone https://github.com/stark0071/Captcha_Services.git
cd Captcha_Services/SecureCaptcha
Install dependencies:

bash
Copy code
npm install
Set up environment variables:
Create a .env file with:

env
Copy code
DATABASE_URL=your_postgres_url
SESSION_SECRET=your_session_secret
Run the app:

bash
Copy code
npm run dev
Open http://localhost:3000 in your browser and test the login with CAPTCHA!

🤝 Contributing
Contributions are welcome! 🙌

To contribute:

Fork this repo
Create a branch: git checkout -b my-feature
Make your changes
Commit and push:
bash
Copy code
git commit -m "Add my feature"
git push origin my-feature
Open a Pull Request
Check the Issues page for ideas on what to work on.

📄 License
This project is open-source and available under the MIT License.

Made with 💻 + ☕ by developers who care about secure, accessible, and user-friendly authentication systems.


Let me know if you'd like GitHub badges (e.g. last commit, license, issues) added to the top or if you’re preparing this for a public release and want a project logo or GIF demo included!
2025-06-03 20:36:10

Copy
You
how to download it

2025-06-03 20:37:31


YesChatREADME Generator
To download the project from your GitHub repository (stark0071/Captcha_Services), you have a few options depending on your preferred workflow.

🧰 Option 1: Download as ZIP (No Git Required)
Go to the repo:

👉 https://github.com/stark0071/Captcha_Services

Navigate to the SecureCaptcha folder if you only need that part.

Click the green <> Code button (top right of the repo listing).

Choose “Download ZIP”.

Extract the ZIP on your computer.

🧑‍💻 Option 2: Clone Using Git (Recommended for Development)
If you have Git installed:

bash
Copy code
git clone https://github.com/stark0071/Captcha_Services.git
cd Captcha_Services/SecureCaptcha
This gives you the full project, and you can easily pull updates or contribute.

📦 Next Steps After Download
Once you have the project files:

Install dependencies:

bash
Copy code
npm install
Set up environment variables:

Create a .env file in the SecureCaptcha folder:

env
Copy code
DATABASE_URL=your_postgres_url
SESSION_SECRET=your_session_secret
Run the app in development mode:

bash
Copy code
npm run dev
Visit http://localhost:3000 in your browser.

