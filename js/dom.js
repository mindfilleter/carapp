export const DOM = {
    vehicleSelectorContainer: document.getElementById('vehicle-selector-container'),
    vehicleTitle: document.getElementById('vehicle-title'),
    checklistIntro: document.getElementById('checklist-intro'),
    checklistTabsContainer: document.getElementById('checklist-tabs'),
    checklistContentContainer: document.getElementById('checklist-content'),
    emergencyContentContainer: document.getElementById('emergency-content'),
    maintenanceIntervalsContainer: document.getElementById('maintenance-intervals-display'),
    
    infoForm: document.getElementById('vehicle-info-form'),
    infoInputs: document.querySelectorAll('#vehicle-info-form input'),
    infoSelects: document.querySelectorAll('#vehicle-info-form select'),
    editInfoBtn: document.getElementById('edit-info-btn'),
    saveInfoBtn: document.getElementById('save-info-btn'),
    expiryStatusEl: document.getElementById('expiry-status'),

    mainNavButtons: document.querySelectorAll('.main-nav-button'),
    contentSections: document.querySelectorAll('.content-section'),

    toastElement: document.getElementById('toast'),

    printLogsBtn: document.getElementById('print-logs-btn'),
    backupDataBtn: document.getElementById('backup-data-btn'),
    restoreFileInput: document.getElementById('restore-file-input'),
    printChecklistsBtn: document.getElementById('print-checklists-btn'),

    vehicleListContainer: document.getElementById('vehicle-list'),
    addVehicleBtn: document.getElementById('add-vehicle-btn'),
    vehicleEditorModal: document.getElementById('vehicle-editor-modal'),
    vehicleEditorForm: document.getElementById('vehicle-editor-form'),
    cancelVehicleEditBtn: document.getElementById('cancel-vehicle-edit'),
    addChecklistTabBtn: document.getElementById('add-checklist-tab-btn'),

    logForms: {
        driveLog: document.getElementById('drive-log-form'),
        refuelLog: document.getElementById('refuel-log-form'),
        maintLog: document.getElementById('maint-log-form')
    },
    logDisplays: {
        driveLog: document.getElementById('drive-log-display'),
        refuelLog: document.getElementById('refuel-log-display'),
        maintLog: document.getElementById('maint-log-display')
    },
    logPaginations: {
        driveLog: document.getElementById('drive-log-pagination'),
        refuelLog: document.getElementById('refuel-log-pagination'),
        maintLog: document.getElementById('maint-log-pagination')
    },
    logClearButtons: {
        driveLog: document.getElementById('clear-drive-log'),
        refuelLog: document.getElementById('clear-refuel-log'),
        maintLog: document.getElementById('clear-maint-log')
    }
};
