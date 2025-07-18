// This module assumes `vehicleData` is loaded from the global scope via data.js
export function getVehicles() {
    const vehicles = JSON.parse(localStorage.getItem('vehicles'));
    if (vehicles && Object.keys(vehicles).length > 0) {
        return vehicles;
    }
    // If no vehicles in storage, load default and save it
    localStorage.setItem('vehicles', JSON.stringify(vehicleData));
    return vehicleData;
}

export function saveVehicles(vehicles) {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
}

export function getLogs(logKey) {
    return JSON.parse(localStorage.getItem(logKey)) || [];
}

export function saveLogs(logKey, logs) {
    localStorage.setItem(logKey, JSON.stringify(logs));
}

export function clearLogs(logKey) {
    localStorage.removeItem(logKey);
}

export function getVehicleInfo(infoKey, defaultInfo) {
    return JSON.parse(localStorage.getItem(infoKey)) || defaultInfo;
}

export function saveVehicleInfo(infoKey, infoData) {
    localStorage.setItem(infoKey, JSON.stringify(infoData));
}

export function getBackupData() {
    const backupData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === 'vehicles' || key.includes('_driveLog') || key.includes('_refuelLog') || key.includes('_maintLog') || key.includes('_info')) {
            backupData[key] = localStorage.getItem(key);
        }
    }
    return backupData;
}

export function restoreBackupData(backupData) {
    localStorage.clear();
    for (const key in backupData) {
        if (Object.hasOwnProperty.call(backupData, key)) {
            localStorage.setItem(key, backupData[key]);
        }
    }
}
