import json
import os
import re

log_path = r'C:\Users\Princess\.gemini\antigravity\brain\fd22ae57-66c5-4c48-a7e5-d85b868b85ce\.system_generated\logs\transcript_full.jsonl'

print("Searching for writes or reads of index.css...")

with open(log_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f):
        # Look for index.css inside the line
        if 'index.css' in line:
            try:
                data = json.loads(line)
                # Check inside tool_calls or arguments
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    args = tc.get('arguments', {})
                    if 'index.css' in str(args):
                        print(f"Match on line {line_num} tool_call: {tc.get('name')}")
                        content = args.get('CodeContent', '') or args.get('ReplacementContent', '')
                        if content and len(content) > 10000:
                            print(f"  -> Found content of length {len(content)}")
                            with open(f'recovered_css_{line_num}.css', 'w', encoding='utf-8') as out:
                                out.write(content)
                            print(f"  -> Saved to recovered_css_{line_num}.css")
            except Exception as e:
                continue
print("Search complete.")
