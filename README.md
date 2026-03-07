# CollabNotes

A collaborative note-taking app built with the MERN stack. You can create notes, share them with others, and edit them together. Built this as part of a technical assessment.

## What it does

- Register and log in with JWT authentication
- Create, edit and delete notes using a rich text editor
- Search through your notes by title or content
- Filter between all notes, your own notes, and notes shared with you
- Add collaborators to your notes by their email
- Mobile responsive

## Stack

- **Frontend** — React + Vite, Tailwind CSS, React Router, Axios
- **Backend** — Node.js, Express
- **Database** — MongoDB (Atlas or Local) with Mongoose
- **Auth** — JWT + bcrypt
- **Editor** — react-quill-new

## Getting Started

You'll need these installed:

- Node.js (v18+)
- Git

---

### 1. Clone the repo
```bash
git clone https://github.com/tharihaaS/collaborative-notes-app.git
cd collaborative-notes-app
```

### 2. Set up the backend
```bash
cd server
npm install
cp .env.example .env
```

Open the `.env` file and fill in your values depending on which database option you choose below.

To generate a JWT secret quickly:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Choose Your Database

**Option A — MongoDB Atlas (recommended)**

No installation needed. The connection string will be provided in the submission email. Add it to your `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notesapp?appName=<appname>
JWT_SECRET=your_jwt_secret_here
```

**Option B — Local MongoDB**

Install MongoDB Community Server from https://www.mongodb.com/try/download/community then start it:

Windows:
```bash
net start MongoDB
```

Mac:
```bash
brew services start mongodb-community
```

Linux:
```bash
sudo systemctl start mongod
```

Then use this in your `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/notesapp
JWT_SECRET=your_jwt_secret_here
```

### 4. Start the backend
```bash
npm run dev
```

If you see `MongoDB connected` and `Server running on port 5000` you're all set.

### 5. Set up the frontend

Open a new terminal:
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

### 6. Open the app

Go to **http://localhost:5173** in your browser.

## Checking the database

**Atlas** — Log in to https://cloud.mongodb.com and go to your cluster → Collections tab to browse the data. You can also connect via MongoDB Compass using the Atlas URI.

**Local** — Open MongoDB Compass and connect to `mongodb://localhost:27017`. You'll see a database called `notesapp` with `users` and `notes` collections.

## Environment variables

`PORT` - Port for the backend server  
`MONGO_URI` - MongoDB connection string (Atlas or local)  
`JWT_SECRET` - Used to sign and verify JWT tokens  

There's a `.env.example` in the server folder showing the format.

## Project layout

The `server/` folder has all the backend code — models, routes, and middleware.
The `client/src/pages/` folder has all the React pages.
Config is handled through a `.env` file in the server folder.

## API routes

**Auth**
```
POST /api/auth/register
POST /api/auth/login
```

**Notes**
```
GET    /api/notes
GET    /api/notes?search=keyword
GET    /api/notes/:id
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
POST   /api/notes/:id/collaborators
DELETE /api/notes/:id/collaborators/:userId
```

## Assumptions made

- Collaborators are added by exact email match so the person needs to have an account first
- Only the note owner can delete a note or manage collaborators
- Collaborators can view and edit notes shared with them
- Passwords need to be 8-32 characters with at least one uppercase, lowercase, number and special character
- Used `--legacy-peer-deps` during install because react-quill-new has a peer dependency conflict with React 19