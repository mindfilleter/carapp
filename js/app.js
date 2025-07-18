import { DOM } from './dom.js';
import { state } from './state.js';
import * as api from './api.js';
import * as ui from './ui.js';
import { setupAllEventListeners, setupVehicleSwitching } from './events.js';
import * as templates from './templates.js';
import * as dashboard from './dashboard.js';

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
    dashboard.updateDashboard();
}

function initialize() {
    state.vehicles = api.getVehicles();
    const initialVehicleId = Object.keys(state.vehicles)[0];
    
    ui.renderVehicleSelector();
    ui.renderVehicleManagementList();
    
    // Pass the necessary controller functions to the event setup module
    setupAllEventListeners({
        renderAllLogs,
        calculateAndDisplayMPG: ui.calculateAndDisplayMPG,
        calculateAndDisplayCostPerMile: ui.calculateAndDisplayCostPerMile,
        prepopulateLogFields: ui.prepopulateLogFields
    });
    
    setupVehicleSwitching(switchVehicle);
    dashboard.setupDashboardEventListeners();
    
    switchVehicle(initialVehicleId);
    ui.setDefaultDateTime();
}

initialize();
