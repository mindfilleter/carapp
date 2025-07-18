import { DOM } from './dom.js';
import { state, ITEMS_PER_PAGE } from './state.js';
import * as api from './api.js';
import * as ui from './ui.js';
import * as templates from './templates.js';

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
            ui.renderLogs(logKey, displayId, renderFn, paginationId, pageState);
            ui.calculateAndDisplayMPG();
            ui.calculateAndDisplayCostPerMile();
            form.reset();
            ui.setDefaultDates();
        });
     }
};

function handleClearLog(buttonId, logKeyPrefix, logName, displayId, renderFn, paginationId, pageState) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => {
            const logKey = `${state.currentVehicleId}_${logKeyPrefix}`;
            api.clearLogs(logKey);
            ui.renderLogs(logKey, displayId, renderFn, paginationId, pageState);
            ui.calculateAndDisplayMPG();
            ui.calculateAndDisplayCostPerMile();
            ui.showToast(`${logName} cleared.`);
        });
    }
};

export function setupAllEventListeners() {
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
}
