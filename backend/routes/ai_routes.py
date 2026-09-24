from flask import Blueprint, jsonify, request
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.ai_assistant import process_ai_query

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/api/ai/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    question = data.get('question', '').strip()
    
    if not question:
        return jsonify({"success": False, "error": "Question is required."}), 400
        
    answer = process_ai_query(question)
    return jsonify({
        "success": True,
        "question": question,
        "answer": answer
    })
