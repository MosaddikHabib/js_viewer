document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const jsonTree = document.getElementById('jsonTree');
    const fileInput = document.getElementById('fileInput');
    const clearBtn = document.getElementById('clearBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const keySelector = document.getElementById('keySelector');
    const csvFileInput = document.getElementById('csvFileInput');
    const csvMode = document.getElementById('csvMode');
    const jsonMode = document.getElementById('jsonMode');
    const csvTableContainer = document.getElementById('csvTableContainer');
    const exitCsvBtn = document.getElementById('exitCsvBtn');
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    const wordWrapToggle = document.getElementById('wordWrapToggle');

    let currentJsonString = "";
    let debounceTimer;

    // CSV Handling
    csvFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/parse_csv', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            
            if (response.ok) {
                renderCsvTable(result.data);
                jsonMode.style.display = 'none';
                csvMode.style.display = 'block';
            } else {
                alert(result.error || 'Failed to parse CSV');
            }
        } catch (err) {
            console.error(err);
            alert('Error uploading CSV');
        }
    });

    exitCsvBtn.addEventListener('click', () => {
        csvMode.style.display = 'none';
        jsonMode.style.display = 'block';
    });

    fullScreenBtn.addEventListener('click', () => {
        const wrapper = document.querySelector('.csv-viewer-container');
        if (!document.fullscreenElement) {
            wrapper.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    wordWrapToggle.addEventListener('change', () => {
        const table = csvTableContainer.querySelector('.csv-table');
        if (table) {
            if (wordWrapToggle.checked) {
                table.classList.add('word-wrap');
            } else {
                table.classList.remove('word-wrap');
            }
        }
    });

    const renderCsvTable = (data) => {
        if (!data || data.length === 0) {
            csvTableContainer.innerHTML = '<div class="info-message">CSV is empty</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'csv-table';
        if (wordWrapToggle.checked) table.classList.add('word-wrap');
        
        // Add column headers (A, B, C...)
        const headerRow = document.createElement('tr');
        const emptyCorner = document.createElement('th');
        emptyCorner.className = 'row-index';
        headerRow.appendChild(emptyCorner);

        const maxCols = Math.max(...data.map(row => row.length));
        for (let i = 0; i < maxCols; i++) {
            const th = document.createElement('th');
            th.textContent = getColumnLabel(i);
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        // Add data rows with indices (1, 2, 3...)
        data.forEach((rowData, rowIndex) => {
            const tr = document.createElement('tr');
            const rowIdxTh = document.createElement('th');
            rowIdxTh.className = 'row-index';
            rowIdxTh.textContent = rowIndex + 1;
            tr.appendChild(rowIdxTh);

            for (let i = 0; i < maxCols; i++) {
                const td = document.createElement('td');
                td.textContent = rowData[i] || '';
                tr.appendChild(td);
            }
            table.appendChild(tr);
        });

        csvTableContainer.innerHTML = '';
        csvTableContainer.appendChild(table);
    };

    const getColumnLabel = (index) => {
        let label = '';
        while (index >= 0) {
            label = String.fromCharCode((index % 26) + 65) + label;
            index = Math.floor(index / 26) - 1;
        }
        return label;
    };

    const updateView = async () => {
        const value = jsonInput.value.trim();
        currentJsonString = value;
        
        if (!value) {
            jsonTree.innerHTML = '<div class="info-message">Paste JSON to start exploration</div>';
            statusIndicator.textContent = 'Idle';
            statusIndicator.className = 'status';
            keySelector.innerHTML = '<option value="">Filter by key...</option>';
            return;
        }

        statusIndicator.textContent = 'Parsing...';

        try {
            const response = await fetch('/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ json: value })
            });
            const data = await response.json();

            if (response.ok) {
                updateKeySelector(data.keys);
                renderSelectedKey();
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            jsonTree.innerHTML = `<div class="error" style="color: var(--error-color); padding: 20px; background: #fef2f2; border-radius: 12px; border: 1px solid #fee2e2;">
                <strong>⚠️ Invalid JSON:</strong><br>${e.message}
            </div>`;
            statusIndicator.textContent = 'Error';
            statusIndicator.className = 'status error';
        }
    };

    const updateKeySelector = (keys) => {
        const selectedValue = keySelector.value;
        keySelector.innerHTML = '<option value="">Filter by key...</option>';
        keys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            if (key === selectedValue) option.selected = true;
            keySelector.appendChild(option);
        });
    };

    const renderSelectedKey = async () => {
        const selectedKey = keySelector.value;
        if (!selectedKey || !currentJsonString) {
            jsonTree.innerHTML = '<div class="info-message">Please select a key from the dropdown to view its values.</div>';
            statusIndicator.textContent = 'Ready';
            statusIndicator.className = 'status success';
            return;
        }

        try {
            const response = await fetch('/get_values', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ json: currentJsonString, key: selectedKey })
            });
            const data = await response.json();

            jsonTree.innerHTML = '';
            if (data.items.length === 0) {
                jsonTree.innerHTML = `<div class="info-message">No occurrences of "${selectedKey}" found in the document.</div>`;
            } else {
                data.items.forEach((itemData, index) => {
                    const item = document.createElement('div');
                    item.className = 'text-item';
                    item.style.animationDelay = `${index * 0.05}s`;
                    
                    const valueText = typeof itemData.value === 'object' ? 
                        JSON.stringify(itemData.value, null, 2) : String(itemData.value);
                    
                    item.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                        <span style="color: var(--primary-color); font-weight:bold; font-size:11px;">#${index + 1}</span>
                        <span style="color: var(--text-muted); font-size:10px;">Click to locate</span>
                    </div>
                    <div style="white-space: pre-wrap; word-break: break-all;">${valueText}</div>`;
                    
                    item.addEventListener('click', () => {
                        highlightInInput(itemData.start, itemData.end);
                    });
                    
                    jsonTree.appendChild(item);
                });
            }

            statusIndicator.textContent = `${data.items.length} Matches`;
            statusIndicator.className = 'status success';
        } catch (e) {
            console.error(e);
        }
    };

    const highlightInInput = (start, end) => {
        if (start === -1) return;
        
        jsonInput.focus();
        jsonInput.setSelectionRange(start, end);
        
        const lineHeight = parseInt(getComputedStyle(jsonInput).lineHeight);
        const linesBefore = jsonInput.value.substring(0, start).split('\n').length - 1;
        
        // Animated scroll
        jsonInput.scrollTo({
            top: linesBefore * lineHeight,
            behavior: 'smooth'
        });
    };

    // Debounced input to prevent excessive API calls
    jsonInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateView, 300);
    });

    keySelector.addEventListener('change', renderSelectedKey);

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            jsonInput.value = e.target.result;
            updateView();
        };
        reader.readAsText(file);
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the workspace?')) {
            jsonInput.value = '';
            updateView();
        }
    });
});
