import { DOM } from './dom.js';
import { state } from './state.js';
import * as api from './api.js';
import * as ui from './ui.js';
import { setupAllEventListeners } from './events.js';
import * as templates from './templates.js';

function initialize() {
    state.vehicles = api.getVehicles();
    const initialVehicleId = Object.keys(state.vehicles)[0];
    
    ui.renderVehicleSelector();
    switchVehicle(initialVehicleId);
    
    setupAllEventListeners();
    setupVehicleSwitching();
    ui.setDefaultDateTime();
    ui.prepopulateLogFields();
}

function renderAllLogs() {
    ui.renderLogs(`${state.currentVehicleId}_driveLog`, 'drive-log-display', templates.renderDriveLogEntry, 'drive-log-pagination', state.logPaging.driveLog);
    ui.renderLogs(`${state.currentVehicleId}_refuelLog`, 'refuel-log-display', templates.renderRefuelLogEntry, 'refuel-log-pagination', state.logPaging.refuelLog);
    ui.renderLogs(`${state.currentVehicleId}_maintLog`, 'maint-log-display', templates.renderMaintLogEntry, 'maint-log-pagination', state.logPaging.maintLog);
}

function switchVehicle(vehicleId) {
    state.currentVehicleId = vehicleId;
    const data = state.vehicles[state.currentVehicleId];
    
    document.querySelectorAll('.vehicle-selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vehicle === vehicleId);
    });

    DOM.vehicleTitle.textContent = data.name;
    DOM.checklistIntro.textContent = data.checklistIntro;

    ui.renderChecklists();
    ui.renderVehicleInfo();
    
    DOM.emergencyContentContainer.innerHTML = data.emergencyContent || '<p class="text-center italic">No emergency procedures defined for this vehicle.</p>';
    DOM.maintenanceIntervalsContainer.innerHTML = data.maintenanceIntervals || '<p class="text-center italic">No maintenance intervals defined for this vehicle.</p>';

    renderAllLogs();
    ui.calculateAndDisplayMPG();
    ui.calculateAndDisplayCostPerMile();
    ui.prepopulateLogFields();
}

function setupVehicleSwitching() {
    DOM.vehicleSelectorContainer.addEventListener('click', (e) => {
        if (e.target.matches('.vehicle-selector-btn')) {
            switchVehicle(e.target.dataset.vehicle);
        }
    });
}

// Data Management Functions
DOM.printChecklistsBtn.addEventListener('click', () => {
    const vehicleName = state.vehicles[state.currentVehicleId].name;
    const checklists = state.vehicles[state.currentVehicleId].checklists;
    let printContent = `
        <html>
            <head><title>Checklists for ${vehicleName}</title>
            <style>
                body { font-family: sans-serif; margin: 2em; }
                h1, h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                ul { list-style-type: none; padding-left: 0; }
                li { margin-bottom: 10px; }
                .checklist { page-break-after: always; }
                .checklist:last-child { page-break-after: auto; }
            </style>
            </head>
            <body>
                <h1>Checklists for ${vehicleName}</h1>
    `;

    checklists.tabs.forEach(tab => {
        const checklist = checklists[tab.id];
        printContent += `<div class="checklist"><h2>${checklist.title}</h2><ul>`;
        checklist.items.forEach(item => {
            printContent += `<li><strong>[ ] ${item.title}:</strong> ${item.description}</li>`;
        });
        printContent += `</ul></div>`;
    });

    printContent += '</body></html>';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
});

DOM.printLogsBtn.addEventListener('click', () => {
    const vehicleName = state.vehicles[state.currentVehicleId].name;
    const driveLogs = api.getLogs(`${state.currentVehicleId}_driveLog`);
    const refuelLogs = api.getLogs(`${state.currentVehicleId}_refuelLog`);
    const maintLogs = api.getLogs(`${state.currentVehicleId}_maintLog`);

    let printContent = `
        <html>
            <head><title>Logs for ${vehicleName}</title>
            <style>
                body { font-family: sans-serif; margin: 2em; }
                h1, h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                div { border: 1px solid #eee; padding: 10px; margin-bottom: 10px; page-break-inside: avoid; }
                p { margin: 0 0 5px 0; }
            </style>
            </head>
            <body>
                <h1>Logs for ${vehicleName}</h1>
    `;

    printContent += '<h2>Drive Logs</h2>';
    driveLogs.forEach(log => {
        printContent += `<div><p><strong>Date:</strong> ${log.date} | <strong>Time:</strong> ${log.start_time} - ${log.end_time}</p><p><strong>Route:</strong> ${log.start_location || 'N/A'} to ${log.end_location || 'N/A'}</p><p><strong>Mileage:</strong> ${log.start_mileage} - ${log.end_mileage}</p><p><strong>Fuel:</strong> ${log.start_fuel}/16 → ${log.end_fuel}/16</p><p><strong>Notes:</strong> ${log.notes || 'N/A'}</p></div>`;
    });

    printContent += '<h2>Refueling Logs</h2>';
    refuelLogs.forEach(log => {
        printContent += `<div><p><strong>Date:</strong> ${log.date} | <strong>Mileage:</strong> ${log.mileage}</p><p><strong>Station:</strong> ${log.station_name || 'N/A'}</p><p><strong>Details:</strong> ${log.gallons} gal @ $${log.price_per_gallon}/gal = $${log.total_cost}</p></div>`;
    });

    printContent += '<h2>Maintenance Logs</h2>';
    maintLogs.forEach(log => {
        printContent += `<div><p><strong>Date:</strong> ${log.date} | <strong>Mileage:</strong> ${log.mileage}</p><p><strong>Service:</strong> ${log.service}</p><p><strong>Cost:</strong> $${log.cost || '0.00'}</p><p><strong>Notes:</strong> ${log.notes || 'N/A'}</p></div>`;
    });

    printContent += '</body></html>';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
});

DOM.backupDataBtn.addEventListener('click', () => {
    const backupData = api.getBackupData();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'vehicle_handbook_backup.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    ui.showToast('Backup downloaded!');
});

DOM.restoreFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const backupData = JSON.parse(event.target.result);
            api.restoreBackupData(backupData);
            ui.showToast('Data restored successfully! Reloading...');
            setTimeout(() => location.reload(), 2000);
        } catch (err) {
            ui.showToast('Error: Invalid backup file.');
            console.error("Restore error:", err);
        }
    };
    reader.readAsText(file);
});

initialize();
