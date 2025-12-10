# NodeCRUD Frontend

A modern, production-grade React frontend for the NodeCRUD REST API. Built with Vite, React 19, Bootstrap, and modern best practices.

## 🌟 Features

### 🔐 Authentication
- **JWT Authentication** - Secure token-based auth with auto-refresh
- **Protected Routes** - Route guards for authenticated pages
- **Role-Based Access** - Admin, Moderator, User roles
- **Persistent Sessions** - localStorage token management

### 📊 Dashboard
- Real-time system health monitoring
- Memory usage statistics
- API status indicators
- Quick action cards

### 👥 User Management (Admin Only)
- Paginated user list with search & filters
- Create, Edit, Delete users
- Soft delete with restore capability
- Avatar upload support
- Role assignment

### 👤 Profile Management
- View and edit profile information
- Avatar upload with preview
- Account status display

### ⚙️ Settings
- Change password with validation
- Security recommendations

### 🎨 UI/UX
- Beautiful dark theme with gradients
- Responsive design (mobile-friendly)
- Toast notifications
- Loading states & spinners
- Smooth animations
- Custom scrollbars

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   │   ├── DeleteModal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── PublicRoute.jsx
│   │   ├── layout/           # Layout components
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── Navbar.jsx
│   │   └── users/            # User-specific components
│   │       └── UserModal.jsx
│   ├── config/
│   │   └── constants.js      # App constants & config
│   ├── context/
│   │   └── AuthContext.jsx   # Auth state management
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── profile/
│   │   │   └── ProfilePage.jsx
│   │   ├── settings/
│   │   │   └── SettingsPage.jsx
│   │   └── users/
│   │       └── UsersPage.jsx
│   ├── services/             # API services
│   │   ├── api.js            # Axios instance with interceptors
│   │   ├── auth.service.js   # Auth API calls
│   │   └── user.service.js   # User CRUD API calls
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **Vite** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Bootstrap 5** | CSS framework |
| **React Bootstrap** | Bootstrap components |
| **Axios** | HTTP client |
| **React Query** | Server state management |
| **React Hot Toast** | Toast notifications |
| **Lucide React** | Icon library |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 3000

### Installation

1. **Navigate to client folder**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔧 Configuration

### API Proxy

The Vite dev server is configured to proxy `/api` requests to the backend:

```javascript
// vite.config.js
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### Environment Variables

Create a `.env` file for custom configuration:

```env
VITE_API_URL=http://localhost:3000
```

## 📱 Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login Page | Public |
| `/register` | Register Page | Public |
| `/dashboard` | Dashboard | Authenticated |
| `/profile` | User Profile | Authenticated |
| `/settings` | Settings | Authenticated |
| `/users` | User Management | Admin Only |

## 🎨 Theming

The app uses a custom dark theme with CSS variables:

```css
:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --dark: #1a1a2e;
  --darker: #0f0f23;
}
```

### Customization

Modify `src/index.css` to customize:
- Color palette
- Component styles
- Animations
- Responsive breakpoints

## 🔐 Authentication Flow

1. **Login/Register** → Receive access & refresh tokens
2. **Store tokens** → localStorage
3. **API requests** → Axios interceptor adds Bearer token
4. **Token expired** → Auto-refresh using refresh token
5. **Refresh failed** → Redirect to login

### Token Storage

```javascript
// Tokens stored in localStorage
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

## 📝 API Services

### Auth Service

```javascript
import authService from './services/auth.service';

// Register
await authService.register({ name, email, password, confirmPassword });

// Login
await authService.login({ email, password });

// Logout
await authService.logout();

// Get current user
await authService.getCurrentUser();

// Change password
await authService.changePassword({ currentPassword, newPassword, confirmNewPassword });
```

### User Service

```javascript
import userService from './services/user.service';

// Get all users (paginated)
await userService.getAll({ page: 1, limit: 10, sort: '-createdAt' });

// Get user by ID
await userService.getById(userId);

// Create user
await userService.create(userData);

// Update user
await userService.update(userId, updateData);

// Delete user (soft)
await userService.delete(userId);

// Restore user
await userService.restore(userId);

// Update avatar
await userService.updateAvatar(userId, file);

// Search users
await userService.search(query);
```

## 🧩 Components

### Protected Route

```jsx
<ProtectedRoute roles={['admin']}>
  <AdminPage />
</ProtectedRoute>
```

### Loading Spinner

```jsx
<LoadingSpinner fullScreen />
<LoadingSpinner size="sm" text="Loading..." />
```

### Delete Modal

```jsx
<DeleteModal
  show={showModal}
  onHide={() => setShowModal(false)}
  onConfirm={handleDelete}
  title="Delete User"
  message="Are you sure?"
/>
```

## 📦 Build for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

The build output will be in the `dist/` folder.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.
