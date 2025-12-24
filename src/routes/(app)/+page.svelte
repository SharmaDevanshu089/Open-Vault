<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

  let name = $state("");
  let greetMsg = $state("");
  let bool = invoke<boolean>("check_first_run").then((res) => {
    console.log("Is first run:", res);
    return res;
  });

  // passwords.js - Simple CSV Import & Display

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const modalOverlay = document.getElementById('modalOverlay');
  const importModal = document.getElementById('importCsvModal');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('csvFileInput');
  const fileNameDisplay = document.getElementById('csvFileNameDisplay');
  const previewTable = document.getElementById('csvPreviewTableContainer');
  const containerArea = document.getElementById('passwordContainersArea');
  const emptyState = document.getElementById('emptyState');
  const btnClose = document.querySelectorAll('.close-modal-btn');
  const btnImportConfirm = document.getElementById('importCsvConfirmBtn');
  const importTitleInput = document.getElementById('importContainerTitleInput');

  let currentCSVData = null;

  // --- Init ---
  setupEventListeners();

  function setupEventListeners() {
    // Open import modal
    [document.getElementById('importCsvBtnGlobal'), document.getElementById('importCsvBtnEmpty')].forEach(btn => {
      if(btn) btn.addEventListener('click', openModal);
    });

    // Close modal
    btnClose.forEach(btn => btn.addEventListener('click', closeModal));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Drag & Drop
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#5e63ff';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      handleFile(e.dataTransfer.files[0]);
    });

    // File input change
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // Import button
    if (btnImportConfirm) {
      btnImportConfirm.addEventListener('click', importCSV);
    }
  }

  function handleFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }

    fileNameDisplay.textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers, rows } = parseCSV(text);

      if (headers.length === 0) {
        alert('Invalid CSV file.');
        return;
      }

      currentCSVData = { headers, rows };
      displayTable(headers, rows);
      btnImportConfirm.style.display = 'inline-block';
    };
    reader.readAsText(file);
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 1) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return values;
    });

    return { headers, rows };
  }

  function displayTable(headers, rows) {
    let html = '<table class="csv-display-table"><thead><tr>';
    
    headers.forEach(h => {
      html += `<th>${escapeHtml(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${escapeHtml(cell)}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    previewTable.innerHTML = html;
  }

  function displayImportedData(container) {
    // Create container element with the imported CSV data
    const containerEl = document.createElement('div');
    containerEl.className = 'password-group';
    
    let tableHTML = '<table class="pass-table"><thead><tr>';
    container.headers.forEach(h => {
      tableHTML += `<th>${escapeHtml(h)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    container.data.forEach(row => {
      tableHTML += '<tr>';
      row.forEach(cell => {
        tableHTML += `<td>${escapeHtml(cell)}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    containerEl.innerHTML = `
      <div class="group-header">
        <h2>${escapeHtml(container.title)}</h2>
        <button class="btn btn-sm btn-danger delete-group-btn" data-id="${container.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      <div class="table-responsive">
        ${tableHTML}
      </div>
    `;

    emptyState.style.display = 'none';
    containerArea.appendChild(containerEl);

    // Attach delete handler
    containerEl.querySelector('.delete-group-btn').addEventListener('click', (e) => {
      if (confirm('Delete this password collection?')) {
        const id = e.currentTarget.dataset.id;
        const containers = JSON.parse(localStorage.getItem('passwordContainers') || '[]');
        const filtered = containers.filter(c => c.id != id);
        localStorage.setItem('passwordContainers', JSON.stringify(filtered));
        containerEl.remove();
        
        if (filtered.length === 0) {
          emptyState.style.display = 'block';
        }
      }
    });
  }

  function importCSV() {
    if (!currentCSVData || currentCSVData.rows.length === 0) {
      alert('No CSV data to import.');
      return;
    }

    const title = importTitleInput.value.trim() || 'Imported ' + new Date().toLocaleDateString();
    
    // Store in localStorage
    const containers = JSON.parse(localStorage.getItem('passwordContainers') || '[]');
    const newContainer = {
      id: Date.now(),
      title: title,
      headers: currentCSVData.headers,
      data: currentCSVData.rows,
      importDate: new Date().toISOString()
    };

    containers.push(newContainer);
    localStorage.setItem('passwordContainers', JSON.stringify(containers));

    closeModal();
    resetModal();
    displayImportedData(newContainer);
  }

  function openModal() {
    modalOverlay.style.display = 'block';
    importModal.style.display = 'flex';
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    importModal.style.display = 'none';
  }

  function resetModal() {
    fileInput.value = '';
    fileNameDisplay.textContent = '';
    importTitleInput.value = '';
    previewTable.innerHTML = '';
    btnImportConfirm.style.display = 'none';
    currentCSVData = null;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }
});
</script>

<main class="container">

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwords Management</title>
  <!-- Main Global Style -->
  <link rel="stylesheet" href="style.css">
  <!-- Page Specific Style -->
  <link rel="stylesheet" href="src/styles/passwords.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <!-- Global App Script (Sidebar, etc) -->
  <!-- <script type="text/javascript" src="app.js" defer></script> -->
  <!-- Page Specific Script -->
  <script type="text/javascript" src="src/scripts/passwords.js" defer></script>

  <!-- <nav id="sidebar"></nav> -->
  
  <main class="passwords-dashboard">
    <!-- Top Header / Title Area -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Password Management</h1>
        <p class="subtitle">Manage and audit your secure credentials</p>
      </div>
      <div class="header-right">
        <!-- Global Action Buttons -->
        <button id="importCsvBtnGlobal" class="btn btn-primary">
          <i class="fas fa-file-import"></i> Import CSV
        </button>
      </div>
    </header>

    <!-- Stats / Summary Row -->
    <section class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon-wrapper total">
          <i class="fas fa-shield-alt"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value" id="totalPassCount">0</span>
          <span class="stat-label">Total Passwords</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper weak">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-details">
          <span class="stat-value" id="weakPassCount">0</span>
          <span class="stat-label">Weak Passwords</span>
        </div>
      </div>
    </section>

    <!-- Controls Bar (Search & Filter) -->
    <section class="controls-bar">
      <div class="search-wrapper">
        <i class="fas fa-search"></i>
        <input type="search" id="globalSearch" placeholder="Search websites, usernames...">
      </div>
      <div class="filter-wrapper">
        <button id="toggleFiltersBtn" class="btn btn-secondary icon-only" title="Toggle Filters">
          <i class="fas fa-filter"></i>
        </button>
      </div>
    </section>

    <!-- Expanded Filters Section -->
    <section id="filterExpansionSection" class="filter-panel" style="display: none;">
      <div class="filter-grid">
        <div class="input-group">
          <label>Website</label>
          <input type="text" id="filterWebsite" class="filter-input" placeholder="Contains...">
        </div>
        <div class="input-group">
          <label>Username</label>
          <input type="text" id="filterUsername" class="filter-input" placeholder="Contains...">
        </div>
        <div class="input-group">
          <label>Category</label>
          <select id="filterCategory" class="filter-input">
            <option value="">All Categories</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Social">Social</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button id="clearFiltersBtn" class="btn btn-text">Reset</button>
        <button id="applyFiltersBtn" class="btn btn-sm btn-primary">Apply</button>
      </div>
    </section>

    <!-- Main Content: Password Tables -->
    <div id="passwordContainersArea" class="content-area">
      <!-- Empty State -->
      <div id="emptyState" class="empty-state" style="display: none;">
        <div class="empty-illustration">
          <i class="fas fa-key"></i>
        </div>
        <h3>No Credentials Found</h3>
        <p>Import a CSV file to get started auditing your security.</p>
        <button id="importCsvBtnEmpty" class="btn btn-primary">Import CSV</button>
      </div>
      
      <!-- Password tables will be injected here by JS -->
    </div>
  </main>

  <!-- === MODALS === -->
  <div id="modalOverlay" class="modal-overlay"></div>

  <!-- Import CSV Modal -->
  <div id="importCsvModal" class="modal">
    <div class="modal-header">
      <h2>Import Credentials</h2>
      <button class="close-modal-btn" data-modal-id="importCsvModal">&times;</button>
    </div>
    
    <div class="modal-body">
      <!-- File Upload -->
      <div class="import-step">
        <div class="form-group">
          <label>Collection Title</label>
          <input type="text" id="importContainerTitleInput" class="modal-input" placeholder="e.g. Chrome Export, Work Passwords">
        </div>
        
        <div class="file-upload-area" id="dropZone">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Click to browse or drag CSV here</p>
          <input type="file" id="csvFileInput" accept=".csv" hidden>
          <span id="csvFileNameDisplay" class="file-name"></span>
        </div>
      </div>

      <!-- CSV Preview Table -->
      <div id="csvPreviewTableContainer" class="table-responsive"></div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary close-modal-btn" data-modal-id="importCsvModal">Close</button>
      <button id="importCsvConfirmBtn" class="btn btn-primary" style="display:none;">Import</button>
    </div>
  </div>

</main>

<style>
/* === PASSWORDS PAGE STYLES === */

:root {
  --card-bg: #1a1c26;
  --table-header-bg: #20222b;
  --table-border: #2a2d3a;
  --highlight-blue: #5e63ff;
  --highlight-red: #ff4b4b;
  --highlight-green: #00e676;
  --text-muted: #8b8ea0;
}

.passwords-dashboard {
  padding: 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* --- Header --- */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  margin-bottom: 0.25rem;
  color: var(--text-clr);
}

.subtitle {
  color: var(--secondary-text-clr);
  font-size: 0.95rem;
}

/* --- Stats Cards (The "Grey Boxes") --- */
.stats-overview {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background-color: var(--card-bg);
  flex: 1;
  min-width: 280px;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid var(--line-clr);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-clr);
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-icon-wrapper.total {
  background-color: rgba(94, 99, 255, 0.1);
  color: var(--highlight-blue);
  border: 2px solid var(--highlight-blue);
}

.stat-icon-wrapper.weak {
  background-color: rgba(255, 75, 75, 0.1);
  color: var(--highlight-red);
  border: 2px solid var(--highlight-red);
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-clr);
  line-height: 1;
}

.stat-label {
  color: var(--secondary-text-clr);
  font-size: 0.9rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

/* --- Controls Bar --- */
.controls-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: var(--card-bg);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--line-clr);
  align-items: center;
}

.search-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  background-color: var(--base-clr);
  border-radius: 8px;
  padding: 0 1rem;
  border: 1px solid transparent;
}

.search-wrapper:focus-within {
  border-color: var(--accent-clr);
}

.search-wrapper i {
  color: var(--secondary-text-clr);
}

.search-wrapper input {
  background: transparent;
  border: none;
  color: var(--text-clr);
  padding: 0.8rem;
  width: 100%;
  outline: none;
  font-size: 0.95rem;
}

.icon-only {
  padding: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Filter Panel --- */
.filter-panel {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--line-clr);
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.85rem;
  color: var(--secondary-text-clr);
}

.filter-input {
  background-color: var(--base-clr);
  border: 1px solid var(--line-clr);
  color: var(--text-clr);
  padding: 0.6rem;
  border-radius: 6px;
  outline: none;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* --- Content Area / Tables --- */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.password-group {
  background-color: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--line-clr);
  overflow: hidden;
}

.group-header {
  padding: 1rem 1.5rem;
  background-color: rgba(255,255,255,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--line-clr);
}

.group-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-clr);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.pass-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.pass-table th {
  background-color: var(--table-header-bg);
  color: var(--secondary-text-clr);
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pass-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--line-clr);
  color: var(--text-clr);
  vertical-align: middle;
}

.pass-table tr:last-child td {
  border-bottom: none;
}

.pass-table tr:hover {
  background-color: rgba(255,255,255,0.02);
}

/* Password masking */
.password-cell {
  font-family: monospace;
  letter-spacing: 2px;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.reveal-icon {
  opacity: 0.3;
  font-size: 0.8em;
  transition: opacity 0.2s;
}

.password-cell:hover .reveal-icon {
  opacity: 1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--card-bg);
  border-radius: 16px;
  border: 2px dashed var(--line-clr);
  margin-top: 2rem;
}

.empty-illustration {
  font-size: 3rem;
  color: var(--secondary-text-clr);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-clr);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--secondary-text-clr);
  margin-bottom: 1.5rem;
}

/* --- Buttons --- */
.btn {
  padding: 0.6em 1.2em;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary { background-color: var(--accent-clr); color: white; }
.btn-primary:hover { background-color: #4b50e6; box-shadow: 0 4px 10px rgba(94, 99, 255, 0.3); }

.btn-secondary { background-color: transparent; border: 1px solid var(--line-clr); color: var(--text-clr); }
.btn-secondary:hover { background-color: var(--hover-clr); }

.btn-danger { background-color: rgba(244, 67, 54, 0.1); color: #f44336; }
.btn-danger:hover { background-color: rgba(244, 67, 54, 0.2); }

.btn-success { background-color: var(--highlight-green); color: #000; font-weight: 600; }

.btn-sm { padding: 0.4em 0.8em; font-size: 0.85rem; }
.btn-text { background: none; color: var(--secondary-text-clr); }
.btn-text:hover { color: var(--text-clr); }

/* --- Modal Styles --- */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: none;
}

.modal {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--card-bg);
  border: 1px solid var(--line-clr);
  width: 90%; max-width: 700px;
  max-height: 90vh;
  border-radius: 16px;
  z-index: 1001;
  display: none;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--line-clr);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-modal-btn {
  background: none !important;
  border: none !important;
  color: var(--secondary-text-clr) !important;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem !important;
  line-height: 1;
  transition: color 0.2s;
}

.close-modal-btn:hover {
  color: var(--text-clr) !important;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--line-clr);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background-color: rgba(0,0,0,0.2);
}

/* File Upload Zone */
.file-upload-area {
  border: 2px dashed var(--line-clr);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.file-upload-area:hover {
  border-color: var(--accent-clr);
  background-color: rgba(94, 99, 255, 0.05);
}

.file-upload-area i { font-size: 2.5rem; color: var(--secondary-text-clr); margin-bottom: 1rem; }
.file-name { display: block; margin-top: 1rem; color: var(--highlight-green); font-weight: 500; }

/* Mapping Grid */
.mapping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.mapping-item label {
  display: block;
  font-size: 0.8rem;
  color: var(--secondary-text-clr);
  margin-bottom: 0.5rem;
}

.mapping-select {
  width: 100%;
  padding: 0.5rem;
  background-color: var(--base-clr);
  border: 1px solid var(--line-clr);
  color: var(--text-clr);
  border-radius: 4px;
}

/* CSV Display Table */
.csv-display-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

.csv-display-table thead {
  background-color: var(--table-header-bg);
}

.csv-display-table th {
  padding: 0.75rem;
  text-align: left;
  color: var(--secondary-text-clr);
  font-weight: 600;
  border-bottom: 2px solid var(--table-border);
  font-size: 0.85rem;
  white-space: nowrap;
}

.csv-display-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--table-border);
  color: var(--text-clr);
  word-break: break-word;
  max-width: 300px;
}

.csv-display-table tbody tr:hover {
  background-color: rgba(94, 99, 255, 0.05);
}

.table-responsive {
  overflow-x: auto;
}
</style>
