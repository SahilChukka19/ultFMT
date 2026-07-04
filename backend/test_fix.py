import re
import json

json_str = """{
  "project": "AI Dev Toolkit",
  "version": "1.0.0",
  "components": [
    {
      "id": "nav-01",
      "type": "sidebar",
      "active": true
    },
    {
      "id": "editor-01",
      "type": "codeEditor"
      "language": "javascript",
      "lineNumbers": True,
    }
  ],
  "settings": {
    theme: "dark",
    "autoSave": true,
    "fontSize": 14,
    "extensions": [
      "prettier",
      "eslint",
    ]
  },
  "users": [
    {
      "name": "Sahil",
      "role":
    },
    {
      "name": 'Alex',
      "role": "Admin"
    }
  ],
  "metadata": {
    "createdAt": "2026-06-27T12:00:00Z",
    "updatedAt": "2026-06-27T12:30:00Z",
  }
"""

def attempt_auto_fix_json(json_str: str):
    def verify(s):
        try:
            return json.dumps(json.loads(s), indent=2)
        except Exception as e:
            print("Failed to verify:", e)
            return None

    try_str = json_str
    # 1. Unquoted keys
    try_str = re.sub(r'(?m)^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)', r'\1"\2"\3', try_str)
    # 2. Single quotes
    try_str = try_str.replace("'", '"')
    # 3. Python booleans
    try_str = re.sub(r'\bTrue\b', 'true', try_str)
    try_str = re.sub(r'\bFalse\b', 'false', try_str)
    # 4. Missing commas
    try_str = re.sub(r'(["\]}\w])(\s*\n\s*")', r'\1,\2', try_str)
    # 5. Empty values
    try_str = re.sub(r':(\s*[\]}])', r': null\1', try_str)
    # 6. Trailing commas
    try_str = re.sub(r",(\s*[\]}])", r"\1", try_str)
    
    # 7. Missing closing braces
    open_braces = try_str.count('{')
    close_braces = try_str.count('}')
    if open_braces > close_braces:
        try_str += '\n' + '}' * (open_braces - close_braces)
    
    open_brackets = try_str.count('[')
    close_brackets = try_str.count(']')
    if open_brackets > close_brackets:
        try_str += '\n' + ']' * (open_brackets - close_brackets)

    print("--- Fixed String ---")
    print(try_str)
    print("--------------------")

    res = verify(try_str)
    if res:
        print("Success!")
    return res

attempt_auto_fix_json(json_str)
