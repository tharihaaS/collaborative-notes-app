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
- **Database** — MongoDB (local) with Mongoose
- **Auth** — JWT + bcrypt
- **Editor** — react-quill-new



## Getting Started

You'll need these installed on your machine:

- Node.js (v18+)
- MongoDB Community Server
- MongoDB Compass (if you want to browse the data visually)

---

### 1. Clone the repo
```bash
git clone https://github.com/tharihaaS/collaborative-notes-app.git
cd collaborative-notes-app
```

### 2. Get MongoDB running

The app uses a local MongoDB instance. Start it before running the server.

**Windows**
```bash
net start MongoDB
```

**Mac**
```bash
brew services start mongodb-community
```

**Linux**
```bash
sudo systemctl start mongod
```

If you have MongoDB Compass, just open it and connect to `mongodb://localhost:27017`, if it connects, you're good to go.

### 3. Set up the backend
 ``` bash
cd server
npm install
cp .env.example .env
```

Open the `.env` file and fill in your values:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/notesapp
JWT_SECRET=put_a_long_random_string_here
```

To generate a JWT secret quickly:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then start the server:
```bash
npm run dev
```

If you see `MongoDB connected` and `Server running on port 5000` you're all set.

### 4. Set up the frontend

Open a new terminal:
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

### 5. Open the app

Go to **http://localhost:5173** in your browser.


## Checking the database

If you want to see what's stored, open MongoDB Compass and connect to:
```
mongodb://localhost:27017
```

After you register and create some notes you'll see a database called `notesapp` with two collections — `users` and `notes`.


## Environment variables

Variable and What it's for

`PORT` - Port for the backend server 
`MONGO_URI` - MongoDB connection string
`JWT_SECRET` -  Used to sign and verify JWT tokens.

There's a `.env.example` in the server folder showing the format.

## Project layout

The `server/` folder has all the backend code — models, routes, and middleware. 
The `client/src/pages/` folder has all the React pages. 
Config is handled through a `.env` file in the server folder.

## API routes

**Auth**
POST /api/auth/register
POST /api/auth/login


**Notes**

GET    /api/notes
GET    /api/notes?search=keyword
GET    /api/notes/:id
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
POST   /api/notes/:id/collaborators
DELETE /api/notes/:id/collaborators/:userId


## Assumptions made

- Collaborators are added by exact email match so the person needs to have an account first
- Only the note owner can delete a note or manage collaborators
- Collaborators can view and edit notes shared with them
- Passwords need to be 8-32 characters with at least one uppercase, lowercase, number and special character
- Used `--legacy-peer-deps` during install because react-quill-new has a peer dependency conflict with React 19
