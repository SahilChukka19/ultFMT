import os
import re

target_dir = r"d:\projects\ai_toolkit\frontend\src"

replacements = {
    r"bg-\[\#1d4ed8\]": "bg-blue-600",
    r"hover:bg-\[\#1e40af\]": "hover:bg-blue-700",
    r"text-\[\#1d4ed8\]": "text-blue-600",
}

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)
                
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
