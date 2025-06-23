# Empower Safety Network

A Next.js application for personal safety with MongoDB backend integration.

## Features
- User registration and authentication
- Emergency contact management
- Safety resources and self-defense tips
- SOS functionality
- Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack
- **Frontend:** Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **Authentication:** bcryptjs for password hashing
- **UI Components:** shadcn/ui

## Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd empower-safety-network
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/empower-safety

# For MongoDB Atlas, use format like:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/empower-safety?retryWrites=true&w=majority
```

### 3. Database Setup
**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- The database will be created automatically when you first register a user

**Option B: MongoDB Atlas**
- Create a MongoDB Atlas account
- Create a new cluster
- Get your connection string
- Replace the `MONGODB_URI` in `.env.local`

### 4. Run the Application
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```
The application will be available at [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Request/Response Examples

**Register User**
```http
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "123-456-7890",
  "password": "password123"
}
```

**Login User**
```http
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## Project Structure
```
src/
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts    # Registration API
│   │   └── login/route.ts       # Login API
│   ├── login/page.tsx           # Login page
│   └── register/page.tsx        # Registration page
├── lib/
│   ├── mongodb.ts               # Database connection
│   └── models/User.ts           # User model
└── contexts/AuthContext.tsx     # Updated auth context
```

## Development

### Adding New API Routes
- Create a new file in `src/app/api/`
- Export HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- Use the MongoDB connection utility

### Database Models
- All models are in `src/lib/models/` and use Mongoose schemas.

## Security Features
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS protection
- Environment variable protection

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.
