from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
from sqlalchemy import or_

app = Flask(__name__)
CORS(app)

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'appointments.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Data model
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    time = db.Column(db.String(10), nullable=False)  # HH:MM
    duration = db.Column(db.Integer, default=60)  # minutes
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, cancelled, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date,
            'time': self.time,
            'duration': self.duration,
            'customerName': self.customer_name,
            'customerEmail': self.customer_email,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

# Initialize database
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    return jsonify({'message': 'Appointment Scheduler API'})

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    # Get query parameters
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Build query
    query = Appointment.query
    
    # Apply search filter
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            or_(
                Appointment.title.ilike(search_term),
                Appointment.customer_name.ilike(search_term),
                Appointment.customer_email.ilike(search_term),
                Appointment.description.ilike(search_term)
            )
        )
    
    # Apply status filter
    if status and status != 'all':
        query = query.filter(Appointment.status == status)
    
    # Apply date range filter
    if start_date:
        query = query.filter(Appointment.date >= start_date)
    if end_date:
        query = query.filter(Appointment.date <= end_date)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    appointments = query.order_by(Appointment.date.desc(), Appointment.time.desc())\
                       .offset((page - 1) * per_page)\
                       .limit(per_page)\
                       .all()
    
    return jsonify({
        'appointments': [appointment.to_dict() for appointment in appointments],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@app.route('/api/appointments/stats', methods=['GET'])
def get_appointment_stats():
    # Get appointment statistics
    total = Appointment.query.count()
    scheduled = Appointment.query.filter_by(status='scheduled').count()
    cancelled = Appointment.query.filter_by(status='cancelled').count()
    completed = Appointment.query.filter_by(status='completed').count()
    
    # Get today's appointments
    today = datetime.now().strftime('%Y-%m-%d')
    today_appointments = Appointment.query.filter_by(date=today, status='scheduled').count()
    
    return jsonify({
        'total': total,
        'scheduled': scheduled,
        'cancelled': cancelled,
        'completed': completed,
        'today': today_appointments
    })

@app.route('/api/appointments/bulk', methods=['POST'])
def bulk_update_appointments():
    data = request.get_json()
    appointment_ids = data.get('appointmentIds', [])
    action = data.get('action', '')  # 'delete' or 'cancel'
    
    if not appointment_ids:
        return jsonify({'error': 'No appointment IDs provided'}), 400
    
    if action == 'delete':
        # Delete appointments
        deleted_count = Appointment.query.filter(Appointment.id.in_(appointment_ids)).delete()
        db.session.commit()
        return jsonify({'message': f'{deleted_count} appointments deleted successfully'})
    
    elif action == 'cancel':
        # Cancel appointments
        appointments = Appointment.query.filter(Appointment.id.in_(appointment_ids)).all()
        for appointment in appointments:
            appointment.status = 'cancelled'
        db.session.commit()
        return jsonify({'message': f'{len(appointments)} appointments cancelled successfully'})
    
    else:
        return jsonify({'error': 'Invalid action'}), 400

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'date', 'time', 'customerName', 'customerEmail']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate email format
    if '@' not in data['customerEmail']:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check for time conflicts (optional feature)
    existing_appointment = Appointment.query.filter_by(
        date=data['date'],
        time=data['time'],
        status='scheduled'
    ).first()
    
    if existing_appointment:
        return jsonify({'error': 'Time slot already booked'}), 409
    
    appointment = Appointment(
        title=data['title'],
        description=data.get('description', ''),
        date=data['date'],
        time=data['time'],
        duration=data.get('duration', 60),
        customer_name=data['customerName'],
        customer_email=data['customerEmail'],
        status='scheduled'
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 201

@app.route('/api/appointments/<int:id>', methods=['PUT'])
def update_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    data = request.get_json()
    
    # Validate email if provided
    if 'customerEmail' in data and '@' not in data['customerEmail']:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Update fields
    update_fields = ['title', 'description', 'date', 'time', 'duration', 'customerName', 'customerEmail', 'status']
    for field in update_fields:
        if field in data:
            if field == 'customerName':
                appointment.customer_name = data[field]
            elif field == 'customerEmail':
                appointment.customer_email = data[field]
            else:
                setattr(appointment, field, data[field])
    
    db.session.commit()
    return jsonify(appointment.to_dict())

@app.route('/api/appointments/<int:id>', methods=['DELETE'])
def delete_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    db.session.delete(appointment)
    db.session.commit()
    return jsonify({'message': 'Appointment deleted successfully'})

@app.route('/api/appointments/<int:id>/cancel', methods=['POST'])
def cancel_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    appointment.status = 'cancelled'
    db.session.commit()
    return jsonify(appointment.to_dict())

@app.route('/api/appointments/<int:id>/complete', methods=['POST'])
def complete_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    appointment.status = 'completed'
    db.session.commit()
    return jsonify(appointment.to_dict())

if __name__ == '__main__':
    app.run(debug=True, port=5000)