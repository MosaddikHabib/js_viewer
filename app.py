from flask import Flask, render_template, request, jsonify
import json
import re

app = Flask(__name__)

def get_all_keys(obj, keys=None):
    if keys is None:
        keys = set()
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            keys.add(key)
            get_all_keys(value, keys)
    elif isinstance(obj, list):
        for item in obj:
            get_all_keys(item, keys)
            
    return keys

def extract_key_with_positions(json_string, data, target_key):
    results = []
    last_index = 0
    
    def find_positions(obj):
        nonlocal last_index
        if isinstance(obj, list):
            for item in obj:
                find_positions(item)
            return

        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == target_key:
                    # Construct regex similar to the JS version
                    if isinstance(value, str):
                        escaped_val = re.escape(value)
                        search_str = f'"{re.escape(key)}"\\s*:\\s*"{escaped_val}"'
                    elif isinstance(value, (int, float, bool)) or value is None:
                        val_str = str(value).lower() if isinstance(value, (bool, type(None))) else str(value)
                        search_str = f'"{re.escape(key)}"\\s*:\\s*{val_str}'
                    else:
                        search_str = f'"{re.escape(key)}"\\s*:\\s*[\\{{\\[]'
                    
                    match = re.search(search_str, json_string[last_index:])
                    if match:
                        start = last_index + match.start()
                        end = last_index + match.end()
                        results.append({
                            'value': value,
                            'start': start,
                            'end': end
                        })
                        last_index = start + 1
                    else:
                        results.append({'value': value, 'start': -1, 'end': -1})
                
                if isinstance(obj[key], (dict, list)):
                    find_positions(obj[key])

    find_positions(data)
    return results

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/parse', methods=['POST'])
def parse_json():
    content = request.json.get('json', '')
    if not content:
        return jsonify({'error': 'No content'}), 400
    
    try:
        data = json.loads(content)
        keys = sorted(list(get_all_keys(data)))
        return jsonify({'keys': keys})
    except json.JSONDecodeError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/get_values', methods=['POST'])
def get_values():
    content = request.json.get('json', '')
    target_key = request.json.get('key', '')
    
    try:
        data = json.loads(content)
        items = extract_key_with_positions(content, data, target_key)
        return jsonify({'items': items})
    except json.JSONDecodeError as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
