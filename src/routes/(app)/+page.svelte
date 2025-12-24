<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

  let name = $state("");
  let greetMsg = $state("");
  let bool = invoke<boolean>("check_first_run").then((res) => {
    console.log("Is first run:", res);
    return res;
  });

  // passwords.js - Simple CSV Import & Display


</script>

<main class="container">

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Passwords Management</title>
  <!-- Main Global Style -->
  <link rel="stylesheet" href="home.css">
  <!-- Page Specific Style -->
  <link rel="stylesheet" href="src/styles/passwords.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- SHERON Please Remove this -->
  <link rel="stylesheet" href="native.css">
  <!-- Global App Script (Sidebar, etc) -->
  <!-- <script type="text/javascript" src="app.js" defer></script> -->
  <!-- Page Specific Script -->
  <script type="text/javascript" src="src/scripts/passwords.js" defer></script
  <!-- <script src="native.js"></script> -->

  <!-- <nav id="sidebar"></nav> -->
  
  <main class="passwords-dashboard">
    <!-- Top Header / Title Area -->
    <header class="dashboard-header">
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

