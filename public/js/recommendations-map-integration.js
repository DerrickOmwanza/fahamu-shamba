(function () {
    'use strict';

    const boundaries = window.SIAYA_BOUNDARIES;

    if (!boundaries || !Array.isArray(boundaries.features)) {
        return;
    }

    const subCountyColors = {
        'Alego Usonga': '#43aa8b',
        'Bondo': '#8ecae6',
        'Gem': '#f9844a',
        'Rarieda': '#577590',
        'Ugenya': '#90be6d',
        'Ugunja': '#f9c74f'
    };

    const svgBox = { width: 820, height: 620, padding: 34 };
    const mapState = {
        selectedWardId: '',
        selectedSubCounty: '',
        climateSnapshot: null
    };

    window.recommendationMapState = mapState;

    const features = boundaries.features.map((feature) => ({
        id: feature.properties.wardCode,
        ward: feature.properties.ward,
        subCounty: feature.properties.subCounty,
        centroid: feature.properties.centroid,
        geometry: feature.geometry
    }));

    const subCounties = [...new Set(features.map((feature) => feature.subCounty))].sort();
    const bbox = boundaries.bbox;
    const scaleX = (svgBox.width - svgBox.padding * 2) / (bbox.east - bbox.west || 1);
    const scaleY = (svgBox.height - svgBox.padding * 2) / (bbox.north - bbox.south || 1);
    const scale = Math.min(scaleX, scaleY);
    const mapWidth = (bbox.east - bbox.west) * scale;
    const mapHeight = (bbox.north - bbox.south) * scale;
    const offsetX = (svgBox.width - mapWidth) / 2;
    const offsetY = (svgBox.height - mapHeight) / 2;

    document.addEventListener('DOMContentLoaded', () => {
        buildMap();
        patchDemoLoader();
        const profileLocation = document.getElementById('location')?.value;
        const matchedFeature = features.find((feature) => normalizeSubCountyForPrediction(feature.subCounty) === profileLocation);
        const firstFeature = matchedFeature || features[0];
        if (firstFeature) {
            selectWard(firstFeature.id);
        }
    });

    function buildMap() {
        const filter = document.getElementById('mapSubCountyFilter');
        const wardSelect = document.getElementById('mapWardSelect');
        const legend = document.getElementById('recommendationMapLegend');
        const regions = document.getElementById('recommendationMapRegions');
        const labels = document.getElementById('recommendationMapLabels');

        filter.innerHTML = '<option value="">All Siaya County</option>' + subCounties.map((subCounty) =>
            `<option value="${subCounty}">${subCounty}</option>`
        ).join('');

        legend.innerHTML = subCounties.map((subCounty) => `
            <span class="legend-chip">
                <span class="legend-swatch" style="background:${subCountyColors[subCounty] || '#d8e6d8'};"></span>
                ${subCounty}
            </span>
        `).join('');

        regions.innerHTML = features.map((feature) => `
            <path
                class="map-ward-shape"
                data-ward-id="${feature.id}"
                data-subcounty="${feature.subCounty}"
                d="${buildFeaturePath(feature.geometry)}"
                fill="${subCountyColors[feature.subCounty] || '#d8e6d8'}"
                tabindex="0"
                role="button"
                aria-label="${feature.ward}, ${feature.subCounty}"
            ></path>
        `).join('');

        labels.innerHTML = subCounties.map((subCounty) => {
            const group = features.filter((feature) => feature.subCounty === subCounty);
            const lng = group.reduce((sum, feature) => sum + feature.centroid.lng, 0) / group.length;
            const lat = group.reduce((sum, feature) => sum + feature.centroid.lat, 0) / group.length;
            const [x, y] = projectPoint([lng, lat]);
            return `<text class="map-subcounty-label" x="${x}" y="${y}">${subCounty}</text>`;
        }).join('');

        document.querySelectorAll('.map-ward-shape').forEach((shape) => {
            shape.addEventListener('click', () => selectWard(shape.dataset.wardId));
            shape.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectWard(shape.dataset.wardId);
                }
            });
        });

        filter.addEventListener('change', () => {
            mapState.selectedSubCounty = filter.value;
            updateWardOptions();
            updateMapVisualState();
            const nextFeature = getVisibleFeatures()[0];
            if (nextFeature) {
                selectWard(nextFeature.id);
            }
        });

        wardSelect.addEventListener('change', () => {
            if (wardSelect.value) {
                selectWard(wardSelect.value);
            }
        });

        updateWardOptions();
    }

    function projectPoint([lng, lat]) {
        const x = offsetX + (lng - bbox.west) * scale;
        const y = offsetY + (bbox.north - lat) * scale;
        return [x, y];
    }

    function buildFeaturePath(geometry) {
        return geometry.coordinates.map((polygon) =>
            polygon.map((ring) =>
                ring.map(([lng, lat], index) => {
                    const [x, y] = projectPoint([lng, lat]);
                    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
                }).join(' ') + ' Z'
            ).join(' ')
        ).join(' ');
    }

    function normalizeSubCountyForPrediction(subCountyName) {
        const normalized = String(subCountyName || '').toLowerCase();
        if (normalized === 'alego usonga') return 'alego';
        return normalized.split(' ')[0];
    }

    function getVisibleFeatures() {
        return mapState.selectedSubCounty
            ? features.filter((feature) => feature.subCounty === mapState.selectedSubCounty)
            : features;
    }

    function updateWardOptions() {
        const wardSelect = document.getElementById('mapWardSelect');
        wardSelect.innerHTML = '<option value="">Select a ward from the map...</option>' + getVisibleFeatures().map((feature) =>
            `<option value="${feature.id}">${feature.ward} (${feature.subCounty})</option>`
        ).join('');
    }

    function updateMapVisualState() {
        document.querySelectorAll('.map-ward-shape').forEach((shape) => {
            const matchesFilter = !mapState.selectedSubCounty || shape.dataset.subcounty === mapState.selectedSubCounty;
            shape.classList.toggle('dimmed', !matchesFilter);
            shape.classList.toggle('subcounty-focus', matchesFilter && !!mapState.selectedSubCounty);
            shape.classList.toggle('selected', shape.dataset.wardId === mapState.selectedWardId);
        });
    }

    async function selectWard(wardId) {
        const feature = features.find((item) => item.id === wardId);
        if (!feature) return;

        mapState.selectedWardId = wardId;

        if (mapState.selectedSubCounty && mapState.selectedSubCounty !== feature.subCounty) {
            mapState.selectedSubCounty = feature.subCounty;
            document.getElementById('mapSubCountyFilter').value = feature.subCounty;
            updateWardOptions();
        }

        document.getElementById('mapWardSelect').value = wardId;
        updateMapVisualState();
        syncLocationFields(feature);
        await Promise.all([
            syncSoilProfile(feature),
            syncClimateProfile(feature)
        ]);
    }

    function syncLocationFields(feature) {
        const locationValue = normalizeSubCountyForPrediction(feature.subCounty);
        const locationSelect = document.getElementById('location');
        const regionReadout = document.getElementById('regionReadout');
        const selectedWardDisplay = document.getElementById('selectedWardDisplay');
        const selectedRegionDisplay = document.getElementById('selectedRegionDisplay');

        locationSelect.value = locationValue;
        regionReadout.value = `${feature.ward}, ${feature.subCounty}`;
        selectedWardDisplay.textContent = feature.ward;
        selectedRegionDisplay.textContent = feature.subCounty;
    }

    async function syncSoilProfile(feature) {
        const locationValue = document.getElementById('location').value;
        const soilTypeSelect = document.getElementById('soilType');
        const soilTypeReadout = document.getElementById('soilTypeReadout');
        const selectedSoilDisplay = document.getElementById('selectedSoilDisplay');
        const soilHelperReadout = document.getElementById('soilHelperReadout');

        try {
            if (typeof window.fetchGeologicalSoilData !== 'function') {
                throw new Error('Soil helper is unavailable');
            }

            const soilData = await window.fetchGeologicalSoilData(locationValue);
            soilTypeSelect.value = soilData.recommendedSoilType || '';
            soilTypeReadout.value = capitalize(soilData.recommendedSoilType || '');
            selectedSoilDisplay.textContent = capitalize(soilData.recommendedSoilType || '');
            soilHelperReadout.textContent = `📍 Auto-filled from ${feature.ward} in ${feature.subCounty} using the geological soil profile.`;

            if (typeof window.autoUpdateSoilFromLocation === 'function') {
                await window.autoUpdateSoilFromLocation();
            }
        } catch (error) {
            soilTypeSelect.value = '';
            soilTypeReadout.value = '';
            selectedSoilDisplay.textContent = 'Unavailable';
            soilHelperReadout.textContent = '📍 Soil type could not be loaded from the selected region right now.';
        }
    }

    async function syncClimateProfile(feature) {
        const climateInsightText = document.getElementById('climateInsightText');
        const climateSourceBadge = document.getElementById('climateSourceBadge');
        const selectedClimateDisplay = document.getElementById('selectedClimateDisplay');

        climateInsightText.textContent = `Loading climate for ${feature.ward}...`;

        try {
            const apiSubCounty = normalizeSubCountyForPrediction(feature.subCounty);
            const response = await fetch(`/api/weather/current/${encodeURIComponent(apiSubCounty)}`);
            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.error || 'Climate data unavailable');
            }

            mapState.climateSnapshot = payload.data;
            selectedClimateDisplay.textContent = `${payload.data.temperature}°C • ${payload.data.humidity}% humidity`;
            climateInsightText.textContent = `${feature.ward} is currently at ${payload.data.temperature}°C with ${payload.data.description}, ${payload.data.humidity}% humidity, and ${payload.data.precipitation ?? payload.data.rain ?? 0} mm precipitation.`;
            climateSourceBadge.style.display = 'inline-flex';
        } catch (error) {
            mapState.climateSnapshot = null;
            selectedClimateDisplay.textContent = 'Unavailable';
            climateInsightText.textContent = `Climate data could not be loaded for ${feature.ward} right now.`;
            climateSourceBadge.style.display = 'none';
        }
    }

    function patchDemoLoader() {
        if (typeof window.loadDemoData !== 'function') return;

        const original = window.loadDemoData;
        window.loadDemoData = function patchedLoadDemoData() {
            const demos = [
                { subCounty: 'Bondo', season: 'long_rains', farmSize: 2.5, waterSource: 'Rainfall' },
                { subCounty: 'Ugunja', season: 'short_rains', farmSize: 1.8, waterSource: 'Well' },
                { subCounty: 'Alego Usonga', season: 'short_rains', farmSize: 2, waterSource: 'Rainfall' }
            ];
            const demo = demos[Math.floor(Math.random() * demos.length)];
            const feature = features.find((item) => item.subCounty === demo.subCounty);
            document.getElementById('season').value = demo.season;
            document.getElementById('farmSize').value = demo.farmSize;
            document.getElementById('waterSource').value = demo.waterSource;

            if (feature) {
                selectWard(feature.id).then(() => {
                    if (typeof window.updateBudgetEstimate === 'function') {
                        window.updateBudgetEstimate();
                    }
                    if (typeof window.showToast === 'function') {
                        window.showToast('Demo data loaded from map selection!', 'success');
                    }
                });
                return;
            }

            original();
        };
    }

    function capitalize(text) {
        return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
    }
})();
