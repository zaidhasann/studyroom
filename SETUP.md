# Local Development Setup Guide

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MongoDB** (local or Atlas) - [Download Local](https://www.mongodb.com/try/download/community) or [Cloud Atlas](https://www.mongodb.com/cloud/atlas)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Verify Installation

```bash
node --version    # Should be v16+
npm --version     # Should be v7+
git --version     # Should be installed
```

---

## Step 1: Clone Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd studyroom

# Check the structure
ls -la
# Should see: backend/, frontend/, README.md, DEPLOYMENT.md, etc.
```

---

## Step 2: MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (Free tier)
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for local dev)
5. Get connection string
6. You'll have: `mongodb+srv://username:password@cluster.mongodb.net/study-room-db?retryWrites=true&w=majority`

### Option B: MongoDB Local

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb

# Windows
# Download and run installer from https://www.mongodb.com/try/download/community
```

Local connection string:
```
mongodb://localhost:27017/study-room-db
```

---

## Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/study-room-db
JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
EOF

# Replace the values with yours:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: Generate a random string (min 32 chars)
# Example: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Verify Backend Setup

```bash
# Check if all dependencies are installed
ls node_modules | head -5

# Test if server starts
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster.mongodb.net
Socket.IO server ready at http://localhost:5000
```

Press `Ctrl+C` to stop the server.

---

## Step 4: Frontend Setup

```bash
# Navigate to frontend directory (from root, not backend)
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
EOF
```

### Verify Frontend Setup

```bash
# Check dependencies
ls node_modules | head -5

# Test if dev server starts
npm run dev
```

You should see:
```
  VITE v5.x.x build 123 for development
  Local:      http://localhost:5173/
  ready in 456ms
```

---

## Step 5: Run Both Servers

### Terminal 1 - Backend

```bash
cd backend
npm run dev
# Keep this running
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# Keep this running
```

### Open in Browser

Visit: `http://localhost:5173`

---

## Testing the Application

### 1. Create Account

1. Click "Sign Up"
2. Enter name, email, password
3. Click "Create Account"

### 2. Create a Study Room

1. Go to Dashboard
2. Fill in "Room Name"
3. Click "Create Room"
4. Copy the room code

### 3. Test Chat

1. Open two browser windows/tabs
2. In first: Create a room and join
3. In second: Register and join the same room (using room code)
4. Send messages - should appear in real-time

### 4. Test Session Timer

1. Click "Start Session" in room
2. Timer should start counting
3. Try "Pause" and "Resume"
4. Click "End Session"
5. Check Dashboard - study time should be updated

### 5. Check Dashboard

1. View statistics (total study time, sessions, rooms)
2. See your rooms listed
3. Check if all data persists

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
# macOS: brew services list
# Ubuntu: sudo systemctl status mongodb
# Windows: Check Services

# Check MONGO_URI format
# Should start with: mongodb+srv:// or mongodb://
# Should end with: database name at the end
```

### Issue: "EADDRINUSE: address already in use :::5000"

**Solution:**
```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Or find what's using port (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "Cannot GET /" in browser

**Solution:**
- Make sure frontend `npm run dev` is running
- Check if you're visiting `http://localhost:5173`
- Check browser console for specific errors

### Issue: "Socket connection failed"

**Solution:**
- Make sure backend is running
- Check VITE_SOCKET_URL in frontend .env
- Check browser Network tab in DevTools
- Verify CORS is enabled on backend

### Issue: "JWT token error"

**Solution:**
- Clear browser localStorage: Right-click > Inspect > Application > Clear Storage
- Log out and log in again
- Check if JWT_SECRET is the same on backend

---

## Development Workflow

### Making Changes

**Frontend:**
```bash
cd frontend
# Edit files in src/
# Changes auto-reload at http://localhost:5173
```

**Backend:**
```bash
cd backend
# Edit files in models/, routes/, controllers/, etc.
# Server auto-reloads with nodemon
```

### Debugging

**Backend Debugging:**
```bash
# In VS Code, add breakpoints
# Run: npm run dev
# Breakpoints will pause execution
```

**Frontend Debugging:**
- Open DevTools (F12 or Right-click > Inspect)
- Use Console tab to see errors
- Use Network tab to inspect API calls
- Use React DevTools browser extension

### Database Inspection

**MongoDB Atlas:**
1. Go to Collections
2. Browse documents
3. Add/edit/delete data

**Local MongoDB:**
```bash
# Open MongoDB shell
mongosh

# Select database
use study-room-db

# View collections
show collections

# Query users
db.users.find()

# Query rooms
db.rooms.find()
```

---

## Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes to files

# Stage changes
git add .

# Commit with message
git commit -m "Add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## Performance Tips

### Frontend
- Use DevTools Performance tab
- Check bundle size: `npm run build` then check `dist/`
- Use React DevTools Profiler

### Backend
- Monitor MongoDB connection
- Use `node --inspect` for profiling
- Check response times in logs

---

## Code Quality

### ESLint (Optional Setup)
```bash
# Frontend
cd frontend
npm install --save-dev eslint eslint-plugin-react

# Backend  
cd backend
npm install --save-dev eslint
```

### Format Code
```bash
# Prettier (optional)
npm install --save-dev prettier
```

---

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
# Creates optimized build in dist/
```

### Backend Production
```bash
cd backend
NODE_ENV=production npm start
# Uses production settings
```

---

## Environment Variables Summary

### Backend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| MONGO_URI | Database connection | mongodb+srv://user:pass@... |
| JWT_SECRET | Token signing key | aRandomString32CharsLong |
| CLIENT_URL | Frontend URL (for CORS) | http://localhost:5173 |
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |

### Frontend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000 |
| VITE_SOCKET_URL | Socket.IO URL | http://localhost:5000 |

---

## Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Docs](https://expressjs.com/en/api.html)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev/)
- [Socket.IO Docs](https://socket.io/docs/)

---

## Next Steps

✅ Local development running  
→ Make code changes  
→ Test features  
→ Deploy to Vercel/Render (see DEPLOYMENT.md)  

---

Need help? Check [README.md](./README.md) for more info!
