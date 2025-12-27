from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# 配置数据库
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'appointments.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 数据模型
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    time = db.Column(db.String(10), nullable=False)  # HH:MM
    duration = db.Column(db.Integer, default=60)  # 分钟
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

# 初始化数据库
with app.app_context():
    db.create_all()

# 路由
@app.route('/')
def index():
    return jsonify({'message': 'Appointment Scheduler API'})

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    appointments = Appointment.query.all()
    return jsonify([appointment.to_dict() for appointment in appointments])

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    
    # 验证必填字段
    required_fields = ['title', 'date', 'time', 'customerName', 'customerEmail']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
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
    
    if 'title' in data:
        appointment.title = data['title']
    if 'description' in data:
        appointment.description = data['description']
    if 'date' in data:
        appointment.date = data['date']
    if 'time' in data:
        appointment.time = data['time']
    if 'duration' in data:
        appointment.duration = data['duration']
    if 'customerName' in data:
        appointment.customer_name = data['customerName']
    if 'customerEmail' in data:
        appointment.customer_email = data['customerEmail']
    if 'status' in data:
        appointment.status = data['status']
    
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)