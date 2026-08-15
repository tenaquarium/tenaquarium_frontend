import json
import os
import re

log_path = r'C:\Users\Princess\.gemini\antigravity\brain\fd22ae57-66c5-4c48-a7e5-d85b868b85ce\.system_generated\logs\transcript_full.jsonl'
output_path = r'd:\anti_project\frontend\src\index.css'

print("Scanning log file for index.css content...")

found_content = None

# Open and parse the log file line by line
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'index.css' in line:
            try:
                data = json.loads(line)
                # Check if this is a file view or write that contains the old index.css content
                content = data.get('content', '')
                if '/* Import modern font from Google Fonts */' in content and '/* Custom Global Scrollbar */' in content:
                    # Make sure it's the large original file (contains Navbar, Home Page, categories, testimonials etc)
                    if '/* Categories Grid */' in content and '/* Notification Dropdown Menu */' in content:
                        if len(content) > len(found_content or ''):
                            found_content = content
            except Exception as e:
                continue

if found_content:
    # Remove line numbers formatting if it was captured from a view_file output
    # View file output usually prefixes lines with "<line_number>: <content>"
    lines = found_content.split('\n')
    cleaned_lines = []
    has_line_numbers = False
    
    # Check if first few lines match the line number prefix pattern
    for l in lines[:10]:
        if re.match(r'^\d+:\s', l):
            has_line_numbers = True
            break
            
    if has_line_numbers:
        print("Detected line-numbered view output. Cleaning line numbers...")
        for l in lines:
            match = re.match(r'^\d+:\s?(.*)', l)
            if match:
                cleaned_lines.append(match.group(1))
            else:
                cleaned_lines.append(l)
        found_content = '\n'.join(cleaned_lines)

    # Write the recovered content back
    with open(output_path, 'w', encoding='utf-8') as out_f:
        out_f.write(found_content)
    print(f"Successfully restored index.css ({len(found_content)} bytes)!")
else:
    print("Could not find the full original index.css content in logs.")
