import os
import glob

replacements = {
    'bg-[#fdfaf7]': 'bg-slate-50',
    'bg-[#fcfaf7]': 'bg-white',
    'bg-[#4a3b32]': 'bg-slate-900',
    'text-[#fcfaf7]': 'text-white',
    'text-[#4a3b32]': 'text-slate-900',
    'border-[#5c4a3d]': 'border-slate-800',
    'border-[#e8dfd5]': 'border-slate-200',
    'text-[#8b7355]': 'text-slate-600',
    'bg-[#f4ebe1]': 'bg-slate-100',
    'text-[#4a3b32]': 'text-slate-900',
    'text-[#8b7355]': 'text-slate-600',
    'border-[#e8dfd5]': 'border-slate-200',
    'bg-[#f5ebd8]/50': 'bg-slate-100',
    'border-[#8c591c]': 'border-slate-900',
    'text-[#8c591c]': 'text-slate-900',
    'text-[#d0bfae]': 'text-slate-300',
    'text-[#a38d78]': 'text-slate-400',
}

files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")

print("Done replacing colors.")
