import os
import google.generativeai as genai
from typing import Generator


class GeminiServiceError(Exception):
    """Custom exception for Gemini service errors."""
    pass


class GeminiService:
    """Service layer for interacting with Google Gemini API."""

    def __init__(self):
        self._configured = False
        self._api_key = None
        self.model = None

    def _validate_api_key(self, api_key: str) -> None:
        invalid_prefixes = ('AQ.', 'ya29.', 'Bearer ', 'ya29_')
        if api_key.startswith(invalid_prefixes):
            raise GeminiServiceError(
                'The configured key looks like an OAuth access token instead of a Google API key. '
                'Please use a valid API key from Google Cloud or the Gemini API page. '
                'A valid key typically starts with "AIza".'
            )

    def _configure(self) -> None:
        genai.configure(api_key=self._api_key)

        model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
        generation_config = genai.GenerationConfig(
            temperature=float(os.getenv('GEMINI_TEMPERATURE', '0.7')),
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
        )
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]

        self.model = genai.GenerativeModel(
            model_name=model_name,
            generation_config=generation_config,
            safety_settings=safety_settings,
            system_instruction=(
                "You are a helpful, knowledgeable, and friendly AI assistant. "
                "Provide clear, accurate, and well-structured responses. "
                "Use markdown formatting when appropriate for readability. "
                "For code, always use fenced code blocks with the language specified."
            )
        )
        self._configured = True

    def _ensure_ready(self) -> None:
        if not self._api_key:
            self._api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')

        if not self._api_key:
            raise GeminiServiceError(
                'GEMINI_API_KEY is not set. Please add it to your .env file.'
            )

        self._validate_api_key(self._api_key)

        if not self._configured:
            self._configure()

    def _format_history(self, history: list) -> list:
        """Convert frontend history format to Gemini format."""
        formatted = []
        for msg in history:
            role = 'user' if msg.get('role') == 'user' else 'model'
            content = msg.get('content', '')
            if content:
                formatted.append({
                    'role': role,
                    'parts': [{'text': content}]
                })
        return formatted

    def send_message(self, message: str, history: list) -> str:
        """Send a message and return the full response text."""
        try:
            self._ensure_ready()
            chat_session = self.model.start_chat(
                history=self._format_history(history)
            )
            response = chat_session.send_message(message)
            return response.text
        except Exception as e:
            raise GeminiServiceError(f'Gemini API error: {str(e)}')

    def stream_message(self, message: str, history: list) -> Generator[str, None, None]:
        """Stream a message response chunk by chunk."""
        try:
            self._ensure_ready()
            chat_session = self.model.start_chat(
                history=self._format_history(history)
            )
            response = chat_session.send_message(message, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            raise GeminiServiceError(f'Gemini stream error: {str(e)}')
