import { state } from './state.js';
import * as api from './api.js';

// --- Chart Instances & State ---
let charts = {
    mpg: null,
    distance: null,
    trips: null,
    cpm: null
};

let activePeriods = {
    mpg: '7d',
    distance: '7d',
    trips: '7d',
    cpm: '7d'
};

const vehicleColors = {
    jeepLiberty: 'rgba(255, 99, 132, 0.8)', // Red
    hondaGoldwing: 'rgba(54, 162, 235, 0.8)', // Blue
    subaruOutback: 'rgba(75, 192, 192, 0.8)', // Green
    default: 'rgba(153, 102, 255, 0.8)' // Purple
};

// --- Data Processing ---

function getChartConfig(period) {
    const endDate = new Date();
    const startDate = new Date();
    let unit = 'day';

    switch (period) {
        case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
        case '6m':
            startDate.setMonth(endDate.getMonth() - 6);
            unit = 'week';
            break;
        case 'all':
            startDate.setFullYear(endDate.getFullYear() - 10); // Go back 10 years for "all"
            unit = 'month';
            break;
    }
    return { startDate, endDate, unit };
}

function processLogData(logType, valueExtractor, aggregator = 'sum') {
    const datasets = {};
    Object.keys(state.vehicles).forEach((vehicleId, index) => {
        const logKey = `${vehicleId}_${logType}`;
        const logs = api.getLogs(logKey);
        const color = vehicleColors[vehicleId] || vehicleColors.default;
        
        datasets[vehicleId] = {
            label: state.vehicles[vehicleId].name,
            data: [],
            borderColor: color,
            backgroundColor: color,
            tension: 0.1
        };

        logs.forEach(log => {
            const value = valueExtractor(log, logs);
            if (value !== null) {
                datasets[vehicleId].data.push({
                    x: new Date(log.date),
                    y: value
                });
            }
        });
    });
    return datasets;
}

function aggregateData(datasets, period) {
    const { startDate, endDate, unit } = getChartConfig(period);
    const aggregatedDatasets = {};

    Object.keys(datasets).forEach(vehicleId => {
        const vehicleDataset = datasets[vehicleId];
        const aggregatedData = {};

        vehicleDataset.data.forEach(point => {
            if (point.x >= startDate && point.x <= endDate) {
                let key;
                const d = new Date(point.x);
                d.setHours(0,0,0,0);
                if (unit === 'day') {
                    key = d.toISOString().split('T')[0];
                } else if (unit === 'week') {
                    const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
                    key = weekStart.toISOString().split('T')[0];
                } else { // month
                    key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                }

                if (!aggregatedData[key]) {
                    aggregatedData[key] = { sum: 0, count: 0, values: [] };
                }
                aggregatedData[key].sum += point.y;
                aggregatedData[key].count++;
                aggregatedData[key].values.push(point.y);
            }
        });
        
        aggregatedDatasets[vehicleId] = {
            ...vehicleDataset,
            data: Object.keys(aggregatedData).map(key => {
                const group = aggregatedData[key];
                let finalValue = group.sum; // Default for sum/count
                if (unit === 'month' || unit === 'week') {
                     finalValue = group.sum / group.count; // Average for week/month views
                }
                if (group.count === 0) finalValue = 0;
                return {
                    x: new Date(key),
                    y: finalValue
                };
            }).sort((a,b) => a.x - b.x)
        };
    });
    
    return Object.values(aggregatedDatasets);
}


// --- Chart Specific Data Extractors ---

const extractors = {
    distance: (log) => log.end_mileage - log.start_mileage,
    trips: () => 1,
    mpg: (log, allLogs) => {
        const sortedLogs = allLogs.sort((a, b) => parseInt(a.mileage) - parseInt(b.mileage));
        const currentIndex = sortedLogs.findIndex(l => l.id === log.id);
        if (currentIndex < 1) return null;
        const prevLog = sortedLogs[currentIndex - 1];
        const miles = parseInt(log.mileage) - parseInt(prevLog.mileage);
        const gallons = parseFloat(log.gallons);
        return (miles > 0 && gallons > 0) ? miles / gallons : null;
    },
    cpm: (log, allLogs) => {
        const sortedLogs = allLogs.sort((a, b) => parseInt(a.mileage) - parseInt(b.mileage));
        const currentIndex = sortedLogs.findIndex(l => l.id === log.id);
        if (currentIndex < 1) return null;

        const firstLog = sortedLogs[0];
        const currentLogs = sortedLogs.slice(0, currentIndex + 1);
        
        const totalMiles = parseInt(log.mileage) - parseInt(firstLog.mileage);
        const totalCost = currentLogs.reduce((sum, l) => sum + parseFloat(l.total_cost || 0), 0);

        return (totalMiles > 0) ? totalCost / totalMiles : null;
    }
};

// --- Chart Rendering ---

function renderChart(chartId, datasets, label, unit) {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (charts[chartId]) {
        charts[chartId].destroy();
    }
    charts[chartId] = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: { unit },
                    ticks: { color: '#a8a29e' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#a8a29e' },
                    title: {
                        display: true,
                        text: label,
                        color: '#a8a29e'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#d6d3d1' }
                }
            }
        }
    });
}

// --- Main Update Function ---

export function updateDashboard() {
    // MPG Chart
    const mpgPeriod = activePeriods.mpg;
    const rawMpgData = processLogData('refuelLog', extractors.mpg);
    const finalMpgData = aggregateData(rawMpgData, mpgPeriod);
    renderChart('mpgChart', finalMpgData, 'Miles Per Gallon', getChartConfig(mpgPeriod).unit);

    // Distance Chart
    const distancePeriod = activePeriods.distance;
    const rawDistanceData = processLogData('driveLog', extractors.distance);
    const finalDistanceData = aggregateData(rawDistanceData, distancePeriod);
    renderChart('distanceChart', finalDistanceData, 'Miles Driven', getChartConfig(distancePeriod).unit);

    // Trips Chart
    const tripsPeriod = activePeriods.trips;
    const rawTripsData = processLogData('driveLog', extractors.trips);
    const finalTripsData = aggregateData(rawTripsData, tripsPeriod);
    renderChart('tripsChart', finalTripsData, 'Number of Trips', getChartConfig(tripsPeriod).unit);

    // Cost Per Mile Chart
    const cpmPeriod = activePeriods.cpm;
    const rawCpmData = processLogData('refuelLog', extractors.cpm);
    const finalCpmData = aggregateData(rawCpmData, cpmPeriod);
    renderChart('cpmChart', finalCpmData, 'Cost Per Mile ($)', getChartConfig(cpmPeriod).unit);
}

export function setupDashboardEventListeners() {
    document.querySelectorAll('.time-window-selector').forEach(selector => {
        selector.addEventListener('click', e => {
            if (e.target.matches('.time-btn')) {
                const chart = selector.dataset.chart;
                const period = e.target.dataset.period;
                activePeriods[chart] = period;

                selector.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                updateDashboard();
            }
        });
    });
}
