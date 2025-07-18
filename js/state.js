export const state = {
    currentVehicleId: null,
    editingState: { logType: null, id: null },
    logPaging: {
        driveLog: { currentPage: 1 },
        refuelLog: { currentPage: 1 },
        maintLog: { currentPage: 1 }
    },
    vehicles: {}
};

export const ITEMS_PER_PAGE = 5;
