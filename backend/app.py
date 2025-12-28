from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
from sqlalchemy import or_
import bcrypt
import secrets
import jwt
from functools import wraps

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

# CORS configuration
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "x-access-token"])

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'appointments.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# JWT Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        # Get token from cookies (alternative method)
        if not token:
            token = request.cookies.get('access_token')
        
        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401
        
        try:
            # Decode the token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user or not current_user.is_active:
                return jsonify({'error': 'Invalid user account'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Refresh token required decorator
def refresh_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        refresh_token = request.cookies.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token is missing'}), 401
        
        try:
            data = jwt.decode(refresh_token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user or not current_user.is_active:
                return jsonify({'error': 'Invalid user account'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Refresh token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid refresh token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship
    appointments = db.relationship('Appointment', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user to dictionary (excluding sensitive data)"""
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'fullName': self.full_name,
            'phone': self.phone,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None,
            'isActive': self.is_active,
            'appointmentCount': len(self.appointments)
        }

# Appointment Model
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
    
    # Foreign key to user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

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
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'userId': self.user_id
        }

# Initialize database
with app.app_context():
    db.create_all()
    
    # Create a default test user if none exists
    if not User.query.first():
        default_user = User(
            email='test@example.com',
            username='testuser',
            full_name='Test User'
        )
        default_user.set_password('password123')
        db.session.add(default_user)
        db.session.commit()

# Helper function to generate tokens
def generate_tokens(user):
    """Generate access and refresh tokens for a user"""
    access_token = jwt.encode({
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    refresh_token = jwt.encode({
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return access_token, refresh_token

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'username', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate email format
    if '@' not in data['email']:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        full_name=data.get('fullName', ''),
        phone=data.get('phone', '')
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token, refresh_token = generate_tokens(user)
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create response
        response = jsonify({
            'message': 'Registration successful',
            'user': user.to_dict(),
            'accessToken': access_token
        })
        
        # Set tokens in cookies (optional, for web clients)
        response.set_cookie('access_token', access_token, 
                           max_age=int(app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()),
                           httponly=True,
                           samesite='Lax')
        response.set_cookie('refresh_token', refresh_token,
                           max_age=int(app.config['JWT_REFRESH_TOKEN_EXPIRES'].total_seconds()),
                           httponly=True,
                           samesite='Lax')
        
        return response, 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400
    
    # Find user by email or username
    user = User.query.filter(
        (User.email == data['email']) | (User.username == data['email'])
    ).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403
    
    # Generate tokens
    access_token, refresh_token = generate_tokens(user)
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create response
    response = jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'accessToken': access_token,
        'refreshToken': refresh_token
    })
    
    # Set tokens in cookies (optional, for web clients)
    response.set_cookie('access_token', access_token, 
                       max_age=int(app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()),
                       httponly=True,
                       samesite='Lax')
    response.set_cookie('refresh_token', refresh_token,
                       max_age=int(app.config['JWT_REFRESH_TOKEN_EXPIRES'].total_seconds()),
                       httponly=True,
                       samesite='Lax')
    
    return response

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    response = jsonify({'message': 'Logout successful'})
    
    # Clear tokens from cookies
    response.set_cookie('access_token', '', expires=0)
    response.set_cookie('refresh_token', '', expires=0)
    
    return response

@app.route('/api/auth/refresh', methods=['POST'])
@refresh_token_required
def refresh_token(current_user):
    """Refresh access token using refresh token"""
    access_token, refresh_token = generate_tokens(current_user)
    
    response = jsonify({
        'message': 'Token refreshed successfully',
        'accessToken': access_token,
        'refreshToken': refresh_token
    })
    
    # Update tokens in cookies
    response.set_cookie('access_token', access_token, 
                       max_age=int(app.config['JWT_ACCESS_TOKEN_EXPIRES'].total_seconds()),
                       httponly=True,
                       samesite='Lax')
    response.set_cookie('refresh_token', refresh_token,
                       max_age=int(app.config['JWT_REFRESH_TOKEN_EXPIRES'].total_seconds()),
                       httponly=True,
                       samesite='Lax')
    
    return response

@app.route('/api/auth/user', methods=['GET'])
@token_required
def get_current_user_info(current_user):
    return jsonify(current_user.to_dict())

@app.route('/api/auth/user', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    data = request.get_json()
    
    # Update allowed fields
    if 'fullName' in data:
        current_user.full_name = data['fullName']
    
    if 'phone' in data:
        current_user.phone = data['phone']
    
    if 'email' in data and data['email'] != current_user.email:
        # Check if new email is available
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already in use'}), 409
        current_user.email = data['email']
    
    if 'username' in data and data['username'] != current_user.username:
        # Check if new username is available
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 409
        current_user.username = data['username']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    
    required_fields = ['currentPassword', 'newPassword']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Verify current password
    if not current_user.check_password(data['currentPassword']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update to new password
    current_user.set_password(data['newPassword'])
    
    try:
        db.session.commit()
        return jsonify({'message': 'Password changed successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password'}), 500

@app.route('/api/auth/verify', methods=['GET'])
def verify_token():
    """Verify if token is valid"""
    token = None
    
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    # Get token from cookies (alternative method)
    if not token:
        token = request.cookies.get('access_token')
    
    if not token:
        return jsonify({'authenticated': False})
    
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        current_user = User.query.get(data['user_id'])
        
        if not current_user or not current_user.is_active:
            return jsonify({'authenticated': False})
        
        return jsonify({
            'authenticated': True,
            'user': current_user.to_dict()
        })
    except:
        return jsonify({'authenticated': False})

# Appointment Routes (with JWT authentication)
@app.route('/api/appointments', methods=['GET'])
@token_required
def get_appointments(current_user):
    # Get query parameters
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Build query - only user's appointments
    query = Appointment.query.filter_by(user_id=current_user.id)
    
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
@token_required
def get_appointment_stats(current_user):
    # Get user's appointment statistics
    total = Appointment.query.filter_by(user_id=current_user.id).count()
    scheduled = Appointment.query.filter_by(user_id=current_user.id, status='scheduled').count()
    cancelled = Appointment.query.filter_by(user_id=current_user.id, status='cancelled').count()
    completed = Appointment.query.filter_by(user_id=current_user.id, status='completed').count()
    
    # Get today's appointments
    today = datetime.now().strftime('%Y-%m-%d')
    today_appointments = Appointment.query.filter_by(
        user_id=current_user.id, 
        date=today, 
        status='scheduled'
    ).count()
    
    return jsonify({
        'total': total,
        'scheduled': scheduled,
        'cancelled': cancelled,
        'completed': completed,
        'today': today_appointments
    })

@app.route('/api/appointments/bulk', methods=['POST'])
@token_required
def bulk_update_appointments(current_user):
    data = request.get_json()
    appointment_ids = data.get('appointmentIds', [])
    action = data.get('action', '')  # 'delete' or 'cancel'
    
    if not appointment_ids:
        return jsonify({'error': 'No appointment IDs provided'}), 400
    
    # Filter by user's appointments only
    appointments = Appointment.query.filter(
        Appointment.id.in_(appointment_ids),
        Appointment.user_id == current_user.id
    ).all()
    
    if not appointments:
        return jsonify({'error': 'No valid appointments found'}), 404
    
    if action == 'delete':
        # Delete appointments
        for appointment in appointments:
            db.session.delete(appointment)
        db.session.commit()
        return jsonify({'message': f'{len(appointments)} appointments deleted successfully'})
    
    elif action == 'cancel':
        # Cancel appointments
        for appointment in appointments:
            appointment.status = 'cancelled'
        db.session.commit()
        return jsonify({'message': f'{len(appointments)} appointments cancelled successfully'})
    
    else:
        return jsonify({'error': 'Invalid action'}), 400

@app.route('/api/appointments', methods=['POST'])
@token_required
def create_appointment(current_user):
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
        user_id=current_user.id,
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
        status='scheduled',
        user_id=current_user.id
    )
    
    try:
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify(appointment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create appointment'}), 500

@app.route('/api/appointments/<int:id>', methods=['PUT'])
@token_required
def update_appointment(current_user, id):
    appointment = Appointment.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
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
    
    try:
        db.session.commit()
        return jsonify(appointment.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update appointment'}), 500

@app.route('/api/appointments/<int:id>', methods=['DELETE'])
@token_required
def delete_appointment(current_user, id):
    appointment = Appointment.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    try:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({'message': 'Appointment deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete appointment'}), 500

@app.route('/api/appointments/<int:id>/cancel', methods=['POST'])
@token_required
def cancel_appointment(current_user, id):
    appointment = Appointment.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    appointment.status = 'cancelled'
    
    try:
        db.session.commit()
        return jsonify(appointment.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to cancel appointment'}), 500

@app.route('/api/appointments/<int:id>/complete', methods=['POST'])
@token_required
def complete_appointment(current_user, id):
    appointment = Appointment.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    appointment.status = 'completed'
    
    try:
        db.session.commit()
        return jsonify(appointment.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to complete appointment'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)