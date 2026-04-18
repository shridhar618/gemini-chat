import json
from flask import Blueprint, request, jsonify, Response, stream_with_context
from services.gemini_service import GeminiService, GeminiServiceError

chat_bp = Blueprint('chat', __name__)
gemini = GeminiService()


@chat_bp.route('/chat', methods=['POST'])
def chat():
    """Standard (non-streaming) chat endpoint."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400

    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    try:
        response_text = gemini.send_message(message, history)
        return jsonify({'response': response_text})
    except GeminiServiceError as e:
        return jsonify({'error': str(e)}), 502
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@chat_bp.route('/chat/stream', methods=['POST'])
def chat_stream():
    """Streaming chat endpoint using Server-Sent Events."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400

    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    def generate():
        try:
            for chunk in gemini.stream_message(message, history):
                payload = json.dumps({'chunk': chunk, 'done': False})
                yield f'data: {payload}\n\n'
            # Signal completion
            yield f'data: {json.dumps({"chunk": "", "done": True})}\n\n'
        except GeminiServiceError as e:
            error_payload = json.dumps({'error': str(e), 'done': True})
            yield f'data: {error_payload}\n\n'
        except Exception as e:
            error_payload = json.dumps({'error': f'Stream error: {str(e)}', 'done': True})
            yield f'data: {error_payload}\n\n'

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        }
    )
