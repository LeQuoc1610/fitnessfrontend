
# GymBro - Mạng xã hội cho cộng đồng Gym

GymBro là một ứng dụng mạng xã hội đầy đủ tính năng được thiết kế dành riêng cho cộng đồng những người yêu thích tập luyện, kết nối và chia sẻ kinh nghiệm gym với nhau.

## 🏋️‍♂️ Tổng quan dự án

Dự án GymBro được xây dựng với kiến trúc client-server hiện đại, bao gồm:
- **Front-end**: React application với giao diện neon-style hiện đại
- **Back-end**: REST API với real-time features qua WebSocket
- **Database**: MongoDB cho lưu trữ dữ liệu người dùng và nội dung

## ✨ Tính năng chính

### 🌐 Social Features
- **Social Feed**: Bài đăng từ cộng đồng gym
- **User Profiles**: Hồ sơ cá nhân với progress tracking
- **Real-time Notifications**: Thông báo instant khi có tương tác
- **Like & Save**: Tương tác với bài đăng
- **Comments**: Bình luận trên các bài đăng

### 🔐 Authentication & Security
- **JWT Authentication**: Đăng nhập/đăng ký an toàn
- **Protected Routes**: Bảo vệ các trang cần authentication
- **Password Hashing**: Mã hóa mật khẩu với bcrypt

### 🎨 User Experience
- **Neon-style Design**: Giao diện hiện đại với gradient và effects
- **Responsive Design**: Tương thích mọi thiết bị
- **Real-time Updates**: Cập nhật real-time qua WebSocket
- **Loading States**: Smooth loading transitions

## 🛠️ Tech Stack

### Front-end
```
React 18 + TypeScript
├── Vite (Build tool)
├── Ant Design (UI Components)
├── TailwindCSS (Styling)
├── React Router (Routing)
├── Axios (HTTP Client)
├── Socket.IO Client (Real-time)
└── Lucide React (Icons)
```

### Back-end
```
Node.js + Express + TypeScript
├── MongoDB + Mongoose (Database)
├── JWT (Authentication)
├── Socket.IO (Real-time)
├── Bcrypt (Password Hashing)
├── Multer (File Uploads)
├── Helmet (Security)
└── Morgan (Logging)
```

## 📁 Cấu trúc dự án

```
gymbro/
├── README.md                 # Documentation chính
├── .gitignore               # Git ignore rules
├── back-end/                # 🚀 API Server
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   │   └── authController.ts
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── upload.ts
│   │   │   └── validation.ts
│   │   ├── models/          # MongoDB models
│   │   │   ├── User.ts
│   │   │   ├── Thread.ts
│   │   │   ├── Workout.ts
│   │   │   └── PR.ts
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts
│   │   │   ├── profiles.ts
│   │   │   ├── threads.ts
│   │   │   ├── workouts.ts
│   │   │   └── prs.ts
│   │   ├── lib/             # Utility functions
│   │   │   └── db.ts        # Database connection
│   │   ├── app.ts           # Express app setup
│   │   ├── socket.ts        # Socket.IO setup
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   ├── .gitignore
│   └── README.md
├── front-end/               # ⚛️ React Application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── common/      # Navbar, LoadingScreen, ErrorBoundary
│   │   │   ├── auth/        # Login/Register forms
│   │   │   ├── profile/     # Profile components
│   │   │   └── threads/     # Social feed components
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── NotificationsPage.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts
│   │   │   └── useNotifications.ts
│   │   ├── context/         # React context providers
│   │   ├── types/           # TypeScript definitions
│   │   ├── utils/           # Utility functions
│   │   ├── lib/             # External library configs
│   │   └── App.tsx          # Main app component
│   ├── package.json
│   ├── .gitignore
│   └── README.md
└── node_modules/            # Dependencies (gitignored)
```

## 🚀 Quick Start

### Yêu cầu
- Node.js 18+
- MongoDB
- Git

### 1. Clone repository
```bash
git clone <repository-url>
cd gymbro
```

### 2. Setup Back-end
```bash
cd back-end
npm install

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với MongoDB URI và JWT secret

npm run dev
# Server chạy tại http://localhost:8080
```

### 3. Setup Front-end
```bash
cd front-end
npm install

# Tạo file .env.local
echo "VITE_API_URL=http://localhost:8080" > .env.local
echo "VITE_SOCKET_URL=http://localhost:8080" >> .env.local

npm run dev
# App chạy tại http://localhost:5173
```

### 4. Truy cập ứng dụng
- **Front-end**: http://localhost:5173
- **Back-end API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/health

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Profiles
- `GET /api/profiles/:uid` - Lấy profile user
- `PUT /api/profiles/me` - Cập nhật profile

### Social Feed
- `GET /api/threads` - Lấy danh sách bài đăng
- `POST /api/threads` - Tạo bài đăng mới
- `POST /api/threads/:id/like` - Like bài đăng
- `POST /api/threads/:id/save` - Lưu bài đăng
- `GET /api/threads/:id/comments` - Lấy comments
- `POST /api/threads/:id/comments` - Thêm comment

### Fitness Tracking
- `GET /api/workouts/me` - Lấy workouts của user
- `POST /api/workouts` - Tạo workout mới
- `GET /api/prs/me` - Lấy personal records
- `POST /api/prs` - Tạo PR mới

## 🎨 Design System

### Theme
- **Primary**: Neon blue gradient
- **Background**: Dark gym-themed gradients
- **Typography**: Modern display fonts
- **Effects**: Neon glow, smooth transitions

### Components
- **Card-neon**: Custom card với neon borders
- **Gym-gradient**: Background gradients
- **Loading screens**: Smooth transitions
- **Error boundaries**: Graceful error handling

## 🔧 Development Scripts

### Back-end
```bash
npm run dev      # Development với hot-reload
npm run build    # Build TypeScript
npm run start    # Production server
npm run seed     # Seed database
```

### Front-end
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # ESLint check
```

## 🌟 Real-time Features

- **Notifications**: Real-time notifications qua Socket.IO
- **Live updates**: Instant feed updates
- **Online status**: User presence tracking
- **Chat messaging** (coming soon)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt encryption
- **CORS Protection**: Cross-origin security
- **Helmet.js**: Security headers
- **Input Validation**: Express-validator

## 📱 Responsive Design

- **Mobile-first**: Optimized cho mobile devices
- **Tablet support**: Adaptive layouts
- **Desktop experience**: Full-featured desktop UI
- **Touch gestures**: Mobile-friendly interactions

## 🚀 Performance Optimizations

### Front-end
- **Code splitting**: Lazy loading routes
- **Component memoization**: React.memo optimization
- **Virtual scrolling** (planned)
- **Image optimization**

### Back-end
- **Database indexing**: Optimized queries
- **Caching strategy** (planned)
- **Compression**: Gzip middleware
- **Rate limiting** (planned)

## 🧪 Testing

```bash
# Front-end tests (khi có)
cd front-end && npm run test

# Back-end tests (khi có)
cd back-end && npm run test

### Build Commands
```bash
# Build front-end
cd front-end && npm run build

# Build back-end
cd back-end && npm run build
```

## 🤝 Contributing Guidelines

1. Fork project
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 👥 Development Team

- **Front-end Developer**: React/TypeScript specialist
- **Back-end Developer**: Node.js/Express specialist
- **UI/UX Designer**: Neon-style design system

## 🎯 Future Features

- [ ] Chat messaging system
- [ ] Workout plans sharing
- [ ] Gym finder integration
- [ ] Video workout tutorials
- [ ] Nutrition tracking
- [ ] Social challenges
- [ ] Mobile app (React Native)

---

**GymBro** - Kết nối đam mê, chinh phục mục tiêu! 💪

Made with ❤️ by the GymBro team
