from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from chatbot_engine_enhanced import ChatbotEngineEnhanced

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize enhanced chatbot engine
chatbot = ChatbotEngineEnhanced()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'FindMyProfessor AI Chatbot API',
        'version': '1.0.0',
        'status': 'running'
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Main chatbot endpoint with emotion detection and attachments"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        session_id = data.get('session_id', 'default')
        
        # Process the message through enhanced chatbot engine
        response = chatbot.process_message(user_message, session_id)
        
        return jsonify({
            'success': True,
            'response': response['message'],
            'intent': response['intent'],
            'emotion': response.get('emotion', None),
            'data': response.get('data', None),
            'attachments': response.get('attachments', None),
            'image_url': response.get('image_url', None),
            'suggestions': response.get('suggestions', [])
        })
    
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/reload-data', methods=['POST'])
def reload_data():
    """Reload chatbot data from database"""
    try:
        chatbot.load_data()
        return jsonify({
            'success': True,
            'message': 'Data reloaded successfully'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'professors_loaded': len(chatbot.professors_data)
    })

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"🤖 Starting FindMyProfessor AI Chatbot on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)
