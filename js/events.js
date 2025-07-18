import { DOM } from './dom.js';
import { state, ITEMS_PER_PAGE } from './state.js';
import * as api from './api.js';
import * as ui from './ui.js';
import * as templates from './templates.js';

let controllerFuncs = {};

export function attachChecklistListeners() {
    document.querySelectorAll('.checklist-item').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('completed'));
    });
    document.querySelectorAll('.reset-btn').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.resetTarget;
            document.querySelectorAll(`#${target} .checklist-item`).forEach(item => item.classList.remove('completed'));
        });
    });
}

export function attachSubNavListeners() {
     document.querySelectorAll('.sub-nav-container').forEach(container => {
        const buttons = container.querySelectorAll('.sub-nav-button');
        const sections = container.querySelectorAll('.sub-content-section');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const clickedButton = e.currentTarget;
                const subTargetId = clickedButton.dataset.subtarget;

                buttons.forEach(btn => btn.classList.remove('active'));
                sections.forEach(sec => sec.classList.remove('active'));
                
                clickedButton.classList.add('active');
                container.querySelector(`#${subTargetId}`).classList.add('active');
                ui.prepopulateLogFields();
            });
        });
    });
}

function handleFormSubmit(formId, logKeyPrefix, logName, renderFn, displayId, paginationId, pageState) {
     const form = document.getElementById(formId);
     if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const logKey = `${state.currentVehicleId}_${logKeyPrefix}`;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const logs = api.getLogs(logKey);
            
            if (state.editingState.id && state.editingState.logType === logKeyPrefix) {
                const index = logs.findIndex(log => log.id === state.editingState.id);
                if (index > -1) {
                    data.id = state.editingState.id;
                    logs[index] = data;
                }
                state.editingState.id = null;
                state.editingState.logType = null;
                ui.showToast(`${logName} entry updated.`);
                form.querySelector('button[type="submit"]').textContent = `Add/Update ${logName}`;
            } else {
                data.id = Date.now();
                logs.push(data);
                ui.showToast(`${logName} entry saved.`);
            }
            
            api.saveLogs(logKey, logs);
            controllerFuncs.renderAllLogs();
            controllerFuncs.calculateAndDisplayMPG();
            controllerFuncs.calculateAndDisplayCostPerMile();
            form.reset();
            ui.setDefaultDateTime();
            controllerFuncs.prepopulateLogFields();
        });
     }
};

function handleClearLog(buttonId, logKeyPrefix, logName, displayId, renderFn, paginationId, pageState) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => {
            const logKey = `${state.currentVehicleId}_${logKeyPrefix}`;
            api.clearLogs(logKey);
            controllerFuncs.renderAllLogs();
            controllerFuncs.calculateAndDisplayMPG();
            controllerFuncs.calculateAndDisplayCostPerMile();
            ui.showToast(`${logName} cleared.`);
        });
    }
};

function setupLogEventListeners() {
    DOM.contentSections.forEach(section => {
        if (section.id === 'logs') {
            section.addEventListener('click', e => {
                const logType = e.target.dataset.logType;
                if (logType) {
                    const logId = parseInt(e.target.dataset.id);
                    const logKey = `${state.currentVehicleId}_${logType}`;
                    let logs = api.getLogs(logKey);
                    
                    if (e.target.classList.contains('delete-btn')) {
                        if (confirm('Are you sure you want to delete this entry?')) {
                            logs = logs.filter(log => log.id !== logId);
                            api.saveLogs(logKey, logs);
                            controllerFuncs.renderAllLogs();
                            controllerFuncs.calculateAndDisplayMPG();
                            controllerFuncs.calculateAndDisplayCostPerMile();
                            ui.showToast("Log entry deleted.");
                        }
                    }

                    if (e.target.classList.contains('edit-btn')) {
                        const logToEdit = logs.find(log => log.id === logId);
                        if (logToEdit) {
                            state.editingState = { logType, id: logId };
                            const form = document.getElementById(`${logType.replace('Log', '')}-log-form`);
                            if (form) {
                                Object.keys(logToEdit).forEach(key => {
                                    if(form.elements[key]) {
                                        form.elements[key].value = logToEdit[key];
                                    }
                                });
                                form.querySelector('button[type="submit"]').textContent = `Update ${logType.replace('Log', ' Log')}`;
                                form.scrollIntoView({ behavior: 'smooth' });
                            }
                        }
                    }
                }

                if (e.target.classList.contains('pagination-btn')) {
                    const logKey = e.target.dataset.logKey;
                    const logKeyPrefix = logKey.replace(`${state.currentVehicleId}_`, '');
                    if (e.target.classList.contains('next-page-btn')) {
                        state.logPaging[logKeyPrefix].currentPage++;
                    } else if (e.target.classList.contains('prev-page-btn')) {
                        state.logPaging[logKeyPrefix].currentPage--;
                    }
                    controllerFuncs.renderAllLogs();
                }
            });
        }
    });
}

function setupDataManagementEventListeners() {
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
            printContent += `<div><p><strong>Date:</strong> ${log.date} | <strong>Time:</strong> ${log.start_time} - ${log.end_time}</p><p><strong>Route:</strong> ${log.start_location || 'N/A'} to ${log.end_location || 'N/A'}</p><p><strong>Mileage:</strong> ${log.start_mileage} - ${log.end_mileage}</p><p><strong>Notes:</strong> ${log.notes || 'N/A'}</p></div>`;
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
}

function setupVehicleManagementEventListeners() {
    DOM.vehicleListContainer.addEventListener('click', e => {
        if (e.target.matches('.edit-vehicle-btn')) {
            const vehicleId = e.target.dataset.id;
            ui.openVehicleEditor(vehicleId);
        }
        if (e.target.matches('.delete-vehicle-btn')) {
            const vehicleId = e.target.dataset.id;
            if (confirm(`Are you sure you want to delete ${state.vehicles[vehicleId].name}? This will also delete all associated logs.`)) {
                const keysToDelete = Object.keys(localStorage).filter(key => key.startsWith(vehicleId));
                keysToDelete.forEach(key => localStorage.removeItem(key));
                
                delete state.vehicles[vehicleId];
                api.saveVehicles(state.vehicles);

                ui.showToast('Vehicle deleted. Reloading...');
                setTimeout(() => location.reload(), 1500);
            }
        }
    });

    DOM.addVehicleBtn.addEventListener('click', () => ui.openVehicleEditor());
    DOM.cancelVehicleEditBtn.addEventListener('click', () => DOM.vehicleEditorModal.classList.add('hidden'));

    DOM.vehicleEditorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const vehicleId = document.getElementById('editor-vehicle-id').value;
        const newVehicleData = {
            name: document.getElementById('editor-name').value,
            info: {
                make: document.getElementById('editor-make').value,
                model: document.getElementById('editor-model').value,
                year: document.getElementById('editor-year').value,
                vin: '', plate: '', state: '', expiryMonth: '', expiryYear: ''
            },
            checklists: { tabs: [] },
            emergencyContent: '',
            maintenanceIntervals: ''
        };

        document.querySelectorAll('#checklist-editor-container > div').forEach((tabDiv, index) => {
            const tabName = tabDiv.querySelector('.tab-name-input').value;
            const tabId = `checklist_${index}_${Date.now()}`;
            newVehicleData.checklists.tabs.push({ id: tabId, name: tabName });
            newVehicleData.checklists[tabId] = { title: tabName, items: [] };

            tabDiv.querySelectorAll('.checklist-items-editor > div').forEach(itemDiv => {
                const title = itemDiv.querySelector('.item-title-input').value;
                const description = itemDiv.querySelector('.item-description-input').value;
                newVehicleData.checklists[tabId].items.push({ title, description });
            });
        });

        state.vehicles[vehicleId] = newVehicleData;
        api.saveVehicles(state.vehicles);
        
        DOM.vehicleEditorModal.classList.add('hidden');
        ui.showToast('Vehicle saved! Reloading...');
        setTimeout(() => location.reload(), 1500);
    });

    DOM.addChecklistTabBtn.addEventListener('click', () => ui.addChecklistTabToEditor());
}

export function setupAllEventListeners(controllers) {
    controllerFuncs = controllers;

    DOM.mainNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            DOM.mainNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            DOM.contentSections.forEach(section => {
                section.classList.toggle('active', section.id === targetId);
            });
        });
    });

    handleFormSubmit('drive-log-form', 'driveLog', 'Drive Log', templates.renderDriveLogEntry, 'drive-log-display', 'drive-log-pagination', state.logPaging.driveLog);
    handleFormSubmit('refuel-log-form', 'refuelLog', 'Refueling Log', templates.renderRefuelLogEntry, 'refuel-log-display', 'refuel-log-pagination', state.logPaging.refuelLog);
    handleFormSubmit('maint-log-form', 'maintLog', 'Maintenance Log', templates.renderMaintLogEntry, 'maint-log-display', 'maint-log-pagination', state.logPaging.maintLog);
    
    handleClearLog('clear-drive-log', 'driveLog', 'Drive Log', 'drive-log-display', templates.renderDriveLogEntry, 'drive-log-pagination', state.logPaging.driveLog);
    handleClearLog('clear-refuel-log', 'refuelLog', 'Refueling Log', 'refuel-log-display', templates.renderRefuelLogEntry, 'refuel-log-pagination', state.logPaging.refuelLog);
    handleClearLog('clear-maint-log', 'maintLog', 'Maintenance Log', 'maint-log-display', templates.renderMaintLogEntry, 'maint-log-pagination', state.logPaging.maintLog);

    setupLogEventListeners();
    setupDataManagementEventListeners();
    setupVehicleManagementEventListeners();
}

export function setupVehicleSwitching(switchVehicle) {
    DOM.vehicleSelectorContainer.addEventListener('click', (e) => {
        if (e.target.matches('.vehicle-selector-btn')) {
            switchVehicle(e.target.dataset.vehicle);
        }
    });
}
