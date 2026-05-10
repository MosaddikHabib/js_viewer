# JSON Insight | Professional Viewer

An advanced JSON data explorer and viewer built with Python (Flask) and a modern web interface. This tool allows you to easily visualize, filter, and navigate through complex JSON structures.

## ✨ Features

- **Upload/Paste JSON:** Support for both uploading `.json` files and direct pasting into the editor.
- **Dynamic Key Filtering:** Automatically extracts all unique keys from your JSON and allows you to filter specific values.
- **Interactive Navigation:** Click on filtered results to quickly locate them within the source code.
- **Modern UI:** Clean, responsive interface with a dark theme and JetBrains Mono for code readability.
- **Pro Features:** Live previews and status indicators for a smooth exploration experience.

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Flask

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd json_viewer
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. Install requirements (if applicable):
   ```bash
   pip install flask
   ```

### Running the App

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

## 📂 Project Structure

- `app.py`: Backend Flask application handling JSON parsing and logic.
- `templates/`: HTML templates for the web interface.
- `static/`: CSS styles and JavaScript for the frontend.
- `.venv/`: Virtual environment folder (ignored by git).

## 🛠️ Usage

1. **Paste or Upload**: Enter your JSON data in the "Source JSON" editor or use the "Upload JSON" button.
2. **Select Key**: Use the dropdown menu in the "Live Preview" pane to pick a key you want to inspect.
3. **Explore**: See all occurrences of that key and their values. Click on them to highlight in the source editor.
4. **Clear**: Use the "Clear Workspace" button to reset the view.

## 📄 License

This project is open-source and available under the MIT License.
