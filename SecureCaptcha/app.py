from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
import os
import random
import string
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import json
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import psycopg2

app = Flask(__name__)
app.secret_key = 'captcha-demo-secret-key'

# Database setup
db_url = os.environ.get('DATABASE_URL', '')
if not db_url:
    raise ValueError("DATABASE_URL environment variable is required")
engine = create_engine(db_url)
Base = declarative_base()
Session = sessionmaker(bind=engine)

# Database models
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    captcha_sessions = relationship("CaptchaSession", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(username='{self.username}')>"

class CaptchaSession(Base):
    __tablename__ = 'captcha_sessions'
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(32), unique=True, nullable=False)
    captcha_text = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    attempts = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    user = relationship("User", back_populates="captcha_sessions")
    
    def __repr__(self):
        return f"<CaptchaSession(session_id='{self.session_id}', verified={self.verified})>"

# Create tables
Base.metadata.create_all(engine)

# Initialize demo user if not exists
def init_demo_user():
    db_session = Session()
    user = db_session.query(User).filter_by(username='demo').first()
    if not user:
        demo_user = User(username='demo', password='password123')
        db_session.add(demo_user)
        db_session.commit()
        print("Demo user created: username='demo', password='password123'")
    db_session.close()

# Initialize database
init_demo_user()

def generate_captcha_text(length=5):
    """Generate random captcha text"""
    chars = string.ascii_uppercase + string.digits
    # Remove confusing characters
    chars = chars.replace('0', '').replace('O', '').replace('1', '').replace('I', '')
    return ''.join(random.choice(chars) for _ in range(length))

def generate_captcha_image(text):
    """Generate a captcha image"""
    width, height = 200, 70
    image = Image.new('RGB', (width, height), color=(245, 245, 245))
    draw = ImageDraw.Draw(image)
    
    # Try to use a font file, or fallback to default
    try:
        # For Linux/macOS
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
    except IOError:
        try:
            # For Windows
            font = ImageFont.truetype("arial.ttf", 36)
        except IOError:
            # Fallback to default
            font = ImageFont.load_default()
    
    # Draw text with some distortion
    text_width = font.getbbox(text)[2]
    x = (width - text_width) // 2
    y = (height - 36) // 2
    
    # Add background noise
    for i in range(5):
        x1 = random.randint(0, width)
        y1 = random.randint(0, height)
        x2 = random.randint(0, width)
        y2 = random.randint(0, height)
        draw.line([(x1, y1), (x2, y2)], fill=(200, 200, 200), width=1)
    
    # Draw each character with slight rotation and position variation
    for i, char in enumerate(text):
        char_x = x + i * 30 + random.randint(-5, 5)
        char_y = y + random.randint(-5, 5)
        draw.text((char_x, char_y), char, font=font, fill=(0, 0, 100))
    
    # Convert to base64
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

@app.route('/')
def index():
    """Main page with login form"""
    # If user is already logged in, redirect to success page
    if 'username' in session and 'user_id' in session:
        return redirect(url_for('success'))
    return render_template('index.html')

@app.route('/api/captcha', methods=['GET'])
def get_captcha():
    """Generate and return new captcha"""
    captcha_text = generate_captcha_text()
    captcha_image = generate_captcha_image(captcha_text)
    
    # Generate a unique session ID
    session_id = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(32))
    
    # Store in database
    db_session = Session()
    captcha_session = CaptchaSession(
        session_id=session_id,
        captcha_text=captcha_text,
        attempts=0,
        verified=False
    )
    db_session.add(captcha_session)
    db_session.commit()
    db_session.close()
    
    # Store session ID in browser session
    session['captcha_session_id'] = session_id
    
    return jsonify({
        'image': captcha_image
    })

@app.route('/api/login', methods=['POST'])
def login():
    """Handle login with captcha verification"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    captcha_input = data.get('captchaInput', '').strip()
    
    # Verify captcha
    session_id = session.get('captcha_session_id')
    if not session_id:
        return jsonify({
            'success': False,
            'message': 'CAPTCHA session expired. Please refresh and try again.'
        }), 400
    
    db_session = Session()
    captcha_session = db_session.query(CaptchaSession).filter_by(session_id=session_id).first()
    
    if not captcha_session:
        db_session.close()
        return jsonify({
            'success': False,
            'message': 'CAPTCHA session expired. Please refresh and try again.'
        }), 400
    
    # Update attempts
    captcha_session.attempts += 1
    db_session.commit()
    
    # Too many attempts
    if captcha_session.attempts >= 5:
        db_session.delete(captcha_session)
        db_session.commit()
        db_session.close()
        session.pop('captcha_session_id', None)
        return jsonify({
            'success': False,
            'message': 'Too many attempts. Please refresh the CAPTCHA.'
        }), 400
    
    # Check CAPTCHA
    if captcha_input.lower() != captcha_session.captcha_text.lower():
        db_session.commit()
        db_session.close()
        return jsonify({
            'success': False,
            'message': 'Incorrect CAPTCHA. Please try again.'
        }), 400
    
    # Verify user credentials
    user = db_session.query(User).filter_by(username=username).first()
    if not user or user.password != password:
        db_session.commit()
        db_session.close()
        return jsonify({
            'success': False,
            'message': 'Invalid username or password.'
        }), 401
    
    # Mark CAPTCHA as verified
    captcha_session.verified = True
    captcha_session.user_id = user.id
    db_session.commit()
    
    # Clean up old CAPTCHA sessions
    db_session.query(CaptchaSession).filter(
        CaptchaSession.created_at < datetime.datetime.utcnow() - datetime.timedelta(hours=1)
    ).delete()
    db_session.commit()
    db_session.close()
    
    # Clear CAPTCHA session ID
    session.pop('captcha_session_id', None)
    
    # Set user session
    session['user_id'] = user.id
    session['username'] = user.username
    session['login_time'] = datetime.datetime.now().strftime("%I:%M %p")
    
    # Redirect to success page
    return jsonify({
        'success': True,
        'message': 'Login successful!',
        'user': {'username': user.username, 'id': user.id},
        'redirect': '/success'
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    """Log out the user"""
    session.pop('user_id', None)
    session.pop('username', None)
    session.pop('captcha_session_id', None)
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    })

@app.route('/success')
def success():
    """Success page after successful login"""
    if 'username' not in session or 'user_id' not in session:
        flash('Please login first')
        return redirect(url_for('index'))
    
    login_time = session.get('login_time', datetime.datetime.now().strftime("%I:%M %p"))
    return render_template('success.html', username=session['username'], login_time=login_time)

@app.route('/dashboard')
def dashboard():
    """Dashboard page for logged in users"""
    if 'username' not in session or 'user_id' not in session:
        flash('Please login to access the dashboard')
        return redirect(url_for('index'))
    
    return render_template('dashboard.html', username=session['username'])

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    # Run the app on host 0.0.0.0 to make it accessible
    app.run(host='0.0.0.0', port=5000, debug=True)