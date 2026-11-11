import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from seed import seed_database
from routes.auth_routes import auth_bp
from routes.doctor_routes import doctor_bp
from routes.appointment_routes import appointment_bp
from routes.assessment_routes import assessment_bp
from routes.ai_assistant_routes import ai_bp
from routes.consultation_routes import consultation_bp
from routes.emergency_routes import emergency_bp
from routes.admin_routes import admin_bp

def create_app():
    app = Flask(__name__)

    # Configuration
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'urcure.db')
        database_url = f'sqlite:///{db_path}'

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'urcure_super_secure_obsidian_key_2026_!#*&')
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # SQLite WAL mode & foreign keys for high concurrency & integrity
    if 'sqlite' in database_url:
        from sqlalchemy import event
        from sqlalchemy.engine import Engine

        @event.listens_for(Engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.close()

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'error': 'Missing or invalid authentication token.'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Authentication token has expired. Please sign in again.'}), 401

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctors')
    app.register_blueprint(appointment_bp, url_prefix='/api/appointments')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessments')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(consultation_bp, url_prefix='/api/consultations')
    app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'urCure Platform',
            'version': '2.4.0',
            'tagline': 'Your Health. Your Choice. Your Care.',
            'database': 'Connected'
        }), 200

    # Initialize and seed database
    seed_database(app)

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
