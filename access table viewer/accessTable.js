"use strict";
let globalData = {
    headers: [],
    records: []
};
let filteredData = {
    headers: [],
    records: []
};
let currentSort = {
    column: null,
    ascending: false
};
let selectedIndexes = [];
let alreadyLoaded = false;
const dropdown = document.getElementById('dropdown');
const searchInput = document.getElementById('searchInput');
const recordSelect = document.getElementById('records-select');
const exportCsv = document.getElementById('exportCsv');
const applyFilterBtn = document.getElementById('applyFilter');

function handleFile(event) {
    const file = event.target.files[0];
    const fileNaam = file.name;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById("fileNaam").textContent = fileNaam;
        const content = e.target.result;
        const blocks = content.split(/-{10,}/).map(b => b.trim()).filter(b => b);

        const headers = blocks[0].split('|').map(h => h.trim()).filter(h => h);
        
        const numOfCol = headers.length;
        const records = blocks.slice(1).map(block => {
            const values = block.split('|').slice(1, -1).map(v => v.trim() || '');
            while (values.length < numOfCol) values.push('');
            return values;
        });

        globalData.headers = headers;
        globalData.records = records.map(row => row.map(cell => typeof cell === 'string' && cell.includes(',') ? parseFloat(cell.replace(",", ".")) : cell));
        const recordSelect = document.getElementById('records-select');
        const recordsRange = parseInt(recordSelect.value);
        selectedIndexes = Array.from({ length: numOfCol }, (_, i) => i);
        filteredData.records =  getSelectedRecords(recordsRange, selectedIndexes);
        filteredData.headers = headers;

        renderTable(filteredData.records);
    
        if(!alreadyLoaded) {
            builtHeaderFilter();
        } else {
            updateDropdownContent();
        }
        alreadyLoaded = true;
    };

    reader.readAsText(file);
};

function renderTable(data) {
    document.getElementById('tableContainer').innerHTML = '';
    let html = '<table id="dataTable"><thead><tr>';
    filteredData.headers.forEach((h, i) => {
        let arrow = '<span class="sort-arrow"> ▲▼</span>';
        if (currentSort.column === i) {
            arrow = `<span class="sort-arrow">${currentSort.ascending ? ' ▲' : ' ▼'}</span>`;
        }
        html += `<th id="kolom-${i}" class="sortCol"><span class="header-text">${h}</span>${arrow}</th>`;
    });

    html += '</tr></thead><tbody>';

    const tmpd = filteredData.headers.findIndex(f => f === 'TMPD');
    const nx795 = filteredData.headers.findIndex(f => f === 'NX-795 tot' || f === 'NX-795 Tot');
    
    data.forEach(row => {
        html += '<tr>';
        row.forEach((cell, i) => {
            if(i === tmpd) {
                html += `<td style="color:${cell > 0.75 ? 'red': 'green'};
                font-weight:bold;">${cell}</td>`;
            } else if (i === nx795) {
                html += `<td style="color:${cell < 98.6 ? 'red': 'green'};
                font-weight:bold;">${cell}</td>`;
            } else if (i === 0){
                html += `<td style="color:black;">${cell}</td>`;
            } else {
                html += `<td>${cell}</td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    
    document.getElementById('tableContainer').innerHTML = html;

    document.querySelectorAll('.sortCol').forEach((col, i) => {
        col.addEventListener('click', () => {
            toggleSortDirection(i);
            sortTable(i, data);
        });
    });

    const aantal = document.getElementById('aantal-records');
    aantal.textContent = `${data.length} records`;
};

function toggleSortDirection(colIndex) {
    if (currentSort.column === colIndex) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = colIndex;
        currentSort.ascending = false;
    }
};

function sortTable(colIndex, data) {
    const isDateColumn = filteredData.headers[colIndex] === 'Datum + Uur';
    const sorted = data.sort((a, b) => {
    let valA = a[colIndex];
    let valB = b[colIndex];
    if (isDateColumn) {
        valA = parseDate(valA);
        valB = parseDate(valB);
        return currentSort.ascending ? valA - valB : valB - valA;
    } else {
        return currentSort.ascending ? String(valA).localeCompare(String(valB), 'nl', { numeric: true }) :
        String(valB).localeCompare(String(valA), 'nl', { numeric: true });
    }
    });
    
    renderTable(sorted);
};

function builtHeaderFilter() {
    updateDropdownContent();

    dropdown.style.visibility = 'visible';
    searchInput.style.visibility = 'visible';
    recordSelect.style.visibility = 'visible';
    exportCsv.style.visibility = 'visible';

    document.getElementById('dropdownButton').addEventListener('click', () => {
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('open');
        }
    });
};

function updateDropdownContent() {
    let checkboxHTML = `<label><input type="checkbox" value="-1" checked> All</label>`;
    filteredData.headers.forEach( (component, i) => {
    checkboxHTML += `
        <label><input type="checkbox" value="${i}" checked> ${component}</label>
    `;
    });
    document.getElementById('checkboxList').innerHTML = checkboxHTML;
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

    let filterBtn = applyFilterBtn;
    if (alreadyLoaded) {
        filterBtn.replaceWith(filterBtn.cloneNode(true));
        filterBtn = document.getElementById('applyFilter');
    }
    filterBtn.addEventListener('click', () => {
        selectedIndexes = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value))
            .filter(cb => cb >= 0);
        if(!selectedIndexes.includes(0)) selectedIndexes.unshift(0);
        filteredData.headers = selectedIndexes.map(index => globalData.headers[index]);
        filteredData.records = getSelectedRecords(recordSelect.value, selectedIndexes);
        if(currentSort.column > filteredData.headers.length) currentSort.column = null;
        renderTable(filteredData.records);
        dropdown.classList.remove('open');
        if (searchInput.value !== '') searchInput.value = '';
    });

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allCheckbox = checkboxes[0]; // eerste checkbox is "All"
            const otherCheckboxes = Array.from(checkboxes).slice(1);

            if (checkbox === allCheckbox) {
            // Als "All" wordt gewijzigd
                otherCheckboxes.forEach(cb => cb.checked = allCheckbox.checked);
            } else {
            // Als een andere checkbox wordt gewijzigd
                if (!checkbox.checked) {
                    allCheckbox.checked = false;
                } else if (otherCheckboxes.every(cb => cb.checked)) {
                    allCheckbox.checked = true;
                }
            }
        });
    });
};

document.getElementById('records-select').addEventListener('change', () => {
    filteredData.records = getSelectedRecords(document.getElementById('records-select').value, selectedIndexes);
    if(filteredData.records.length === 0) return;
    if(currentSort.column !== null) {
        const colIndex = currentSort.column;
        sortTable(colIndex, filteredData.records);
    } else {
        renderTable(filteredData.records);
    }
    const searchInput = document.getElementById('searchInput');
    if (searchInput.value !== '') searchInput.value = '';
});
    
document.getElementById('searchInput').addEventListener('input', function () {
    let query = this.value;
    // Als de query een datum is in de vorm d/m of d/m/, maak alleen maand 0-padded
    query = query.replace(/^(\d{1,2})\/(\d{1,2})(\/)?$/, (match, d, m, slash) => {
        const month = m.padStart(2, '0');
        return slash ? `${d}/${month}/` : `${d}/${month}`;
    });
    const filtered = filteredData.records.filter(row => {
        if (!query) return true;
        const cell = String(row[0]).toLowerCase();
        return cell.startsWith(query.toLowerCase());
    });
    renderTable(filtered);
});

document.getElementById('fileInput').addEventListener('change', handleFile);

function getSelectedRecords(num, selectedHeaders) {
    if (selectedHeaders.length === 0) {
        return [];
    }
    let filtered = [];
    if (num === "0" || 0) {
        filtered = globalData.records;
    } else {
        const now = new Date();
        const cutoff = new Date(now.getFullYear(), now.getMonth() - num, now.getDate());
        filtered = globalData.records.filter(row => {
            const rawDate = row[0];
            const parsed = parseDate(rawDate);
            return parsed && parsed >= cutoff;
        });
    }
    const filteredAndTruncated = filtered.map(f => selectedHeaders.map(a => f[a]));
    return filteredAndTruncated;
};

function parseDate(dateStr) {
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second);
};

function exportToCSV() {
    const headers = filteredData.headers.join(';');
    const rows = filteredData.records.map(r => r.join(';')).join('\n');
    const csv = headers + '\n' + rows;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
};

function makeDropdownMenu() {
    const selectRecord = document.getElementById('records-select');
    for(let i = 6; i >= 2; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Laatste ${i} maanden`;
        selectRecord.appendChild(option);
    }
    let html = `
        <option value="1">Laatste maand</option>
        <option value="0">All records</option>
    `;
    selectRecord.innerHTML += html;   
};

document.addEventListener('DOMContentLoaded', () => {
    makeDropdownMenu();
})