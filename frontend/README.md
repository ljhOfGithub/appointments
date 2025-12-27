# 📅 Appointment Scheduler

A full-stack web application for managing appointments, built with React frontend and Flask backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+

### 1. Clone and Setup
```bash
git clone https://github.com/ljhOfGithub/appointments.git
cd appointments
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

## 📁 Project Structure
```
appointments/
├── backend/           # Flask API (Python)
├── frontend/          # React UI (JavaScript)
└── README.md
```

## ✨ Features
- Create, edit, delete appointments
- Filter by status (scheduled/cancelled/completed)
- Responsive Material-UI design
- SQLite database

## 🔧 Tech Stack
- **Frontend**: React, Material-UI, Vite
- **Backend**: Flask, SQLAlchemy, SQLite
- **API**: RESTful endpoints

## 📝 API Endpoints
```
GET    /api/appointments      # List all
POST   /api/appointments      # Create new
PUT    /api/appointments/:id  # Update
DELETE /api/appointments/:id  # Delete
POST   /api/appointments/:id/cancel  # Cancel
```

## 🐛 Troubleshooting
- **CORS issues**: Ensure backend is running on port 5000
- **Port conflicts**: Check if ports 3000/5000 are free
- **Database**: `appointments.db` auto-creates on first run

## 📄 License
MIT