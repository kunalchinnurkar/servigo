import os

from app import create_app
from app.db import get_db
from app.seed import run_seed

app = create_app()

with app.app_context():
    run_seed(get_db())

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", True))
