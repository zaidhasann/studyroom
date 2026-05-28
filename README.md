# 📚 Collaborative Study Room Platform

A production-ready full-stack web application that enables students to create focused virtual study rooms, collaborate in real-time, track sessions, and communicate seamlessly.

**Live Demo:** [Coming Soon]  
**Frontend:** [Deploy on Vercel]  
**Backend:** [Deploy on Render]  

---

## 🎯 Features

### 🔐 **Authentication**
- User registration and login with JWT
- Secure password hashing with bcrypt
- Protected routes and persistent authentication
- Profile management

### 🎓 **Study Rooms**
- Create and manage study rooms
- Invite friends via unique room codes
- Join multiple rooms
- View room participants in real-time
- Room descriptions and settings

### 💬 **Real-time Communication**
- Live chat with Socket.IO
- Instant message delivery
- Typing indicators
- User presence indicators
- Message timestamps

### ⏱️ **Session Tracking**
- Start, pause, resume, and end study sessions
- Real-time session timer
- Track study duration
- View session history
- Automatic study time accumulation

### 📊 **Dashboard & Analytics**
- Personal productivity dashboard
- Total study hours tracked
- Sessions completed counter
- Active rooms overview
- Weekly productivity stats
- Activity history

### 🎨 **Modern UI**
- Responsive design (mobile, tablet, desktop)
- Clean and minimal interface
- Tailwind CSS styling
- Smooth transitions and animations
- Toast notifications
- Loading states and error handling

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite 5.0
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Real-time:** Socket.IO Client
- **HTTP Client:** Axios
- **Charts:** Chart.js & React ChartJS 2

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.18
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcryptjs
- **Real-time:** Socket.IO 4.7
- **Validation:** Express Validator
- **CORS:** Enabled for Vercel/Render deployment

### Database
- **MongoDB Atlas** (Cloud)
- Collections: Users, Rooms, Messages, Sessions

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account (for database)
- Git

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd studyroom
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/study-room-db
# JWT_SECRET=your_secret_key_here
# CLIENT_URL=http://localhost:5173
# PORT=5000

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables:
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 📁 Project Structure

```
studyroom/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth & error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── sockets/         # Socket.IO handlers
│   ├── utils/           # Helper functions
│   ├── server.js        # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── context/     # Context API (Auth, Socket)
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API & Socket services
│   │   ├── styles/      # Global CSS
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List all rooms |
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms/:id` | Get room details |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |
| POST | `/api/rooms/join-room` | Join room by code |
| POST | `/api/rooms/:id/leave` | Leave room |
| GET | `/api/rooms/user/my-rooms` | Get user's rooms |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/start` | Start session |
| POST | `/api/sessions/pause` | Pause session |
| POST | `/api/sessions/resume` | Resume session |
| POST | `/api/sessions/end` | End session |
| GET | `/api/sessions/history/:roomId` | Get session history |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:roomId` | Get room messages |
| POST | `/api/messages` | Send message |
| DELETE | `/api/messages/:id` | Delete message |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get user statistics |
| GET | `/api/dashboard/activity` | Get user activity |

---

## 🔌 Socket.IO Events

### Room Events
- `join-room` - User joins a room
- `leave-room` - User leaves a room
- `user-joined` - Broadcasted when user joins
- `user-left` - Broadcasted when user leaves

### Message Events
- `send-message` - Send a message
- `new-message` - Receive a message

### Session Events
- `session-started` - Session started
- `session-paused` - Session paused
- `session-resumed` - Session resumed
- `session-ended` - Session ended
- `timer-update` - Timer tick update

### Typing Events
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing

---

## 📊 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  joinedRooms: [Room],
  totalStudyTime: Number (minutes),
  createdAt: Date
}
```

### Room
```javascript
{
  roomName: String,
  roomCode: String (unique),
  createdBy: User,
  participants: [User],
  activeSession: Session,
  description: String,
  isActive: Boolean
}
```

### Message
```javascript
{
  roomId: Room,
  sender: User,
  senderName: String,
  message: String,
  createdAt: Date
}
```

### Session
```javascript
{
  roomId: Room,
  startedBy: User,
  participants: [{
    userId: User,
    joinedAt: Date,
    leftAt: Date
  }],
  startTime: Date,
  endTime: Date,
  duration: Number (minutes),
  isPaused: Boolean
}
```

---

## 🌍 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/study-room-db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📱 Pages & Components

### Pages
- **Landing** - Hero, features showcase, CTA
- **Login** - User authentication
- **Register** - Account creation
- **Dashboard** - Statistics, room management
- **Room** - Study room with chat, timer, participants
- **Profile** - User profile settings

### Components
- **Navbar** - Navigation bar
- **ChatBox** - Real-time chat interface
- **SessionTimer** - Study session timer
- **SessionControls** - Play, pause, end controls
- **Toast** - Notification system
- **ProtectedRoute** - Route protection wrapper

---

## 🚀 Deployment

### Deploy Backend on Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Deploy Frontend on Vercel

1. Import frontend folder from GitHub
2. Set environment variables
3. Deploy

### MongoDB Atlas Setup

1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update MONGO_URI in backend .env

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ SQL injection prevention (using Mongoose)
- ✅ Environment variable protection
- ✅ Protected API routes
- ✅ Socket.IO authentication

---

## 📈 Future Enhancements

- [ ] Pomodoro timer mode
- [ ] Dark mode toggle
- [ ] Online/offline indicators
- [ ] Emoji reactions on messages
- [ ] Room activity feed
- [ ] Study streaks tracking
- [ ] Leaderboard system
- [ ] Focus mode (distraction-free)
- [ ] File sharing in rooms
- [ ] Screen sharing
- [ ] Video calls integration
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI in .env
- Verify IP whitelist on MongoDB Atlas
- Ensure database user credentials are correct

### Socket.IO Connection Failed
- Verify CORS configuration
- Check if Socket.IO URL is correct
- Ensure backend is running

### Frontend Not Loading
- Clear browser cache
- Verify VITE_API_URL is correct
- Check console for errors

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 💬 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

## ✨ Acknowledgments

- Built with modern technologies
- Inspired by productivity apps
- Community-driven development

---

**Happy studying! 🎓📚**
