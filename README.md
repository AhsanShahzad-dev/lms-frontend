# Full Stack University Portal LMS

A comprehensive, full-stack Learning Management System (LMS) built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** with **SQLite**. This application serves as a centralized, interactive portal for students, teachers, and administrators to manage academic activities, course materials, grading, and university operations.

## 🚀 Features

### 🎓 Student Portal
- **Interactive Dashboard**: View personal profile, currently enrolled courses, and holistic academic progress.
- **Course Management**: Access course materials, lectures, assignments, and read announcements from teachers.
- **Assignment Submission**: Seamlessly submit external links (e.g. Google Drive documents) for assignments.
- **Grade & Attendance Tracking**: Monitor quiz/midterm/final marks, session-by-session attendance, and calculated CGPA.
- **Profile Management**: Update personal information and view secure academic records.

### 👨‍🏫 Teacher Portal
- **Class Management**: View assigned courses and dynamic student rosters sorted by batches.
- **Assignment Creation**: Create assignments with due dates and attach reference materials via URL.
- **Attendance Tracking**: Rapidly mark and manage student attendance by batch.
- **Grade Management**: Record and update student marks (quizzes, mids, finals) via a centralized interface.
- **Announcements**: Post course-related announcements and updates which instantly broadcast to enrolled students.
- **Submission Review**: View and evaluate student assignment submissions efficiently.

### 🛡️ Admin Portal
- **User Management**: Create and manage robust student and teacher accounts, including batch assignment.
- **Course Administration**: Create courses, assign credits, and map teachers to specific courses.
- **Batch Management**: Organize students into batches and manage dynamic enrollments.
- **System Oversight**: Monitor and manage all high-level university operations securely.

## 🛠 Tech Stack

### Core Technologies
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database ORM**: Prisma ORM
- **Database**: SQLite (Zero-config local database `dev.db`)
- **Forms & Validation**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Authentication & Security
- **JWT Authentication**: Built-in Edge-compatible `jose` library for Next.js middleware token verification.
- **Role-Based Access Control (RBAC)**: Secure routing separating `STUDENT`, `TEACHER`, and `ADMIN` roles.
- **Password Hashing**: `bcryptjs` used for secure password storage.

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lms-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Database Setup**
   The project uses Prisma with a local SQLite database. Push the schema and seed the database with mock users:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Base URL for the internal API route (`http://localhost:3000/api`)
- `JWT_SECRET`: Secret key used for signing JSON Web Tokens

### API Configuration
The application is now a full-stack Next.js app. The backend logic is encapsulated within Next.js API Routes (`app/api/...`), removing the need for a separate Java Spring Boot backend proxy.

### Image Domains
The Next.js configuration allows images from:
- `pyxis.nymag.com`
- `gentlemansgazette.com`
- `static.wikia.nocookie.net`
- `swl-cms.comsats.edu.pk:8082`
- `upload.wikimedia.org`

## 🔐 Authentication

### Login Endpoints
The application supports three distinct login flows:

#### Student Login
- **Endpoint**: `/student/login`
- **Required Fields**: `id`, `regNo`, `password`

#### Teacher Login
- **Endpoint**: `/teacher/login`
- **Required Fields**: `id`, `password`

#### Admin Login
- **Endpoint**: `/admin/login`
- **Required Fields**: `id`, `password`

### JWT Token Management
- Tokens are stored in HTTP-only cookies
- Automatic token refresh and validation
- Role-based route protection
- Automatic logout on token expiration

## 📚 API Integration

### Available Endpoints
The application integrates with a comprehensive REST API covering:

- **Student Operations**: Profile, courses, grades, attendance, assignments
- **Teacher Operations**: Course management, attendance, assignments, grading
- **Admin Operations**: User management, course creation, system administration
- **File Management**: Upload and download functionality

For detailed API documentation, refer to `API_ENDPOINTS.md`.

### API Client Features
- Type-safe API calls with TypeScript interfaces
- Automatic error handling and retry logic
- File upload support with progress tracking
- Response caching and optimization

## 🎨 UI/UX Features

### Design System
- **Modern Glass-morphism**: Translucent panels with backdrop blur
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode Support**: Automatic theme detection
- **Smooth Animations**: Framer Motion powered transitions
- **Custom Components**: Reusable UI component library

### Accessibility
- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## 📦 Build & Deployment

### Build Commands
```bash
# Development build
npm run build

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Static Export
```bash
npm run build
npm run export
```

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for Next.js
- Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic

### File Naming
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `apiClient.ts`)
- Pages: kebab-case for routes, PascalCase for components

### State Management
- Zustand for global state
- React Context for theme/auth
- Local state for component-specific data
- Server state via API calls

## 🧪 Testing

### Recommended Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

### Test Coverage Areas
- Component rendering
- API integration
- Authentication flows
- Form validation
- Navigation routing

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure backend allows frontend origin
- Check API proxy configuration
- Verify environment variables

#### Authentication Issues
- Clear browser cookies and localStorage
- Verify JWT token format
- Check backend authentication endpoints

#### Build Errors
- Clear `.next` directory
- Verify TypeScript configuration
- Check for missing dependencies

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 📈 Performance Optimization

### Built-in Optimizations
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Font optimization with next/font
- Bundle analysis capabilities

### Recommended Practices
- Use dynamic imports for large components
- Implement lazy loading for routes
- Optimize images and assets
- Monitor Core Web Vitals

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Commit Guidelines
- Use conventional commit messages
- Include tests for new features
- Update documentation as needed
- Follow code style guidelines

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 📞 Support

For support and questions:
- Review the API documentation in `API_ENDPOINTS.md`
- Check the authentication guide in `Frontend_Auth_Migration_Guide.md`
- Open an issue in the project repository
- Contact the development team

## 🔄 Version History

- **v0.1.0** - Initial release with basic portal functionality
- **v0.2.0** - Added JWT authentication and role-based access
- **v0.3.0** - Enhanced UI with glass-morphism design
- **v0.4.0** - Improved API integration and error handling

---

**Built with ❤️ as a personal project**
