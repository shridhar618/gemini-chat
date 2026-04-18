import os
from pathlib import Path
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.chat import chat_bp

base_dir = Path(__file__).resolve().parent
load_dotenv(base_dir / '.env')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(chat_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health():
    return {'status': 'ok', 'message': 'Gemini Chat API is running'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(debug=debug, port=port, host='0.0.0.0')
