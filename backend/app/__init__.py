from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.config import Config
from app.db import init_db


def create_app():
    app = Flask(__name__)
    config = Config()
    app.config.from_object(config)

    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)
    JWTManager(app)
    init_db(config)

    from app.auth import bp as auth_bp
    from app.providers import bp as providers_bp
    from app.requests_bp import bp as requests_bp
    from app.services import bp as services_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(providers_bp)
    app.register_blueprint(requests_bp)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", db="mock" if config.USE_MOCK_DB else "mongodb")

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify(error="Not found"), 404

    return app
