import { DOM } from './dom.js';
import { state } from './state.js';
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
                if (!logType) return;
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
            });

            section.addEventListener('click', e => {
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
}

export function setupVehicleSwitching(switchVehicle) {
    DOM.vehicleSelectorContainer.addEventListener('click', (e) => {
        if (e.target.matches('.vehicle-selector-btn')) {
            switchVehicle(e.target.dataset.vehicle);
        }
    });
}
