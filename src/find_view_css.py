import json
import os

log_path = r'C:\Users\Princess\.gemini\antigravity\brain\fd22ae57-66c5-4c48-a7e5-d85b868b85ce\.system_generated\logs\transcript_full.jsonl'

print("Searching log output content for index.css readings...")

with open(log_path, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f):
        if 'index.css' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if not content:
                    # check nested fields
                    tool_calls = data.get('tool_calls', [])
                    for tc in tool_calls:
                        res = tc.get('response', {})
                        if isinstance(res, dict):
                            content = res.get('content', '') or str(res)
                        elif isinstance(res, str):
                            content = res
                
                if content and '/* Import modern font from Google Fonts */' in content:
                    if '/* Unique Animated Loader: Premium Realistic Aquarium Theme */' in content or 'aquarium-loader-container' in content:
                        print(f"Found match on line {line_num}, content length: {len(content)}")
                        with open(f'recovered_css_{line_num}.css', 'w', encoding='utf-8') as out:
                            out.write(content)
                        print(f"Saved to recovered_css_{line_num}.css")
            except Exception as e:
                continue

print("Done scanning.")
