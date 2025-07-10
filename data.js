const vehicleData = {
    jeepLiberty: {
        name: "Jeep Liberty",
        info: { make: 'Jeep', model: 'Liberty', year: '2012', vin: '', plate: '', state: '', expiryMonth: '', expiryYear: '' },
        checklistIntro: "These are the routine checks to perform before and after every drive. Completing these checklists helps ensure your vehicle's safety and longevity.",
        checklists: {
            tabs: [
                { id: 'pre-drive', name: 'Pre-Drive' },
                { id: 'post-drive', name: 'Post-Drive' },
                { id: 'refueling', name: 'Refueling' }
            ],
            'pre-drive': {
                title: 'Pre-Drive: "Ready to Roll"',
                items: [
                    { title: 'Emergency Kit', description: 'Confirm presence of: Jumper cables, tire pressure/tread gauges, tire pump, first-aid kit, water, roadmap, multi-tool, jack, and tire iron.' },
                    { title: 'Tires', description: 'Visually inspect all four tires for obvious damage or significant wear (Recommended PSI: 33).' },
                    { title: 'Fluid Leaks', description: 'Glance under the vehicle for any new puddles or drips.' },
                    { title: 'Lights', description: 'Check headlights, turn signals, emergency flashers, and brake lights.' },
                    { title: 'Mirrors & Glass', description: 'Ensure all windows and mirrors are clean for clear visibility.' },
                    { title: "Driver's Area", description: 'Adjust seat and mirrors. Check instrument panel for warnings.' },
                    { title: '4WD System', description: 'Ensure selector is in 2H for normal, dry pavement driving.' },
                    { title: 'Seatbelt', description: 'Fasten seatbelt before starting the engine.' },
                    { title: 'Final Check', description: 'As you first move, confirm brakes are responsive at a slow speed.' }
                ]
            },
            'post-drive': {
                title: 'Post-Drive: "Secure & Noteworthy"',
                items: [
                    { title: 'Parking', description: 'Engage parking brake and shift transmission to PARK.' },
                    { title: 'Secure Vehicle', description: 'Turn off lights, lock all doors, and close all windows.' },
                    { title: 'Exterior Check', description: 'Briefly walk around to check for any new damage.' },
                    { title: 'Interior Check', description: 'Check for any personal belongings you may have left behind.' },
                    { title: 'Log Issues', description: 'Note any unusual noises, vibrations, or warning lights in the Drive Log.' }
                ]
            },
            'refueling': {
                title: 'Refueling Safety',
                items: [
                    { title: 'Engine Off', description: 'Ensure the vehicle is turned off completely.'},
                    { title: 'No Smoking', description: 'Extinguish all smoking materials.'},
                    { title: 'Correct Fuel', description: 'Confirm you are using 87 octane regular unleaded fuel.'},
                    { title: 'Don\'t Top Off', description: 'Stop fueling when the pump nozzle clicks off automatically.'},
                    { title: 'Tighten Gas Cap', description: 'Secure the gas cap until it clicks at least once.'}
                ]
            }
        },
        emergencyContent: `
            <div class="emergency-item bg-white dark:bg-stone-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold text-red-600 mb-3 flex items-center"><span class="text-2xl mr-2">⚠️</span>Check Engine Light</h3>
                <div class="space-y-4 text-stone-700 dark:text-stone-300">
                    <div><h4 class="font-semibold">If Light is SOLID:</h4><ul class="list-disc list-inside text-sm space-y-1 mt-1"><li>Check gas cap is tight.</li><li>Note any changes in vehicle performance.</li><li>Have the vehicle checked by a technician soon.</li></ul></div>
                    <div><h4 class="font-semibold text-red-700 dark:text-red-500">If Light is FLASHING:</h4><ul class="list-disc list-inside text-sm space-y-1 mt-1"><li>Reduce speed immediately.</li><li>Pull over to a safe location.</li><li>Turn off the engine.</li><li class="font-bold">Do not continue driving.</li><li>Call for roadside assistance.</li></ul></div>
                </div>
            </div>
            <div class="emergency-item bg-white dark:bg-stone-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold text-amber-600 mb-3 flex items-center"><span class="text-2xl mr-2">Tyre</span>Low Tire Pressure</h3>
                <div class="space-y-4 text-stone-700 dark:text-stone-300">
                    <div><h4 class="font-semibold">Immediate Actions:</h4><ul class="list-disc list-inside text-sm space-y-1 mt-1"><li>Reduce speed gradually.</li><li>Grip steering wheel firmly.</li><li>Pull over to a safe location.</li></ul></div>
                    <div><h4 class="font-semibold">Once Stopped:</h4><ul class="list-disc list-inside text-sm space-y-1 mt-1"><li>Visually inspect all tires.</li><li>If a tire is flat, use spare or call for help.</li><li>Check pressure of all tires (incl. spare).</li><li>Inflate to recommended pressure (33 PSI).</li></ul></div>
                </div>
            </div>
            <div class="emergency-item bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 md:col-span-2">
                <h3 class="text-xl font-semibold text-sky-600 mb-3 flex items-center"><span class="text-2xl mr-2">⚙️</span>4WD Engagement</h3>
                <div class="space-y-4 text-stone-700 dark:text-stone-300 text-sm">
                    <p><strong>Engage 4H (up to 50 mph):</strong> Move selector from 2H to 4H for low-traction surfaces.</p>
                    <p><strong>Engage 4L (2-3 mph only):</strong> Slow vehicle, shift transmission to NEUTRAL, move selector to 4L. Wait for "4WD LOW" light to be solid, then shift back into gear. Use only for extreme, low-speed situations.</p>
                    <p><strong>Disengage 4L (2-3 mph only):</strong> Slow vehicle, shift transmission to NEUTRAL, move selector to 4H or 2H. Wait for light to go out, then shift back into gear.</p>
                </div>
            </div>
            <div class="emergency-item bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 md:col-span-2">
                <h3 class="text-xl font-semibold text-yellow-500 mb-3 flex items-center"><span class="text-2xl mr-2">⚡️</span>Dead Battery - Jump Start</h3>
                <div class="space-y-2 text-stone-700 dark:text-stone-300 text-sm">
                    <p class="font-semibold">1. Connect Cables (Engines OFF):</p>
                    <ul class="list-decimal list-inside ml-4 space-y-1">
                        <li><span class="text-red-500 font-bold">RED</span> clamp to <span class="text-red-500 font-bold">POSITIVE (+)</span> on DEAD battery.</li>
                        <li>Other <span class="text-red-500 font-bold">RED</span> clamp to <span class="text-red-500 font-bold">POSITIVE (+)</span> on GOOD battery.</li>
                        <li><span class="text-stone-800 dark:text-stone-200 font-bold">BLACK</span> clamp to <span class="text-stone-800 dark:text-stone-200 font-bold">NEGATIVE (-)</span> on GOOD battery.</li>
                        <li>Final <span class="text-stone-800 dark:text-stone-200 font-bold">BLACK</span> clamp to an unpainted metal surface on the DEAD vehicle, away from the battery.</li>
                    </ul>
                    <p class="font-semibold mt-2">2. Start & Remove:</p>
                    <ul class="list-decimal list-inside ml-4 space-y-1">
                        <li>Start the working vehicle; let it run for a few minutes.</li>
                        <li>Attempt to start the dead vehicle.</li>
                        <li>If it starts, remove cables in the EXACT REVERSE order.</li>
                        <li>Let the jumped vehicle run for at least 15 minutes to charge.</li>
                    </ul>
                </div>
            </div>`,
        maintenanceIntervals: `
            <h3 class="text-lg sm:text-xl font-semibold text-stone-700 dark:text-stone-300 mb-3">Recommended Intervals</h3>
            <ul class="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 text-sm">
                <li><strong>Every 8,000 Miles:</strong> Change Engine Oil & Filter (SAE 5W-20 Synthetic, MS-6395), Rotate Tires.</li>
                <li><strong>Every 16,000 Miles:</strong> Inspect Brake Linings, CV Joints, Exhaust, Front Suspension.</li>
                <li><strong>Every 32,000 Miles:</strong> Replace Engine Air Filter, Inspect Axle Fluid.</li>
                <li><strong>At 100,000 Miles:</strong> Replace Spark Plugs, Flush & Replace Engine Coolant.</li>
            </ul>`
    },
    hondaGoldwing: {
        name: "Honda Goldwing",
        info: { make: 'Honda', model: 'Goldwing', year: '2019', vin: '', plate: '', state: '', expiryMonth: '', expiryYear: '' },
        checklistIntro: "A motorcycle requires careful inspection before every ride. Use this T-CLOCS checklist to ensure your Goldwing is safe and ready.",
        checklists: {
            tabs: [
                { id: 'pre-ride-moto', name: 'Pre-Ride' },
                { id: 'post-ride-moto', name: 'Post-Ride' },
                 { id: 'refueling-moto', name: 'Refueling' }
            ],
            'pre-ride-moto': {
                title: 'Pre-Ride Checklist (T-CLOCS)',
                items: [
                    { title: 'Emergency Kit', description: 'Confirm presence of: Jumper cables, tire pressure/tread gauges, tire pump, first-aid kit, water, roadmap, multi-tool, notebook & pencil.' },
                    { title: 'Tires & Wheels', description: 'Check pressure (Solo: 36F/41R, 2-up: 36F/41R PSI), for damage, and tread depth (replace at 4/32", legal minimum is 2/32").' },
                    { title: 'Controls', description: 'Check levers, throttle, and cables for smooth operation. Ensure DCT shifts properly.' },
                    { title: 'Lights & Electrics', description: 'Test headlight (hi/lo), turn signals, brake light, and horn.' },
                    { title: 'Engine Oil Level', description: 'Bike upright on level ground. Check sight glass on lower right engine. Level must be between marks.' },
                    { title: 'Brake Fluid Level', description: 'Bike upright. Check front (right handlebar) & rear reservoirs. Level must be between UPPER/LOWER marks.' },
                    { title: 'Coolant Level', description: 'Engine must be cold. Bike upright. Check reserve tank on left side. Level must be between marks.' },
                    { title: 'Chassis & Suspension', description: 'Check suspension setting via display. For passenger/cargo, increase rear preload.' },
                    { title: 'Stands & Footrests', description: 'Ensure sidestand retracts fully. Ensure passenger footrests are up when riding solo.' }
                ]
            },
            'post-ride-moto': {
                title: 'Post-Ride Checklist',
                items: [
                    { title: 'Parking', description: 'Park on a firm, level surface on the sidestand. Engage parking brake.' },
                    { title: 'Secure Motorcycle', description: 'Turn off ignition and lock the steering.' },
                    { title: 'Visual Check', description: 'Quickly check for any new fluid leaks or damage from the ride.' },
                    { title: 'Log Issues', description: 'Note any unusual performance or sounds in the Drive Log.' }
                ]
            },
            'refueling-moto': {
                title: 'Refueling Safety',
                 items: [
                    { title: 'Engine Off', description: 'Ensure the motorcycle is turned off completely.'},
                    { title: 'No Smoking', description: 'Extinguish all smoking materials.'},
                    { title: 'Correct Fuel', description: 'Confirm you are using 87 octane regular unleaded fuel.'},
                    { title: 'Don\'t Top Off', description: 'Stop fueling when the pump nozzle clicks off automatically.'},
                    { title: 'Tighten Gas Cap', description: 'Secure the gas cap until it clicks.'}
                ]
            }
        },
        emergencyContent: `
            <div class="emergency-item bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 md:col-span-2">
                <h3 class="text-xl font-semibold text-red-600 mb-3 flex items-center"><span class="text-2xl mr-2">⚠️</span>General Warning Indicators</h3>
                <div class="space-y-4 text-stone-700 dark:text-stone-300">
                    <div><h4 class="font-semibold">Check Engine (MIL/PGM-FI):</h4><p class="text-sm">If this light comes on, there may be an issue with the fuel injection system. Avoid high speeds and see a dealer soon.</p></div>
                    <div><h4 class="font-semibold">ABS Indicator:</h4><p class="text-sm">If it stays on, there is a problem with the Anti-lock Brake System. The standard brakes will still work, but without ABS. Service is required.</p></div>
                </div>
            </div>
            <div class="emergency-item bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 md:col-span-2">
                <h3 class="text-xl font-semibold text-violet-600 mb-3 flex items-center"><span class="text-2xl mr-2">⚖️</span>Suspension & Load</h3>
                <div class="space-y-4 text-stone-700 dark:text-stone-300 text-sm">
                    <p>The Goldwing has electronically adjustable rear suspension preload. Always adjust it to match your load.</p>
                    <ul class="list-disc list-inside space-y-1 mt-1">
                        <li><strong>Solo Rider:</strong> Set preload to position 1 (Rider only).</li>
                        <li><strong>Rider with Passenger:</strong> Set preload to position 2 (Rider and Passenger).</li>
                        <li><strong>Rider with Luggage:</strong> Set preload to position 3 (Rider and Luggage).</li>
                        <li><strong>Rider with Passenger & Luggage:</strong> Set preload to position 4 (Rider, Passenger, and Luggage).</li>
                    </ul>
                </div>
            </div>
            <div class="emergency-item bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 md:col-span-2">
                <h3 class="text-xl font-semibold text-yellow-500 mb-3 flex items-center"><span class="text-2xl mr-2">⚡️</span>Dead Battery - Jump Start</h3>
                <div class="space-y-2 text-stone-700 dark:text-stone-300 text-sm">
                    <p class="font-semibold">1. Connect Cables (Engines OFF):</p>
                    <ul class="list-decimal list-inside ml-4 space-y-1">
                        <li><span class="text-red-500 font-bold">RED</span> clamp to <span class="text-red-500 font-bold">POSITIVE (+)</span> on DEAD battery.</li>
                        <li>Other <span class="text-red-500 font-bold">RED</span> clamp to <span class="text-red-500 font-bold">POSITIVE (+)</span> on GOOD battery.</li>
                        <li><span class="text-stone-800 dark:text-stone-200 font-bold">BLACK</span> clamp to <span class="text-stone-800 dark:text-stone-200 font-bold">NEGATIVE (-)</span> on GOOD battery.</li>
                        <li>Final <span class="text-stone-800 dark:text-stone-200 font-bold">BLACK</span> clamp to an unpainted metal surface on the DEAD vehicle, away from the battery.</li>
                    </ul>
                    <p class="font-semibold mt-2">2. Start & Remove:</p>
                    <ul class="list-decimal list-inside ml-4 space-y-1">
                        <li>Start the working vehicle; let it run for a few minutes.</li>
                        <li>Attempt to start the dead vehicle.</li>
                        <li>If it starts, remove cables in the EXACT REVERSE order.</li>
                        <li>Let the jumped vehicle run for at least 15 minutes to charge.</li>
                    </ul>
                </div>
            </div>`,
        maintenanceIntervals: `
            <h3 class="text-lg sm:text-xl font-semibold text-stone-700 dark:text-stone-300 mb-3">Recommended Intervals</h3>
            <ul class="list-disc list-inside text-stone-600 dark:text-stone-400 space-y-2 text-sm">
                <li><strong>First 600 Miles:</strong> First service, including oil and filter change.</li>
                <li><strong>Every 8,000 Miles or 12 months:</strong> Change Engine Oil & Filter (SAE 10W-30, JASO T 903 standard MA).</li>
                <li><strong>Every 16,000 Miles:</strong> Inspect spark plugs, check valve clearance, inspect coolant.</li>
                <li><strong>Every 24,000 Miles:</strong> Replace engine air filter.</li>
            </ul>`
    }
};
