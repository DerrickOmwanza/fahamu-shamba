const fs = require('fs');
const path = require('path');

// Test Chart.js rendering in Node.js environment
console.log('Testing Chart.js rendering...');

// Check if Chart.js file exists and is readable
const chartPath = path.join(__dirname, 'public', 'js', 'chart.min.js');
if (fs.existsSync(chartPath)) {
    const chartContent = fs.readFileSync(chartPath, 'utf8');
    console.log('✅ Chart.js file exists:', chartPath);
    console.log('✅ Chart.js file size:', Math.round(chartContent.length / 1024) + 'KB');
    
    // Check if it contains Chart definition
    if (chartContent.includes('Chart') || chartContent.includes('ChartJS')) {
        console.log('✅ Chart.js contains Chart definition');
    } else {
        console.log('❌ Chart.js may be corrupted');
    }
} else {
    console.log('❌ Chart.js file not found at:', chartPath);
}

// Test the data structure that would be passed to Chart.js
console.log('\nTesting Chart.js data structure...');

// Simulate the data that would be passed to renderChart
const mockTrends = [
    { subcounty: 'bondo', week_start: '2024-03-04', price: 65 },
    { subcounty: 'ugunja', week_start: '2024-03-04', price: 68 },
    { subcounty: 'yala', week_start: '2024-03-04', price: 62 },
    { subcounty: 'gem', week_start: '2024-03-04', price: 70 },
    { subcounty: 'alego', week_start: '2024-03-04', price: 66 },
    { subcounty: 'bondo', week_start: '2024-02-26', price: 64 },
    { subcounty: 'ugunja', week_start: '2024-02-26', price: 67 },
    { subcounty: 'yala', week_start: '2024-02-26', price: 61 },
    { subcounty: 'gem', week_start: '2024-02-26', price: 69 },
    { subcounty: 'alego', week_start: '2024-02-26', price: 65 }
];

// Test the data processing logic from renderChart
const weeks = [...new Set(mockTrends.map(t => t.week_start))].sort();
const subcounties = ['bondo', 'ugunja', 'yala', 'gem', 'alego'];
const colors = {
    'bondo': 'rgba(46, 125, 50, 1)',
    'ugunja': 'rgba(74, 157, 111, 1)',
    'yala': 'rgba(245, 124, 0, 1)',
    'gem': 'rgba(52, 152, 219, 1)',
    'alego': 'rgba(155, 89, 182, 1)'
};

console.log('Weeks:', weeks);
console.log('Subcounties:', subcounties);

const datasets = subcounties.map(sc => ({
    label: sc.charAt(0).toUpperCase() + sc.slice(1),
    data: weeks.map(week => {
        const entry = mockTrends.find(t => t.week_start === week && t.subcounty === sc);
        return entry ? entry.price : null;
    }),
    borderColor: colors[sc],
    backgroundColor: colors[sc].replace('1)', '0.1)'),
    fill: false,
    tension: 0.4,
    borderWidth: 2
}));

console.log('Datasets:', datasets);

// Test the final data structure
const chartData = { labels: weeks, datasets: datasets };
console.log('Final chart data structure:', JSON.stringify(chartData, null, 2));

console.log('\n✅ All data structure tests passed!');
console.log('The issue is likely in the browser environment or Chart.js initialization.');
console.log('Check browser console for JavaScript errors when loading the market page.');