# Appointment Scheduling System

## Overview
A full-stack web-based appointment scheduling system built with React.js (frontend) and Python Flask (backend). This application provides a responsive interface for managing appointments across desktop and mobile devices.

## Tech Stack

### Backend
- **Framework**: Python Flask
- **Database**: SQLite with SQLAlchemy ORM
- **CORS**: Flask-CORS for cross-origin requests
- **Port**: 5000

### Frontend
- **Framework**: React.js with Vite
- **UI Library**: Material-UI (MUI)
- **Date Picker**: MUI X Date Pickers
- **HTTP Client**: Axios
- **Development Server**: Vite (Port: 3000)

## Project Structure

```
appointment-system/
├── backend/
│   ├── app.py              # Flask main application
│   ├── requirements.txt    # Python dependencies
│   └── appointments.db     # SQLite database (auto-generated)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DesktopApp.jsx      # Desktop-specific layout
    │   │   ├── MobileApp.jsx       # Mobile-specific layout
    │   │   └── common/             # Shared components
    │   │       ├── AppointmentForm.jsx
    │   │       ├── AppointmentCard.jsx
    │   │       └── StatsPanel.jsx
    │   ├── App.jsx         # Main router (auto-switches desktop/mobile)
    │   ├── main.jsx        # Entry point
    │   └── index.css       # Global styles
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## Features

### Core Functionality
- Create, read, update, and delete appointments
- Search appointments by title, customer name, email, or description
- Filter by status (scheduled, completed, cancelled)
- Date range filtering
- Bulk operations (delete/cancel multiple appointments)

### Desktop Features
- Fixed sidebar with statistics and filters
- Dual view modes (table view and card view)
- Advanced filtering options
- Pagination with customizable items per page
- CSV export functionality
- Bulk selection and operations

### Mobile Features
- Bottom navigation (Appointments, Statistics, Calendar)
- Swipeable filter drawer
- Floating action button for quick creation
- Touch-optimized interface
- Hamburger menu with user options
- Card-based appointment display

### Shared Features
- Real-time statistics dashboard
- Form validation with error handling
- Toast notifications for user feedback
- Responsive design that adapts to screen size
- Print and export capabilities

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- npm or yarn package manager

### Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

### Appointments
- `GET /api/appointments` - Get all appointments (with optional filters)
- `GET /api/appointments/stats` - Get appointment statistics
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment
- `POST /api/appointments/bulk` - Bulk operations (delete/cancel)

### Appointment Actions
- `POST /api/appointments/:id/cancel` - Cancel an appointment
- `POST /api/appointments/:id/complete` - Mark as completed

## Data Model

### Appointment Schema
```python
{
  "id": Integer,
  "title": String (required),
  "description": String,
  "date": String (YYYY-MM-DD, required),
  "time": String (HH:MM, required),
  "duration": Integer (minutes, default: 60),
  "customerName": String (required),
  "customerEmail": String (required),
  "status": String ('scheduled', 'cancelled', 'completed'),
  "createdAt": DateTime
}
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `python app.py` - Start Flask server at http://localhost:5000

## Responsive Design

The application automatically switches between desktop and mobile layouts based on screen width:

- **Desktop**: Screen width ≥ 900px
- **Mobile**: Screen width < 900px

### Desktop Layout
- Fixed sidebar with statistics and filters
- Main content area with table/card view
- Top navigation bar
- Advanced filtering options

### Mobile Layout
- Bottom navigation bar
- Swipeable drawers for filters and menu
- Floating action button
- Card-based content display

## Configuration

### Backend Configuration
- Database: SQLite with file-based storage
- CORS enabled for development
- Debug mode enabled for development

### Frontend Configuration
- Development proxy to backend API
- Auto-chunking for optimized builds
- Source maps enabled for debugging

## Usage

### Creating an Appointment
1. Click the "New Appointment" button (desktop) or FAB (mobile)
2. Fill in the required fields: Title, Date, Time, Customer Name, and Email
3. Add optional description and duration
4. Submit the form

### Managing Appointments
- **Edit**: Click the edit icon on any appointment
- **Delete**: Click the delete icon (confirmation required)
- **Cancel**: For scheduled appointments, use the cancel button
- **Complete**: Mark scheduled appointments as completed

### Filtering and Searching
- Use the search bar to find appointments by text
- Apply status filters using the filter chips or dropdown
- Set date ranges for targeted searches
- Use the clear filters button to reset all filters

## Development Notes

### Adding New Features
1. For desktop-specific features, modify `DesktopApp.jsx`
2. For mobile-specific features, modify `MobileApp.jsx`
3. For shared features, add components to the `common/` directory

### Styling
- Use MUI's sx prop for component-specific styles
- Global styles are in `index.css`
- Responsive breakpoints are defined in the theme

### API Integration
- All API calls use Axios with error handling
- API URL is configured in `API_URL` constant
- Requests include proper error handling and user feedback

## License
This project is for demonstration purposes as part of a technical interview task.

## Support
For issues or questions related to this implementation, please refer to the code structure and comments provided.