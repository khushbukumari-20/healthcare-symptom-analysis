import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='.env')
key = os.getenv('LLM_API_KEY')

print("=" * 50)
print("API KEY DEBUG TEST")
print("=" * 50)
print(f"Key found: {key is not None}")
if key:
    print(f"Key length: {len(key)}")
    print(f"Starts with 'gsk_': {key.startswith('gsk_')}")
    print(f"Key preview: {key[:20]}")
    print(f"Key repr: {repr(key)}")
    
    if key.startswith('"') or key.endswith('"'):
        print("PROBLEM: Key has quotes!")
    if " " in key:
        print("PROBLEM: Key has spaces!")
    if len(key) < 30:
        print("PROBLEM: Key too short!")
    
    try:
        from groq import Groq
        client = Groq(api_key=key)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": "Hello"}]
        )
        print(" SUCCESS! Groq API Key is VALID!")
    except Exception as e:
        print(f"Groq Error: {str(e)[:200]}")
else:
    print("PROBLEM: No key found!")

print("=" * 50)