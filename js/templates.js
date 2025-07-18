export function renderDriveLogEntry(log) {
    return `
        <div class="bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-start flex-wrap gap-x-4">
                <p class="font-bold text-stone-700 dark:text-stone-300">${log.date}</p>
                <p class="text-sm text-stone-600 dark:text-stone-400">Distance: ${log.end_mileage - log.start_mileage} mi</p>
            </div>
            <div class="flex justify-between items-start flex-wrap gap-x-4 mt-1">
                <p class="text-sm text-stone-600 dark:text-stone-400">Time: ${log.start_time} - ${log.end_time}</p>
                <p class="text-sm text-stone-600 dark:text-stone-400">Fuel: ${log.start_fuel}/16 → ${log.end_fuel}/16</p>
            </div>
             <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">Route: ${log.start_location || 'N/A'} to ${log.end_location || 'N/A'}</p>
            ${log.notes ? `<p class="mt-2 text-sm italic bg-stone-100 dark:bg-stone-800 p-2 rounded">"${log.notes}"</p>` : ''}
            <div class="text-right mt-2 space-x-2">
                <button class="edit-btn text-xs text-blue-500" data-id="${log.id}" data-log-type="driveLog">Edit</button>
                <button class="delete-btn text-xs text-red-500" data-id="${log.id}" data-log-type="driveLog">Delete</button>
            </div>
        </div>
    `;
}

export function renderRefuelLogEntry(log) {
    return `
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
}

export function renderMaintLogEntry(log) {
    return `
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
}
