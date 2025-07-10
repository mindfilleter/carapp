document.addEventListener('DOMContentLoaded', () => {
    // This script assumes `vehicleData` is loaded from data.js
    
    let currentVehicleId = 'jeepLiberty';
    let editingState = { logType: null, id: null };
    let logPaging = {
        driveLog: { currentPage: 1 },
        refuelLog: { currentPage: 1 },
        maintLog: { currentPage: 1 }
    };
    const ITEMS_PER_PAGE = 5;

    const vehicleSelectorContainer = document.getElementById('vehicle-selector-container');
    const vehicleTitle = document.getElementById('vehicle-title');
    const checklistIntro = document.getElementById('checklist-intro');
    const checklistTabsContainer = document.getElementById('checklist-tabs');
    const checklistContentContainer = document.getElementById('checklist-content');
    const emergencyContentContainer = document.getElementById('emergency-content');
    const maintenanceIntervalsContainer = document.getElementById('maintenance-intervals-display');
    
    const infoForm = document.getElementById('vehicle-info-form');
    const infoInputs = infoForm.querySelectorAll('input');
    const infoSelects = infoForm.querySelectorAll('select');
    const editInfoBtn = document.getElementById('edit-info-btn');
    const saveInfoBtn = document.getElementById('save-info-btn');
    const expiryStatusEl = document.getElementById('expiry-status');
    const printLogsBtn = document.getElementById('print-logs-btn');
    const backupDataBtn = document.getElementById('backup-data-btn');
    const restoreFileInput = document.getElementById('restore-file-input');
    const printChecklistsBtn = document.getElementById('print-checklists-btn');
    const toastElement = document.getElementById('toast');
    const vehicleListContainer = document.getElementById('vehicle-list');
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    const vehicleEditorModal = document.getElementById('vehicle-editor-modal');
    const vehicleEditorForm = document.getElementById('vehicle-editor-form');
    const cancelVehicleEditBtn = document.getElementById('cancel-vehicle-edit');
    const addChecklistTabBtn = document.getElementById('add-checklist-tab-btn');

    function getVehicles() {
        const vehicles = JSON.parse(localStorage.getItem('vehicles'));
        if (vehicles && Object.keys(vehicles).length > 0) {
            return vehicles;
        }
        // If no vehicles in storage, load default and save it
        localStorage.setItem('vehicles', JSON.stringify(vehicleData));
        return vehicleData;
    }

    let vehicles = getVehicles();

    function switchVehicle(vehicleId) {
        currentVehicleId = vehicleId;
        const data = vehicles[currentVehicleId];
        
        document.querySelectorAll('.vehicle-selector-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.vehicle === vehicleId);
        });

        vehicleTitle.textContent = data.name;
        checklistIntro.textContent = data.checklistIntro;

        renderChecklists();
        renderVehicleInfo();
        
        emergencyContentContainer.innerHTML = data.emergencyContent || '<p class="text-center italic">No emergency procedures defined for this vehicle.</p>';
        maintenanceIntervalsContainer.innerHTML = data.maintenanceIntervals || '<p class="text-center italic">No maintenance intervals defined for this vehicle.</p>';

        renderAllLogs();
        calculateAndDisplayMPG();
        calculateAndDisplayCostPerMile();
    }

    function renderVehicleSelector() {
        vehicleSelectorContainer.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'inline-flex rounded-md shadow-sm';
        container.setAttribute('role', 'group');

        Object.keys(vehicles).forEach((key, index) => {
            const vehicle = vehicles[key];
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.vehicle = key;
            button.className = 'vehicle-selector-btn border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 py-2 px-4 text-sm font-medium text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700';
            if (index === 0) button.classList.add('rounded-l-lg');
            if (index === Object.keys(vehicles).length - 1) button.classList.add('rounded-r-md');
            button.textContent = vehicle.name;
            button.addEventListener('click', () => switchVehicle(key));
            container.appendChild(button);
        });
        vehicleSelectorContainer.appendChild(container);
    }
    
    function renderChecklists() {
        const data = vehicles[currentVehicleId];
        checklistTabsContainer.innerHTML = '';
        checklistContentContainer.innerHTML = '';

        if (!data.checklists || !data.checklists.tabs) {
             checklistContentContainer.innerHTML = '<p class="text-center italic">No checklists defined for this vehicle.</p>';
             return;
        }

        data.checklists.tabs.forEach((tab, index) => {
            const isActive = index === 0 ? 'active' : '';
            checklistTabsContainer.innerHTML += `
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

            checklistContentContainer.innerHTML += `
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
    
    function renderVehicleInfo() {
        const infoKey = `${currentVehicleId}_info`;
        const savedInfo = JSON.parse(localStorage.getItem(infoKey)) || vehicles[currentVehicleId].info;
        
        Object.keys(savedInfo).forEach(key => {
            const input = document.getElementById(`info-${key}`);
            if (input) {
                input.value = savedInfo[key];
            }
        });
        updateExpiryStatus();
    }

    function calculateDaysRemaining() {
        const month = document.getElementById('info-expiryMonth').value;
        const year = document.getElementById('info-expiryYear').value;

        if (month === '' || year === '' || year.length < 4) {
            return { text: 'No expiration date set.', color: 'text-stone-500' };
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const expiryDate = new Date(year, parseInt(month) + 1, 0);
        
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `Expired ${Math.abs(diffDays)} days ago.`, color: 'text-red-500' };
        } else if (diffDays === 0) {
            return { text: `Expires today!`, color: 'text-amber-500' };
        } else {
            return { text: `${diffDays} days until expiration.`, color: 'text-green-500' };
        }
    }

    function updateExpiryStatus() {
        const status = calculateDaysRemaining();
        expiryStatusEl.textContent = status.text;
        expiryStatusEl.className = `mt-2 text-sm font-medium ${status.color}`;
    }

    function setEditMode(isEditing) {
        infoInputs.forEach(input => input.readOnly = !isEditing);
        infoSelects.forEach(select => select.disabled = !isEditing);
        editInfoBtn.classList.toggle('hidden', isEditing);
        saveInfoBtn.classList.toggle('hidden', !isEditing);
    }

    editInfoBtn.addEventListener('click', () => setEditMode(true));

    saveInfoBtn.addEventListener('click', () => {
        const infoKey = `${currentVehicleId}_info`;
        const currentInfo = {};
        infoInputs.forEach(input => { currentInfo[input.name] = input.value; });
        infoSelects.forEach(select => { currentInfo[select.name] = select.value; });
        
        localStorage.setItem(infoKey, JSON.stringify(currentInfo));
        vehicles[currentVehicleId].info = currentInfo;
        localStorage.setItem('vehicles', JSON.stringify(vehicles));

        setEditMode(false);
        updateExpiryStatus();
        showToast('Vehicle info saved!');
    });
    
    document.getElementById('info-expiryMonth').addEventListener('change', updateExpiryStatus);
    document.getElementById('info-expiryYear').addEventListener('input', updateExpiryStatus);

    function attachChecklistListeners() {
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

    function attachSubNavListeners() {
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
    
    const mainNavButtons = document.querySelectorAll('.main-nav-button');
    const contentSections = document.querySelectorAll('.content-section');
    
    mainNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            mainNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            contentSections.forEach(section => {
                section.classList.toggle('active', section.id === targetId);
            });
        });
    });

    const showToast = (message) => {
        toastElement.textContent = message;
        toastElement.classList.remove('opacity-0', 'translate-y-4');
        toastElement.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toastElement.classList.remove('opacity-100', 'translate-y-0');
            toastElement.classList.add('opacity-0', 'translate-y-4');
        }, 3000);
    };

    const renderLogs = (logKey, displayId, renderFn, paginationId, pageState) => {
        const displayElement = document.getElementById(displayId);
        const paginationElement = document.getElementById(paginationId);
        
        const logs = JSON.parse(localStorage.getItem(logKey)) || [];
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
    };

    const renderDriveLogEntry = (log) => `
        <div class="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-start flex-wrap gap-x-4">
                <p class="font-bold text-stone-700 dark:text-stone-300">${log.date}</p>
                <p class="text-sm text-stone-600 dark:text-stone-400">Distance: ${log.end_mileage - log.start_mileage} mi</p>
            </div>
            <div class="flex justify-between items-start flex-wrap gap-x-4 mt-1">
                <p class="text-sm text-stone-600 dark:text-stone-400">Time: ${log.start_time} - ${log.end_time}</p>
                <p class="text-sm text-stone-600 dark:text-stone-400">Fuel: ${log.start_fuel} → ${log.end_fuel}</p>
            </div>
             <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">Route: ${log.start_location || 'N/A'} to ${log.end_location || 'N/A'}</p>
            ${log.notes ? `<p class="mt-2 text-sm italic bg-stone-100 dark:bg-stone-800 p-2 rounded">"${log.notes}"</p>` : ''}
            <div class="text-right mt-2 space-x-2">
                <button class="edit-btn text-xs text-blue-500" data-id="${log.id}" data-log-type="driveLog">Edit</button>
                <button class="delete-btn text-xs text-red-500" data-id="${log.id}" data-log-type="driveLog">Delete</button>
            </div>
        </div>
    `;

    const renderRefuelLogEntry = (log) => `
        <div class="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-stone-700 dark:text-stone-300">${log.station_name || 'Refuel'}</p>
                    <p class="text-sm text-stone-500 dark:text-stone-400">${log.date}</p>
                </div>
                <p class="text-sm text-stone-600 dark:text-stone-400">${log.mileage} mi</p>
            </div>
            <div class="mt-2 text-sm grid grid-cols-3 gap-2">
                <span>${log.gallons} gal</span>
                <span>@ $${log.price_per_gallon}/gal</span>
                <span class="font-semibold text-right">$${log.total_cost}</span>
            </div>
            <div class="text-right mt-2 space-x-2">
                <button class="edit-btn text-xs text-blue-500" data-id="${log.id}" data-log-type="refuelLog">Edit</button>
                <button class="delete-btn text-xs text-red-500" data-id="${log.id}" data-log-type="refuelLog">Delete</button>
            </div>
        </div>
    `;

    const renderMaintLogEntry = (log) => `
         <div class="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-start flex-wrap gap-x-4">
                <p class="font-bold text-stone-700 dark:text-stone-300">${log.service}</p>
                ${log.cost ? `<p class="font-semibold text-stone-700 dark:text-stone-300">$${log.cost}</p>` : ''}
            </div>
            <div class="flex justify-between items-start flex-wrap gap-x-4 text-sm text-stone-500 dark:text-stone-400">
                <span>${log.date}</span>
                <span>${log.mileage} mi</span>
            </div>
            ${log.notes ? `<p class="mt-2 text-sm italic bg-stone-100 dark:bg-stone-800 p-2 rounded">"${log.notes}"</p>` : ''}
            <div class="text-right mt-2 space-x-2">
                <button class="edit-btn text-xs text-blue-500" data-id="${log.id}" data-log-type="maintLog">Edit</button>
                <button class="delete-btn text-xs text-red-500" data-id="${log.id}" data-log-type="maintLog">Delete</button>
            </div>
        </div>
    `;
    
    const handleFormSubmit = (formId, logKeyPrefix, logName, renderFn, displayId, paginationId, pageState) => {
         const form = document.getElementById(formId);
         if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const logKey = `${currentVehicleId}_${logKeyPrefix}`;
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                const logs = JSON.parse(localStorage.getItem(logKey)) || [];
                
                if (editingState.id && editingState.logType === logKeyPrefix) {
                    const index = logs.findIndex(log => log.id === editingState.id);
                    if (index > -1) {
                        data.id = editingState.id;
                        logs[index] = data;
                    }
                    editingState.id = null;
                    editingState.logType = null;
                    showToast(`${logName} entry updated.`);
                    form.querySelector('button[type="submit"]').textContent = `Add/Update ${logName}`;
                } else {
                    data.id = Date.now();
                    logs.push(data);
                    showToast(`${logName} entry saved.`);
                }
                
                localStorage.setItem(logKey, JSON.stringify(logs));
                renderLogs(logKey, displayId, renderFn, paginationId, pageState);
                calculateAndDisplayMPG();
                calculateAndDisplayCostPerMile();
                form.reset();
            });
         }
    };
    
    const handleClearLog = (buttonId, logKeyPrefix, logName, displayId, renderFn, paginationId, pageState) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                const logKey = `${currentVehicleId}_${logKeyPrefix}`;
                localStorage.removeItem(logKey);
                renderLogs(logKey, displayId, renderFn, paginationId, pageState);
                calculateAndDisplayMPG();
                calculateAndDisplayCostPerMile();
                showToast(`${logName} cleared.`);
            });
        }
    };

    function setupLogEventListeners() {
        document.getElementById('logs').addEventListener('click', e => {
            const logType = e.target.dataset.logType;
            if (!logType) return;
            const logId = parseInt(e.target.dataset.id);

            const logKey = `${currentVehicleId}_${logType}`;
            let logs = JSON.parse(localStorage.getItem(logKey)) || [];
            
            if (e.target.classList.contains('delete-btn')) {
                if (confirm('Are you sure you want to delete this entry?')) {
                    logs = logs.filter(log => log.id !== logId);
                    localStorage.setItem(logKey, JSON.stringify(logs));
                    renderAllLogs();
                    calculateAndDisplayMPG();
                    calculateAndDisplayCostPerMile();
                    showToast("Log entry deleted.");
                }
            }

            if (e.target.classList.contains('edit-btn')) {
                const logToEdit = logs.find(log => log.id === logId);
                if (logToEdit) {
                    editingState = { logType, id: logId };
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

        document.getElementById('logs').addEventListener('click', e => {
            if (e.target.classList.contains('pagination-btn')) {
                const logKey = e.target.dataset.logKey;
                const logKeyPrefix = logKey.replace(`${currentVehicleId}_`, '');
                if (e.target.classList.contains('next-page-btn')) {
                    logPaging[logKeyPrefix].currentPage++;
                } else if (e.target.classList.contains('prev-page-btn')) {
                    logPaging[logKeyPrefix].currentPage--;
                }
                renderAllLogs();
            }
        });
    }
    
    function renderAllLogs() {
        renderLogs(`${currentVehicleId}_driveLog`, 'drive-log-display', renderDriveLogEntry, 'drive-log-pagination', logPaging.driveLog);
        renderLogs(`${currentVehicleId}_refuelLog`, 'refuel-log-display', renderRefuelLogEntry, 'refuel-log-pagination', logPaging.refuelLog);
        renderLogs(`${currentVehicleId}_maintLog`, 'maint-log-display', renderMaintLogEntry, 'maint-log-pagination', logPaging.maintLog);
    }

    function calculateAndDisplayMPG() {
        const mpgValueEl = document.getElementById('mpg-value');
        const logKey = `${currentVehicleId}_refuelLog`;
        const logs = JSON.parse(localStorage.getItem(logKey)) || [];
        
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

    function calculateAndDisplayCostPerMile() {
        const cpmValueEl = document.getElementById('cpm-value');
        const refuelLogKey = `${currentVehicleId}_refuelLog`;
        const maintLogKey = `${currentVehicleId}_maintLog`;

        const refuelLogs = JSON.parse(localStorage.getItem(refuelLogKey)) || [];
        const maintLogs = JSON.parse(localStorage.getItem(maintLogKey)) || [];

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

    // Data Management Functions
    printChecklistsBtn.addEventListener('click', () => {
        const vehicleName = vehicles[currentVehicleId].name;
        const checklists = vehicles[currentVehicleId].checklists;
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

    printLogsBtn.addEventListener('click', () => {
        const vehicleName = vehicles[currentVehicleId].name;
        const driveLogs = JSON.parse(localStorage.getItem(`${currentVehicleId}_driveLog`)) || [];
        const refuelLogs = JSON.parse(localStorage.getItem(`${currentVehicleId}_refuelLog`)) || [];
        const maintLogs = JSON.parse(localStorage.getItem(`${currentVehicleId}_maintLog`)) || [];

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

    backupDataBtn.addEventListener('click', () => {
        const backupData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === 'vehicles' || key.includes('_driveLog') || key.includes('_refuelLog') || key.includes('_maintLog') || key.includes('_info')) {
                backupData[key] = localStorage.getItem(key);
            }
        }
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = 'vehicle_handbook_backup.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Backup downloaded!');
    });

    restoreFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const backupData = JSON.parse(event.target.result);
                localStorage.clear();
                for (const key in backupData) {
                    if (Object.hasOwnProperty.call(backupData, key)) {
                        localStorage.setItem(key, backupData[key]);
                    }
                }
                showToast('Data restored successfully! Reloading...');
                setTimeout(() => location.reload(), 2000);
            } catch (err) {
                showToast('Error: Invalid backup file.');
                console.error("Restore error:", err);
            }
        };
        reader.readAsText(file);
    });

    // Vehicle Management
    function renderVehicleManagementList() {
        vehicleListContainer.innerHTML = '';
        Object.keys(vehicles).forEach(key => {
            const vehicle = vehicles[key];
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-stone-50 dark:bg-stone-900 p-3 rounded-md';
            div.innerHTML = `
                <span class="font-medium">${vehicle.name}</span>
                <div>
                    <button class="edit-vehicle-btn text-xs text-blue-500 mr-2" data-id="${key}">Edit</button>
                    <button class="delete-vehicle-btn text-xs text-red-500" data-id="${key}">Delete</button>
                </div>
            `;
            vehicleListContainer.appendChild(div);
        });

        document.querySelectorAll('.edit-vehicle-btn').forEach(btn => btn.addEventListener('click', handleEditVehicle));
        document.querySelectorAll('.delete-vehicle-btn').forEach(btn => btn.addEventListener('click', handleDeleteVehicle));
    }

    function handleEditVehicle(e) {
        const vehicleId = e.target.dataset.id;
        openVehicleEditor(vehicleId);
    }
    
    function handleDeleteVehicle(e) {
        const vehicleId = e.target.dataset.id;
        if (confirm(`Are you sure you want to delete ${vehicles[vehicleId].name}? This will also delete all associated logs.`)) {
            const keysToDelete = Object.keys(localStorage).filter(key => key.startsWith(vehicleId));
            keysToDelete.forEach(key => localStorage.removeItem(key));
            
            delete vehicles[vehicleId];
            localStorage.setItem('vehicles', JSON.stringify(vehicles));

            showToast('Vehicle deleted. Reloading...');
            setTimeout(() => location.reload(), 1500);
        }
    }

    function openVehicleEditor(vehicleId = null) {
        const isNew = vehicleId === null;
        const editorTitle = document.getElementById('vehicle-editor-title');
        const editorIdField = document.getElementById('editor-vehicle-id');
        const checklistEditor = document.getElementById('checklist-editor-container');
        
        editorTitle.textContent = isNew ? "Add New Vehicle" : "Edit Vehicle";
        vehicleEditorForm.reset();
        checklistEditor.innerHTML = '';

        if (isNew) {
            editorIdField.value = `vehicle_${Date.now()}`;
        } else {
            const vehicle = vehicles[vehicleId];
            editorIdField.value = vehicleId;
            document.getElementById('editor-name').value = vehicle.name;
            document.getElementById('editor-make').value = vehicle.info.make;
            document.getElementById('editor-model').value = vehicle.info.model;
            document.getElementById('editor-year').value = vehicle.info.year;

            if (vehicle.checklists && vehicle.checklists.tabs) {
                vehicle.checklists.tabs.forEach(tab => {
                    addChecklistTabToEditor(tab.name, vehicle.checklists[tab.id].items);
                });
            }
        }
        
        vehicleEditorModal.classList.remove('hidden');
    }

    function addChecklistTabToEditor(tabName = '', items = []) {
        const checklistEditor = document.getElementById('checklist-editor-container');
        const tabDiv = document.createElement('div');
        tabDiv.className = 'p-3 border rounded-md dark:border-stone-600 space-y-2';
        tabDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <input type="text" placeholder="Checklist Tab Name (e.g., Pre-Ride)" value="${tabName}" class="tab-name-input w-full p-1 border-b dark:bg-stone-700 dark:border-stone-500" required>
                <button type="button" class="remove-tab-btn text-red-500 ml-2 font-bold">X</button>
            </div>
            <div class="checklist-items-editor space-y-1"></div>
            <button type="button" class="add-item-btn text-xs bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600">+ Add Item</button>
        `;
        checklistEditor.appendChild(tabDiv);

        const itemsContainer = tabDiv.querySelector('.checklist-items-editor');
        items.forEach(item => addChecklistItemToEditor(itemsContainer, item.title, item.description));
        
        tabDiv.querySelector('.add-item-btn').addEventListener('click', () => addChecklistItemToEditor(itemsContainer));
        tabDiv.querySelector('.remove-tab-btn').addEventListener('click', () => tabDiv.remove());
    }

    function addChecklistItemToEditor(container, title = '', description = '') {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex items-center space-x-2';
        itemDiv.innerHTML = `
            <input type="text" placeholder="Item Title" value="${title}" class="item-title-input w-1/3 p-1 border rounded-md dark:bg-stone-600 dark:border-stone-500" required>
            <input type="text" placeholder="Item Description" value="${description}" class="item-description-input w-2/3 p-1 border rounded-md dark:bg-stone-600 dark:border-stone-500">
            <button type="button" class="remove-item-btn text-red-500 font-bold">X</button>
        `;
        container.appendChild(itemDiv);
        itemDiv.querySelector('.remove-item-btn').addEventListener('click', () => itemDiv.remove());
    }

    addVehicleBtn.addEventListener('click', () => openVehicleEditor());
    cancelVehicleEditBtn.addEventListener('click', () => vehicleEditorModal.classList.add('hidden'));
    addChecklistTabBtn.addEventListener('click', () => addChecklistTabToEditor());


    vehicleEditorForm.addEventListener('submit', (e) => {
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

        vehicles[vehicleId] = newVehicleData;
        localStorage.setItem('vehicles', JSON.stringify(vehicles));
        
        vehicleEditorModal.classList.add('hidden');
        showToast('Vehicle saved! Reloading...');
        setTimeout(() => location.reload(), 1500);
    });

    // Initial Load
    handleFormSubmit('drive-log-form', 'driveLog', 'Drive Log', renderDriveLogEntry, 'drive-log-display', 'drive-log-pagination', logPaging.driveLog);
    handleFormSubmit('refuel-log-form', 'refuelLog', 'Refueling Log', renderRefuelLogEntry, 'refuel-log-display', 'refuel-log-pagination', logPaging.refuelLog);
    handleFormSubmit('maint-log-form', 'maintLog', 'Maintenance Log', renderMaintLogEntry, 'maint-log-display', 'maint-log-pagination', logPaging.maintLog);
    
    handleClearLog('clear-drive-log', 'driveLog', 'Drive Log', 'drive-log-display', renderDriveLogEntry, 'drive-log-pagination', logPaging.driveLog);
    handleClearLog('clear-refuel-log', 'refuelLog', 'Refueling Log', 'refuel-log-display', renderRefuelLogEntry, 'refuel-log-pagination', logPaging.refuelLog);
    handleClearLog('clear-maint-log', 'maintLog', 'Maintenance Log', 'maint-log-display', renderMaintLogEntry, 'maint-log-pagination', logPaging.maintLog);
    
    setupLogEventListeners();
    renderVehicleManagementList();
    renderVehicleSelector();
    switchVehicle(Object.keys(vehicles)[0]);
});
