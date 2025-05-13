const loadBtn     = document.getElementById('load-results');
const pwInput     = document.getElementById('admin-password');
const statusDiv   = document.getElementById('status');
const tablesDiv   = document.getElementById('tables-container');

loadBtn.addEventListener('click', async () => {
  const pw = pwInput.value.trim();
  if (!pw) {
    showStatus('Enter admin password.', 'error');
    return;
  }
  showStatus('Loading…', '');
  tablesDiv.innerHTML = '';

  try {
    const res = await fetch('/api/results', {
      method: 'GET',
      headers: { 'x-admin-password': pw }
    });
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    if (!rows.length) {
      showStatus('No data found.', 'error');
      return;
    }
    renderTables(rows);
    showStatus('', '');
  } catch (e) {
    showStatus(`Failed: ${e.message}`, 'error');
  }
});

function renderTables(rows) {
  // Group by groupName
  const groups = {};
  rows.forEach(r => {
    if (!groups[r.groupName]) {
      groups[r.groupName] = { members: new Set(), data: {} };
    }
    const g = groups[r.groupName];
    g.members.add(r.fromMember);
    g.members.add(r.toMember);
    g.data[`${r.fromMember}→${r.toMember}`] = r.points;
  });

  // For each group, build a matrix
  for (let [groupName, { members, data }] of Object.entries(groups)) {
    const memberList = Array.from(members).sort();
    const table = document.createElement('table');
    table.className = 'matrix';

    // Caption
    const cap = document.createElement('caption');
    cap.textContent = groupName;
    table.appendChild(cap);

    // Header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // empty corner
    memberList.forEach(name => {
      const th = document.createElement('th');
      th.textContent = name;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body rows
    const tbody = document.createElement('tbody');
    memberList.forEach(rowName => {
      const tr = document.createElement('tr');
      const rowHeader = document.createElement('th');
      rowHeader.textContent = rowName;
      tr.appendChild(rowHeader);

      memberList.forEach(colName => {
        const key = `${rowName}→${colName}`;
        const td = document.createElement('td');
        // blank out self→self
        td.textContent = rowName === colName ? '—' : (data[key] ?? 0);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Footer: column totals
    const tfoot = document.createElement('tfoot');
    const sumRow = document.createElement('tr');
    const sumHeader = document.createElement('th');
    sumHeader.textContent = 'Total';
    sumRow.appendChild(sumHeader);

    memberList.forEach(colName => {
      let colSum = 0;
      memberList.forEach(rowName => {
        if (rowName !== colName) {
          colSum += data[`${rowName}→${colName}`] ?? 0;
        }
      });
      const td = document.createElement('td');
      td.textContent = colSum;
      sumRow.appendChild(td);
    });
    tfoot.appendChild(sumRow);
    table.appendChild(tfoot);

    tablesDiv.appendChild(table);
  }
}

function showStatus(msg, type) {
  statusDiv.textContent = msg;
  statusDiv.className   = type === 'error' ? 'error' : '';
}


// Elements
/*const loadBtn = document.getElementById('load-results');
const passwordInput = document.getElementById('admin-password');
const statusDiv    = document.getElementById('status');
const table        = document.getElementById('results-table');
const tbody        = document.getElementById('results-body');

// Click handler
loadBtn.addEventListener('click', async () => {
    const password = passwordInput.value.trim();
    if (!password) {
        showStatus('Please enter the admin password.', 'error');
        return;
    }

    showStatus('Loading results...', '');
    table.style.display = 'none';
    tbody.innerHTML = '';

    try {
        const res = await fetch('/api/results', {
            method: 'GET',
            headers: { 'x-admin-password': password }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Error ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            showStatus('No results found.', 'error');
            return;
        }

        // Populate table
        data.forEach(entry => {
            const tr = document.createElement('tr');
            const nameTd  = document.createElement('td');
            const scoreTd = document.createElement('td');
            const timeTd  = document.createElement('td');

            nameTd.textContent  = entry.name  || 'N/A';
            scoreTd.textContent = entry.score != null ? entry.score : 'N/A';
            timeTd.textContent  = entry.time 
                ? new Date(entry.time).toLocaleString() 
                : 'N/A';

            tr.appendChild(nameTd);
            tr.appendChild(scoreTd);
            tr.appendChild(timeTd);
            tbody.appendChild(tr);
        });

        table.style.display = 'table';
        showStatus('', '');
    } catch (err) {
        showStatus(`Failed to load: ${err.message}`, 'error');
    }
});

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className   = type === 'error' ? 'error' : '';
}*/