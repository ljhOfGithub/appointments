# Appointment Scheduling System with User Authentication

## Overview
A full-stack web-based appointment scheduling system built with React.js (frontend) and Python Flask (backend). This application provides a responsive interface for managing appointments with complete user authentication and authorization.

## Tech Stack

### Backend
- **Framework**: Python Flask 2.3.3
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Session-based with bcrypt password hashing
- **CORS**: Flask-CORS with credentials support
- **Port**: 5000

### Frontend
- **Framework**: React.js with Vite
- **UI Library**: Material-UI (MUI) 5.x
- **Date Picker**: MUI X Date Pickers
- **HTTP Client**: Axios with interceptors
- **Development Server**: Vite (Port: 3000)
- **State Management**: React Hooks

## Project Structure

```
appointment-system/
├── backend/
│   ├── app.py                 # Flask main application with authentication
│   ├── requirements.txt       # Python dependencies
│   └── appointments.db        # SQLite database (auto-generated)
│
└── frontend/
    ├── src/
    │   ├── api.js            # Axios instance with interceptors
    │   ├── components/
    │   │   ├── DesktopApp.jsx      # Desktop-specific layout
    │   │   ├── MobileApp.jsx       # Mobile-specific layout
    │   │   ├── auth/               # Authentication components
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── user/               # User management
    │   │   │   └── Profile.jsx
    │   │   └── common/             # Shared components
    │   │       ├── AppointmentForm.jsx
    │   │       ├── AppointmentCard.jsx
    │   │       └── StatsPanel.jsx
    │   ├── App.jsx           # Main router with auth logic
    │   ├── main.jsx          # Entry point
    │   └── index.css         # Global styles
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## Features

### User Authentication & Management
- User registration with email and username validation
- Secure login with bcrypt password hashing
- User profile management (update email, username, phone)
- Password change functionality with current password verification
- Session-based authentication with 24-hour lifetime
- Demo account for testing (test@example.com / password123)

### Core Appointment Management
- Create, read, update, and delete appointments
- Appointment status management (scheduled, completed, cancelled)
- Time slot conflict detection
- Bulk operations (delete/cancel multiple appointments)
- Data export to CSV format

### Search & Filtering
- Text search by title, customer name, email, or description
- Filter by appointment status (scheduled, completed, cancelled)
- Date range filtering
- Real-time search with debouncing
- Clear filters functionality

### Data Visualization & Statistics
- Real-time statistics dashboard
- Status distribution with progress bars
- Today's appointments summary
- Upcoming appointments (next 7 days)
- Appointment count by user

### Responsive Design
- **Desktop**: Screen width ≥ 900px
  - Fixed sidebar with statistics and filters
  - Dual view modes (table and card)
  - Advanced filtering options
  - Export and print functionality

- **Mobile**: Screen width < 900px
  - Bottom navigation (Appointments, Statistics, Calendar)
  - Swipeable filter drawer
  - Floating action button for quick creation
  - Hamburger menu with user options
  - Touch-optimized interface

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- CORS configuration with credentials support
- Input validation on both client and server
- Error handling and user feedback
- User-specific data isolation

## Installation & Setup

### Prerequisites
- Node.js v16 or higher
- Python 3.8 or higher
- npm or yarn package manager

### Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```

The backend will start on `http://localhost:5000` and create:
- A SQLite database (appointments.db)
- Default test user (test@example.com / password123)

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000` with hot-reload enabled.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user info
- `PUT /api/auth/user` - Update user profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/session` - Check session status

### Appointments
- `GET /api/appointments` - Get user's appointments (with filters)
- `GET /api/appointments/stats` - Get appointment statistics
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `POST /api/appointments/bulk` - Bulk operations
- `POST /api/appointments/:id/cancel` - Cancel appointment
- `POST /api/appointments/:id/complete` - Mark as completed

## Data Models

### User Model
```python
{
  "id": Integer,
  "email": String (unique, required),
  "username": String (unique, required),
  "password_hash": String (required),
  "full_name": String,
  "phone": String,
  "created_at": DateTime,
  "last_login": DateTime,
  "is_active": Boolean (default: True)
}
```

### Appointment Model
```python
{
  "id": Integer,
  "title": String (required),
  "description": String,
  "date": String (YYYY-MM-DD, required),
  "time": String (HH:MM, required),
  "duration": Integer (minutes, default: 60),
  "customer_name": String (required),
  "customer_email": String (required),
  "status": String ('scheduled', 'cancelled', 'completed'),
  "created_at": DateTime,
  "user_id": Integer (foreign key to User)
}
```

## Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
python app.py        # Start Flask development server
```

## Configuration

### Backend Configuration
- Database: SQLite with file-based storage
- Session: File-based with 24-hour expiration
- CORS: Configured for localhost:3000 with credentials
- Debug: Enabled for development

### Frontend Configuration
- Development proxy to backend API (http://localhost:5000)
- Auto-chunking for optimized builds
- Source maps enabled for debugging
- Material-UI theme customization

## Usage Guide

### First Time Setup
1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Use demo credentials or register a new account
4. Start creating and managing appointments

### Creating an Appointment
1. Click "New Appointment" button (desktop) or FAB (mobile)
2. Fill in required fields: Title, Date, Time, Customer Name, Email
3. Add optional description and duration
4. Submit the form

### Managing Appointments
- **Edit**: Click edit icon on any appointment
- **Delete**: Click delete icon (confirmation required)
- **Cancel**: For scheduled appointments, use cancel button
- **Complete**: Mark scheduled appointments as completed
- **Bulk Actions**: Select multiple appointments for batch operations

### User Profile Management
1. Click user avatar in top-right corner
2. Select "Profile" from dropdown menu
3. Update personal information
4. Change password if needed

## Development Notes

### Adding New Features
1. For desktop-specific features, modify `DesktopApp.jsx`
2. For mobile-specific features, modify `MobileApp.jsx`
3. For shared features, add components to `common/` directory
4. For authentication features, use existing auth patterns

### API Integration Pattern
- Use `api.js` instance for all HTTP requests
- All API calls include error handling
- Session cookies are automatically handled
- Use interceptors for global error handling

### Styling Guidelines
- Use MUI's sx prop for component-specific styles
- Global styles in `index.css`
- Responsive breakpoints: xs:0, sm:600, md:900, lg:1200, xl:1536
- Follow Material Design principles

## Testing

### Default Test Account
- Email: test@example.com
- Username: testuser
- Password: password123

### Manual Testing Features
1. User registration and login
2. Appointment CRUD operations
3. Filtering and searching
4. Bulk operations
5. Profile management
6. Password change
7. Responsive design testing

## Troubleshooting

### Common Issues

1. **Authentication Required Error**
   - Ensure backend CORS is configured correctly
   - Check that `withCredentials: true` is set in axios
   - Verify session configuration in Flask

2. **Database Issues**
   - Delete `appointments.db` and restart backend
   - Check SQLite file permissions
   - Verify database models are properly defined

3. **CORS Errors**
   - Ensure frontend is running on `localhost:3000`
   - Check backend CORS configuration
   - Verify credentials are being sent

4. **Development Server Issues**
   - Clear browser cache
   - Restart both backend and frontend servers
   - Check console for errors

## Security Considerations

### Implemented Security Measures
- Password hashing with bcrypt
- Session-based authentication
- Input validation on both client and server
- SQL injection prevention via SQLAlchemy
- XSS protection through React's built-in escaping
- CORS configuration with specific origins

### Recommended Production Improvements
- Use environment variables for secrets
- Implement HTTPS
- Add rate limiting
- Use a production database (PostgreSQL/MySQL)
- Add logging and monitoring
- Implement CSRF protection
- Regular security audits

## License
This project is developed as part of a technical interview task for demonstration purposes. The code is provided as-is for educational and evaluation purposes.

## Support
For issues or questions related to this implementation:
1. Check the troubleshooting section
2. Review the code comments and documentation
3. Ensure all prerequisites are met
4. Verify backend and frontend are running correctly

## Future Enhancements
Potential areas for future development:
1. Email notifications for appointments
2. Calendar integration
3. Recurring appointments
4. File attachments
5. Multi-language support
6. Advanced reporting
7. API documentation (Swagger/OpenAPI)
8. Unit and integration tests
9. Docker containerization
10. Deployment scripts

---

*Note: This is a demonstration project showcasing full-stack development skills with React, Flask, and user authentication.*