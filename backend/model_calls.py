"""
Model API Calls - Handles API calls to different LLM models
"""

import os
import requests
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

class ModelCaller:
    """Handles API calls to multiple LLM models"""
    
    def __init__(self):
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        self.groq_key = os.getenv('GROQ_API_KEY')
        self.openrouter_key = os.getenv('OPENROUTER_API_KEY')
        
        # Model configurations
        self.models_config = {
            'gemini': {
                'url': 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent',
                'key_param': 'key'
            },
            'llama': {
                'url': 'https://api.groq.com/openai/v1/chat/completions',
                'model_id': 'llama-3.3-70b-versatile'
            },
            'mistral': {
                'url': 'https://api.groq.com/openai/v1/chat/completions',
                'model_id': 'llama-3.1-8b-instant'
            },
            'deepseek': {
                'url': 'https://openrouter.ai/api/v1/chat/completions',
                'model_id': 'deepseek/deepseek-chat'
            }
        }
    
    def call_gemini(self, prompt: str, temperature: float = 0.7) -> str:
        """Call Gemini API - Raises exception on failure"""
        if not self.gemini_key:
            raise ValueError("Gemini API key not configured. Add GEMINI_API_KEY to .env")
        
        url = f"{self.models_config['gemini']['url']}?key={self.gemini_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 500
            }
        }
        
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code != 200:
            raise Exception(f"Gemini API Error {response.status_code}: {response.text[:200]}")
        
        result = response.json()
        text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        
        if not text:
            raise Exception("Empty response from Gemini API")
        
        return text
    
    def call_llama(self, prompt: str, temperature: float = 0.7) -> str:
        """Call LLaMA via Groq API - Raises exception on failure"""
        if not self.groq_key:
            raise ValueError("Groq API key not configured. Add GROQ_API_KEY to .env")
        
        headers = {
            'Authorization': f'Bearer {self.groq_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': self.models_config['llama']['model_id'],
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': temperature,
            'max_tokens': 500
        }
        
        response = requests.post(
            self.models_config['llama']['url'],
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f"LLaMA API Error {response.status_code}: {response.text[:200]}")
        
        result = response.json()
        text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        if not text:
            raise Exception("Empty response from LLaMA API")
        
        return text
    
    def call_mistral(self, prompt: str, temperature: float = 0.7) -> str:
        """Call Mistral via Groq API - Raises exception on failure"""
        if not self.groq_key:
            raise ValueError("Groq API key not configured. Add GROQ_API_KEY to .env")
        
        headers = {
            'Authorization': f'Bearer {self.groq_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': self.models_config['mistral']['model_id'],
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': temperature,
            'max_tokens': 500
        }
        
        response = requests.post(
            self.models_config['mistral']['url'],
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f"Mistral API Error {response.status_code}: {response.text[:200]}")
        
        result = response.json()
        text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        if not text:
            raise Exception("Empty response from Mistral API")
        
        return text
    
    # def call_deepseek(self, prompt: str, temperature: float = 0.7) -> str:
    #     """Call DeepSeek via OpenRouter API - Raises exception on failure"""
    #     if not self.openrouter_key:
    #         raise ValueError("OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env")
        
    #     headers = {
    #         'Authorization': f'Bearer {self.openrouter_key}',
    #         'Content-Type': 'application/json',
    #         'HTTP-Referer': 'http://localhost:3000',
    #         'X-Title': 'Guardrail Dashboard'
    #     }
        
    #     payload = {
    #         'model': self.models_config['deepseek']['model_id'],
    #         'messages': [
    #             {
    #                 'role': 'user',
    #                 'content': prompt
    #             }
    #         ],
    #         'temperature': temperature,
    #         'max_tokens': 500
    #     }
        
    #     response = requests.post(
    #         self.models_config['deepseek']['url'],
    #         json=payload,
    #         headers=headers,
    #         timeout=30
    #     )
        
    #     if response.status_code != 200:
    #         raise Exception(f"DeepSeek API Error {response.status_code}: {response.text[:200]}")
        
    #     result = response.json()
    #     text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
        
    #     if not text:
    #         raise Exception("Empty response from DeepSeek API")
        
    #     return text
    
    def get_model_responses(self, prompt: str, num_variations: int = 2) -> Dict[str, List[str]]:
        """Get responses from all models with temperature variation"""
        responses = {}
        
        models = [
            ('Gemini', self.call_gemini),
            ('LLaMA', self.call_llama),
            ('Mistral', self.call_mistral),
            # ('DeepSeek', self.call_deepseek)
        ]
        
        for model_name, model_func in models:
            responses[model_name] = []
            
            for i in range(num_variations):
                # Vary temperature slightly for diversity
                temperature = 0.5 + (i * 0.3)
                response = model_func(prompt, temperature=min(temperature, 1.0))
                responses[model_name].append(response)
        
        return responses


# Initialize model caller
model_caller = ModelCaller()
