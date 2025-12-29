# GymBro Front-end

Front-end application cho GymBro - mạng xã hội dành cho cộng đồng gym.

## 🛠️ Tech Stack

- **React 18** với TypeScript
- **Vite** cho development và build
- **Ant Design** cho UI components
- **TailwindCSS** cho styling
- **React Router** cho routing
- **Axios** cho API calls
- **Socket.IO Client** cho real-time communication

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Tạo file `.env.local`:
```env
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

### 3. Run development server
```bash
npm run dev
```

Application sẽ chạy tại `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Common components (Navbar, LoadingScreen, etc.)
│   ├── auth/           # Authentication components
│   ├── profile/        # Profile related components
│   └── threads/        # Thread/social components
├── pages/              # Page components
│   ├── HomePage.tsx    # Home feed
│   ├── AuthPage.tsx    # Login/Register
│   ├── ProfilePage.tsx # User profile
│   └── NotificationsPage.tsx # Notifications
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   ├── useSocket.ts    # Socket.IO connection
│   └── useNotifications.ts # Notification management
├── context/            # React context providers
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── lib/                # External library configurations
└── App.tsx             # Main app component
```

## 🎨 UI Components

### Design System
- **Neon-style theme** với gradient backgrounds
- **Dark theme** chủ đạo
- **Responsive design** cho mobile và desktop
- **Ant Design components** tùy chỉnh với TailwindCSS

### Key Components
- `Navbar` - Navigation bar với user menu
- `LoadingScreen` - Loading states
- `ErrorBoundary` - Error handling
- `ThreadCard` - Social post cards
- `UserProfile` - User profile display

## 🔧 Available Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview production build
- `npm run lint` - ESLint check

## 🌐 API Integration

Front-end kết nối với back-end API qua:
- **REST API** cho các operations thông thường
- **WebSocket** cho real-time features (notifications, chat)

### API Endpoints chính
- Authentication: `/api/auth/*`
- Profiles: `/api/profiles/*`
- Threads: `/api/threads/*`
- Workouts: `/api/workouts/*`
- PRs: `/api/prs/*`

## 🔄 State Management

Sử dụng:
- **React Context** cho global state (auth, theme)
- **Custom hooks** cho business logic
- **Local state** cho component-specific data

## 📱 Responsive Design

- **Mobile-first approach**
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🔐 Authentication

JWT-based authentication với:
- Auto-refresh tokens
- Protected routes
- Role-based access control

## 🚨 Error Handling

- **Error Boundaries** cho React errors
- **Global error handler** cho API errors
- **User-friendly error messages**

## 🎯 Features

- **Social Feed** - Bài đăng từ cộng đồng
- **User Profiles** - Hồ sơ cá nhân với progress tracking
- **Real-time Notifications** - Thông báo instant
- **Workout Tracking** - Ghi lại buổi tập
- **PR Records** - Personal records tracking
- **Messaging** - Chat real-time (coming soon)

## 🧪 Testing

```bash
# Run tests (khi có)
npm run test

# Run test coverage
npm run test:coverage
```

## 📦 Build Optimization

- **Code splitting** theo routes
- **Lazy loading** cho components
- **Tree shaking** cho unused code
- **Image optimization**

## 🔍 Performance

- **React.memo** cho component optimization
- **useMemo/useCallback** cho expensive operations
- **Virtual scrolling** cho large lists (khi cần)

## 🚀 Deployment

### Build cho production
```bash
npm run build
```

### Deploy
- Build files sẽ nằm trong `/dist`
- Có thể deploy lên Vercel, Netlify, hoặc bất kỳ static hosting nào

## 🤝 Contributing

1. Fork project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License
