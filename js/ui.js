import { DOM } from './dom.js';
import { state, ITEMS_PER_PAGE } from './state.js';
import * as api from './api.js';
import { attachChecklistListeners, attachSubNavListeners } from './events.js';

export function showToast(message) {
    DOM.toastElement.textContent = message;
    DOM.toastElement.classList.remove('opacity-0', 'translate-y-4');
    DOM.toastElement.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
        DOM.toastElement.classList.remove('opacity-100', 'translate-y-0');
        DOM.toastElement.classList.add('opacity-0', 'translate-y-4');
    }, 3000);
}

export function setDefaultDateTime() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Set dates for all log forms
    DOM.logForms.driveLog.elements['date'].value = today;
    DOM.logForms.refuelLog.elements['date'].value = today;
    DOM.logForms.maintLog.elements['date'].value = today;
    
    // Set times for the drive log form
    DOM.logForms.driveLog.elements['start_time'].value = currentTime;
    DOM.logForms.driveLog.elements['end_time'].value = currentTime;
}

export function prepopulateLogFields() {
    if (state.editingState.id) return; // Don't prepopulate if editing

    const lastMileage = api.getLastMileage(state.currentVehicleId);
    if (lastMileage) {
        DOM.logForms.driveLog.elements['start_mileage'].value = lastMileage;
        DOM.logForms.refuelLog.elements['mileage'].value = lastMileage;
        DOM.logForms.maintLog.elements['mileage'].value = lastMileage;
    }

    const lastEndLocation = api.getLastEndLocation(state.currentVehicleId);
    if (lastEndLocation) {
        DOM.logForms.driveLog.elements['start_location'].value = lastEndLocation;
    }
}

export function renderLogs(logKey, displayId, renderFn, paginationId, pageState) {
    const displayElement = document.getElementById(displayId);
    const paginationElement = document.getElementById(paginationId);
    
    const logs = api.getLogs(logKey);
    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id);

    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
    pageState.currentPage = Math.min(pageState.currentPage, totalPages) || 1;
    
    const startIndex = (pageState.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    displayElement.innerHTML = '';
    if (paginatedLogs.length === 0) {
        displayElement.innerHTML = `<p class="text-center text-stone-500 dark:text-stone-400 italic">No log entries yet.</p>`;
        paginationElement.innerHTML = '';
        return;
    }
    paginatedLogs.forEach(log => {
        displayElement.innerHTML += renderFn(log);
    });

    paginationElement.innerHTML = `
        <button data-log-key="${logKey}" class="prev-page-btn pagination-btn px-3 py-1 text-sm bg-stone-200 dark:bg-stone-700 rounded-md" ${pageState.currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span class="text-sm text-stone-500 dark:text-stone-400">Page ${pageState.currentPage} of ${totalPages}</span>
        <button data-log-key="${logKey}" class="next-page-btn pagination-btn px-3 py-1 text-sm bg-stone-200 dark:bg-stone-700 rounded-md" ${pageState.currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
}

export function renderVehicleSelector() {
    DOM.vehicleSelectorContainer.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'inline-flex rounded-md shadow-sm';
    container.setAttribute('role', 'group');

    Object.keys(state.vehicles).forEach((key, index) => {
        const vehicle = state.vehicles[key];
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.vehicle = key;
        button.className = 'vehicle-selector-btn border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 py-2 px-4 text-sm font-medium text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700';
        if (index === 0) button.classList.add('rounded-l-lg');
        if (index === Object.keys(state.vehicles).length - 1) button.classList.add('rounded-r-md');
        button.textContent = vehicle.name;
        container.appendChild(button);
    });
    DOM.vehicleSelectorContainer.appendChild(container);
}

export function renderChecklists() {
    const data = state.vehicles[state.currentVehicleId];
    DOM.checklistTabsContainer.innerHTML = '';
    DOM.checklistContentContainer.innerHTML = '';

    if (!data.checklists || !data.checklists.tabs) {
         DOM.checklistContentContainer.innerHTML = '<p class="text-center italic">No checklists defined for this vehicle.</p>';
         return;
    }

    data.checklists.tabs.forEach((tab, index) => {
        const isActive = index === 0 ? 'active' : '';
        DOM.checklistTabsContainer.innerHTML += `
            <button data-subtarget="${tab.id}" class="sub-nav-button flex-1 p-3 text-sm sm:text-base font-medium text-stone-700 dark:text-stone-300 rounded-t-md ${isActive}">${tab.name}</button>
        `;
        
        const checklist = data.checklists[tab.id];
        let itemsHtml = '';
        if (checklist && checklist.items) {
            checklist.items.forEach(item => {
                itemsHtml += `
                    <div class="checklist-item border-l-4 border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 p-4 rounded-md flex items-center justify-between">
                        <div>
                            <h3 class="font-semibold">${item.title}</h3>
                            <p class="text-sm text-stone-600 dark:text-stone-400">${item.description}</p>
                        </div><span class="item-icon text-2xl">✓</span>
                    </div>`;
            });
        }

        DOM.checklistContentContainer.innerHTML += `
            <div id="${tab.id}" class="sub-content-section ${isActive}">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl sm:text-2xl font-semibold text-stone-700 dark:text-stone-300">${checklist ? checklist.title : 'Untitled'}</h2>
                    <button data-reset-target="${tab.id}" class="reset-btn text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Reset</button>
                </div>
                <div class="space-y-3">${itemsHtml}</div>
            </div>
        `;
    });
    
    attachChecklistListeners();
    attachSubNavListeners();
}

export function renderVehicleInfo() {
    const infoKey = `${state.currentVehicleId}_info`;
    const savedInfo = api.getVehicleInfo(infoKey, state.vehicles[state.currentVehicleId].info);
    
    Object.keys(savedInfo).forEach(key => {
        const input = document.getElementById(`info-${key}`);
        if (input) {
            input.value = savedInfo[key];
        }
    });
    updateExpiryStatus();
}

export function updateExpiryStatus() {
    const month = document.getElementById('info-expiryMonth').value;
    const year = document.getElementById('info-expiryYear').value;

    if (month === '' || year === '' || year.length < 4) {
        DOM.expiryStatusEl.textContent = 'No expiration date set.';
        DOM.expiryStatusEl.className = 'mt-2 text-sm font-medium text-stone-500';
        return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const expiryDate = new Date(year, parseInt(month) + 1, 0);
    
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        DOM.expiryStatusEl.textContent = `Expired ${Math.abs(diffDays)} days ago.`;
        DOM.expiryStatusEl.className = `mt-2 text-sm font-medium text-red-500`;
    } else if (diffDays === 0) {
        DOM.expiryStatusEl.textContent = `Expires today!`;
        DOM.expiryStatusEl.className = `mt-2 text-sm font-medium text-amber-500`;
    } else {
        DOM.expiryStatusEl.textContent = `${diffDays} days until expiration.`;
        DOM.expiryStatusEl.className = `mt-2 text-sm font-medium text-green-500`;
    }
}

export function calculateAndDisplayMPG() {
    const mpgValueEl = document.getElementById('mpg-value');
    const logKey = `${state.currentVehicleId}_refuelLog`;
    const logs = api.getLogs(logKey);
    
    if (logs.length < 2) {
        mpgValueEl.textContent = '-- MPG';
        return;
    }

    logs.sort((a, b) => parseInt(a.mileage) - parseInt(b.mileage));

    let totalMiles = 0;
    let totalGallons = 0;

    for (let i = 1; i < logs.length; i++) {
        const milesDriven = parseInt(logs[i].mileage) - parseInt(logs[i-1].mileage);
        const gallonsUsed = parseFloat(logs[i].gallons);
        if (milesDriven > 0 && gallonsUsed > 0) {
            totalMiles += milesDriven;
            totalGallons += gallonsUsed;
        }
    }

    if (totalGallons > 0) {
        const avgMpg = totalMiles / totalGallons;
        mpgValueEl.textContent = `${avgMpg.toFixed(1)} MPG`;
    } else {
        mpgValueEl.textContent = '-- MPG';
    }
}

export function calculateAndDisplayCostPerMile() {
    const cpmValueEl = document.getElementById('cpm-value');
    const refuelLogKey = `${state.currentVehicleId}_refuelLog`;
    const maintLogKey = `${state.currentVehicleId}_maintLog`;

    const refuelLogs = api.getLogs(refuelLogKey);
    const maintLogs = api.getLogs(maintLogKey);

    if (refuelLogs.length < 2) {
        cpmValueEl.textContent = '$-- / mi';
        return;
    }

    refuelLogs.sort((a, b) => parseInt(a.mileage) - parseInt(b.mileage));

    const totalMiles = parseInt(refuelLogs[refuelLogs.length - 1].mileage) - parseInt(refuelLogs[0].mileage);
    
    if (totalMiles <= 0) {
        cpmValueEl.textContent = '$-- / mi';
        return;
    }

    const totalFuelCost = refuelLogs.reduce((sum, log) => sum + parseFloat(log.total_cost || 0), 0);
    const totalMaintCost = maintLogs.reduce((sum, log) => sum + parseFloat(log.cost || 0), 0);

    const totalCost = totalFuelCost + totalMaintCost;
    const costPerMile = totalCost / totalMiles;

    cpmValueEl.textContent = `$${costPerMile.toFixed(2)} / mi`;
}
