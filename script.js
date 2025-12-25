// =========================================================
// script.js (Load Data from CSV File)
// =========================================================

// === CONFIG ===
const PADDING_X = 200;      
const EFFECTIVE_WIDTH = 4000; 
const TOTAL_WIDTH = EFFECTIVE_WIDTH + (PADDING_X * 2); 
const HEIGHT = 600;

// === STATE ===
const activeLayers = {
    weather: true,
    cabbage: false,
    wave: false, 
    inflation: false
};

// === ELEMENTS ===
const uiTitle = document.getElementById('main-title');
const btns = {
    weather: document.getElementById('btn-weather'),
    cabbage: document.getElementById('btn-cabbage'),
    wave: document.getElementById('btn-wave'),
    inflation: document.getElementById('btn-inflation')
};

const views = {
    weather: document.getElementById('weather-view'),
    cabbage: document.getElementById('cabbage-view'),
    wave: document.getElementById('wave-view'),
    inflation: document.getElementById('inflation-view')
};

const legends = {
    weather: document.getElementById('weather-legend'),
    cabbage: document.getElementById('cabbage-legend'),
    wave: document.getElementById('wave-legend'),
    inflation: document.getElementById('inflation-legend')
};

const cabbageViewport = document.getElementById('cabbage-viewport');
const weatherWrapper = document.getElementById("scroll-wrapper");
const cabbageInner = document.getElementById('cabbage-chart-inner');
const waveInner = document.getElementById('wave-chart-inner');
const inflationInner = document.getElementById('inflation-chart-inner');

// === TOGGLE LOGIC ===
function toggleLayer(layer) {
    activeLayers[layer] = !activeLayers[layer];
    updateVisibility();
}

function updateVisibility() {
    Object.keys(activeLayers).forEach(key => {
        if (activeLayers[key]) {
            btns[key].classList.add('active');
            views[key].classList.remove('hidden-view');
            views[key].classList.add('visible-view');
        } else {
            btns[key].classList.remove('active');
            views[key].classList.remove('visible-view');
            views[key].classList.add('hidden-view');
        }
    });

    const activeCount = Object.values(activeLayers).filter(v => v).length;
    const isMerged = activeCount > 1;

    if (activeLayers.cabbage && (activeLayers.weather || activeLayers.inflation || activeLayers.wave)) {
        cabbageViewport.classList.add('merged-mode');
    } else {
        cabbageViewport.classList.remove('merged-mode');
    }

    if (isMerged) {
        Object.values(legends).forEach(l => l.style.display = 'none');
        uiTitle.innerText = "Combined View";
        uiTitle.style.textShadow = "0 0 15px rgba(255, 255, 255, 0.5)";
    } else {
        Object.keys(legends).forEach(key => {
            legends[key].style.display = activeLayers[key] ? 'flex' : 'none';
        });
        
        if (activeLayers.weather) { uiTitle.innerText = "Weather Wave"; uiTitle.style.textShadow = "0 0 15px rgba(0, 191, 255, 0.6)"; }
        else if (activeLayers.cabbage) { uiTitle.innerText = "Monthly Harvest (Simulated)"; uiTitle.style.textShadow = "0 0 15px rgba(0, 255, 127, 0.6)"; }
        else if (activeLayers.wave) { uiTitle.innerText = "Price Trend"; uiTitle.style.textShadow = "0 0 15px rgba(0, 191, 255, 0.6)"; }
        else if (activeLayers.inflation) { uiTitle.innerText = "Sentiment Cloud"; uiTitle.style.textShadow = "0 0 15px rgba(255, 69, 0, 0.6)"; }
        else { uiTitle.innerText = "Select Data"; uiTitle.style.textShadow = "none"; }
    }
}

btns.weather.addEventListener('click', () => toggleLayer('weather'));
btns.cabbage.addEventListener('click', () => toggleLayer('cabbage'));
btns.wave.addEventListener('click', () => toggleLayer('wave'));
btns.inflation.addEventListener('click', () => toggleLayer('inflation'));


// =========================================================
// 1. GLOBAL VARIABLES & SETUP
// =========================================================
let targetScroll = 0;
let currentScroll = 0;
let globalTime = 0;

// Data Containers
let csvData = { dates: [], temps: [], precips: [], prices: [], sentiments: [] };
let points = [];          // Weather
let cabbageDataObj = {};  // Harvest
let wavePoints = [];      // Price
let inflationPoints = []; // Inflation

// Canvas Contexts
const weatherContainer = d3.select("#weather-chart-container");
weatherContainer.style("width", TOTAL_WIDTH + "px");
const weatherCanvas = weatherContainer.append("canvas").attr("width", TOTAL_WIDTH).attr("height", HEIGHT);
const ctxWeather = weatherCanvas.node().getContext("2d", { alpha: true });

cabbageInner.style.width = TOTAL_WIDTH + "px";
const ctxCabbage = document.getElementById('cabbageChart').getContext('2d');
let myCabbageChart; // Will be initialized after data load

waveInner.style.width = TOTAL_WIDTH + "px";
const waveCanvas = document.getElementById('waveChart');
waveCanvas.width = TOTAL_WIDTH; waveCanvas.height = HEIGHT;
const ctxWave = waveCanvas.getContext("2d", { alpha: true });

inflationInner.style.width = TOTAL_WIDTH + "px";
const inflationCanvas = document.getElementById('inflationChart');
inflationCanvas.width = TOTAL_WIDTH; inflationCanvas.height = HEIGHT;
const ctxInflation = inflationCanvas.getContext('2d', { alpha: true });

// Assets
const subImg = new Image(); subImg.src = "submarine.png"; 
const cloudImg = new Image(); cloudImg.src = "cloud.png";
const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d');

let subX = -100; let subY = -100; let targetSubX = -100; let targetSubY = -100; let isFacingRight = true; 
const baseCenterY = HEIGHT / 2 + 50;
let cabbageTime = 0;

// Scales (Will be defined in init functions)
let colorRain, yScaleWave, colorScaleWave, yScaleInf, colorScaleInf, rScaleInf;
let lineGenerator;


// =========================================================
// 2. DATA LOADING & INITIALIZATION
// =========================================================

fetch('processed_data.csv')
    .then(response => {
        if (!response.ok) throw new Error("CSV load failed");
        return response.text();
    })
    .then(text => {
        // Parse CSV
        const rows = text.trim().split('\n').slice(1); // Skip header
        rows.forEach(row => {
            if(!row.trim()) return;
            const cols = row.split(',');
            csvData.dates.push(cols[0]);
            csvData.temps.push(parseFloat(cols[1]));
            csvData.precips.push(parseInt(cols[2]));
            csvData.prices.push(parseInt(cols[3]));
            csvData.sentiments.push(parseFloat(cols[4]));
        });

        console.log("Data Loaded:", csvData.dates.length, "rows");

        // Initialize All Charts
        initWeather();
        initCabbage();
        initWave();
        initInflation();

        // Start Animation Loop
        masterLoop();
    })
    .catch(err => {
        console.error(err);
        alert("데이터를 불러오는데 실패했습니다. 로컬 서버(Live Server 등)를 통해 실행해주세요.");
    });


// --- Initialization Functions ---

function initWeather() {
    const steps = 800; 
    const dataLen = csvData.temps.length;
    function lerp(start, end, amt) { return (1 - amt) * start + amt * end; }

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const floatIndex = t * (dataLen - 1);
        const idx1 = Math.floor(floatIndex);
        const idx2 = Math.min(idx1 + 1, dataLen - 1);
        const ratio = floatIndex - idx1;

        const rawTemp = lerp(csvData.temps[idx1], csvData.temps[idx2], ratio);
        const rawPrecip = lerp(csvData.precips[idx1], csvData.precips[idx2], ratio);

        const baseFlow = Math.sin(t * Math.PI * 10) * 15;
        const tempAmp = (rawTemp - 15) * 5; 
        const precipAmp = (rawPrecip / 100) * 15; 

        let typhoonVal = 0.2;
        if (rawTemp > 25 && rawPrecip > 150) typhoonVal += 1.5;

        points.push({ 
            t, x: PADDING_X + (t * EFFECTIVE_WIDTH), baseFlow, tempAmp, precipAmp, 
            typhoonAmp: typhoonVal * 20, rawTemp, rawPrecip 
        });
    }
    colorRain = d3.scaleSequential(d3.interpolateRgb("#00ced1", "#7fffd4")).domain([0, 200]);
}

function initCabbage() {
    const labels = []; const data = [];
    csvData.dates.forEach((dateStr, i) => {
        const [y, m] = dateStr.split("-");
        labels.push({ year: y, month: parseInt(m) });
        // Price 역산
        const price = csvData.prices[i];
        const simulatedHarvest = Math.floor(1500000 / price); 
        data.push(simulatedHarvest);
    });
    cabbageDataObj = { labels, data };

    // Create Chart
    myCabbageChart = new Chart(ctxCabbage, {
        type: 'bar',
        data: { labels: cabbageDataObj.labels, datasets: [{ data: cabbageDataObj.data, backgroundColor: 'transparent', borderColor: 'transparent' }] },
        plugins: [seaweedPlugin],
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            layout: { padding: { bottom: 60, top: 50 } },
            plugins: { legend: { display: false }, tooltip: { enabled: false } }, 
            scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
        }
    });
}

function initWave() {
    wavePoints = csvData.prices.map((price, i) => {
        const [y, m] = csvData.dates[i].split("-");
        return {
            x: PADDING_X + (i / (csvData.prices.length - 1)) * EFFECTIVE_WIDTH,
            y: 0, value: price, year: y, month: parseInt(m)
        };
    });

    yScaleWave = d3.scaleLinear().domain([2000, 9000]).range([0, -350]); 
    colorScaleWave = d3.scaleSequential(d3.interpolateCool).domain([2000, 9000]);
    
    lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => (HEIGHT * 0.7) + yScaleWave(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5))
        .context(ctxWave);
}

function initInflation() {
    csvData.sentiments.forEach((score, i) => {
        const progress = i / (csvData.sentiments.length - 1);
        const x = PADDING_X + (progress * EFFECTIVE_WIDTH);
        const date = new Date(csvData.dates[i]);
        
        // 역산 (1 - score)
        const inflationMetric = (1 - score) * 10; 
        const count = 500 + Math.random() * 1000;

        inflationPoints.push({ 
            x, inflation: inflationMetric, count, date, 
            phase: Math.random() * Math.PI * 2, 
            speed: 0.02 + Math.random() * 0.03, 
            floatAmp: 5 + Math.random() * 10 
        });
    });

    yScaleInf = d3.scaleLinear().domain([0, 10]).range([HEIGHT - 200, 20]);
    colorScaleInf = d3.scaleSequential(d3.interpolateRgb("#00BFFF", "#FF3333")).domain([2, 8]);
    rScaleInf = d3.scaleSqrt().domain([0, 1500]).range([30, 90]);

    inflationPoints.forEach(p => { 
        p.y = yScaleInf(p.inflation); 
        p.color = colorScaleInf(p.inflation); 
        p.radius = rScaleInf(p.count); 
    });
}


// =========================================================
// 3. PLUGINS & RENDER LOGIC
// =========================================================

// [Seaweed Plugin]
const seaweedPlugin = {
    id: 'seaweedGraph',
    afterDatasetsDraw: (chart) => {
        if (!activeLayers.cabbage) return;
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        const yAxis = chart.scales.y;
        
        cabbageTime += 0.03; 
        
        ctx.save();
        meta.data.forEach((bar, index) => {
            const centerX = PADDING_X + (index / (meta.data.length - 1)) * EFFECTIVE_WIDTH;
            
            if (centerX < currentScroll - 100 || centerX > currentScroll + window.innerWidth + 100) return;

            const bottomY = yAxis.getPixelForValue(0);
            const topY = bar.y;
            
            const gradient = ctx.createLinearGradient(centerX, bottomY, centerX, topY);
            gradient.addColorStop(0, `hsla(120, 90%, 40%, 0.85)`); 
            gradient.addColorStop(1, `hsla(120, 90%, 75%, 0.5)`); 
            ctx.fillStyle = gradient; 
            
            ctx.beginPath();
            const width = 20;
            
            for (let y = bottomY; y >= topY; y -= 5) {
                const sway = Math.sin(y * 0.015 + cabbageTime * 0.7 + index * 0.5) * ((bottomY - y) / (bottomY - topY) * 6);
                ctx.lineTo(centerX - width/2 + sway, y);
            }
            
            ctx.quadraticCurveTo(
                centerX + Math.sin(topY*0.015+cabbageTime*0.7+index*0.5)*6, 
                topY-10, 
                centerX + width/2 + Math.sin(topY*0.015+cabbageTime*0.7+index*0.5)*6, 
                topY
            );
            
            for (let y = topY; y <= bottomY; y += 5) {
                const sway = Math.sin(y * 0.015 + cabbageTime * 0.7 + index * 0.5) * ((bottomY - y) / (bottomY - topY) * 6);
                ctx.lineTo(centerX + width/2 + sway, y);
            }
            
            ctx.closePath(); 
            ctx.fill();
            
            ctx.strokeStyle = `hsla(120, 100%, 80%, 0.4)`; 
            ctx.lineWidth = 1; 
            ctx.stroke();
        });
        ctx.restore();
    }
};

const customAxisPlugin = {
    id: 'customAxis',
    afterDraw: (chart) => {
        if (activeLayers.weather || activeLayers.wave || activeLayers.inflation) return;
        if (!activeLayers.cabbage) return;
        const ctx = chart.ctx; const height = chart.height;
        ctx.save(); ctx.textAlign = "center"; ctx.shadowColor = "rgba(255, 255, 255, 0.8)"; ctx.shadowBlur = 8;
        chart.data.labels.forEach((labelObj, index) => {
            const x = PADDING_X + (index / (chart.data.labels.length - 1)) * EFFECTIVE_WIDTH;
            if (x < currentScroll - 100 || x > currentScroll + window.innerWidth + 100) return;
            const monthStr = String(labelObj.month).padStart(2,'0');
            if (labelObj.month === 1) {
                ctx.font = "bold 13px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillText(labelObj.year, x, height - 35);
                ctx.font = "bold 16px sans-serif"; ctx.fillStyle = "rgba(255,255,255,1)"; ctx.fillText(monthStr, x, height - 15);
            } else {
                ctx.font = "12px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillText(monthStr, x, height - 15);
            }
        });
        ctx.restore();
    }
};
Chart.register(customAxisPlugin);


// =========================================================
// 4. MASTER LOOP
// =========================================================
function masterLoop() {
    globalTime = Date.now() / 300;

    const diff = targetScroll - currentScroll;
    if (Math.abs(diff) > 0.5) currentScroll += diff * 0.05;
    else currentScroll = targetScroll;

    weatherWrapper.scrollLeft = currentScroll;
    cabbageInner.style.transform = `translate3d(${-currentScroll}px, 0, 0)`;
    inflationInner.style.transform = `translate3d(${-currentScroll}px, 0, 0)`;
    waveInner.style.transform = `translate3d(${-currentScroll}px, 0, 0)`;

    const visibleMin = currentScroll - 100;
    const visibleMax = currentScroll + window.innerWidth + 100;
    const isMerged = Object.values(activeLayers).filter(v => v).length > 1;

    // --- Weather Render ---
    ctxWeather.clearRect(0, 0, TOTAL_WIDTH, HEIGHT);
    if (activeLayers.weather) {
        const drawWLayer = (keyAmp, offsetFunc, colorCallback, blendMode, baseOpacity) => {
            ctxWeather.save(); const lensRadius = 250; 
            const areaGen = d3.area().x(d => d.x).y0(HEIGHT).y1(d => {
                let scale = 0.35; let flowScale = 0.35;
                if (isHovered) {
                    const dist = Math.abs(d.x - mouseXCanvas);
                    if (dist < lensRadius) {
                        const expansion = Math.exp(-(dist * dist) / (2 * (lensRadius/2.5) ** 2));
                        scale += expansion * 0.65; flowScale += expansion * 0.65;
                    }
                }
                return baseCenterY + d.baseFlow * flowScale + (offsetFunc ? offsetFunc(d, globalTime) : 0) - (15 + d[keyAmp] * scale);
            }).curve(d3.curveBasis).context(ctxWeather);
            ctxWeather.beginPath(); areaGen(points); ctxWeather.clip();
            if (keyAmp === 'tempAmp') ctxWeather.fillStyle = defaultTempColor;
            else if (colorCallback) {
                const gradient = ctxWeather.createLinearGradient(PADDING_X, 0, PADDING_X + EFFECTIVE_WIDTH, 0);
                points.forEach(p => gradient.addColorStop(p.t, colorCallback(p))); ctxWeather.fillStyle = gradient;
            } else ctxWeather.fillStyle = '#000030'; 
            ctxWeather.globalCompositeOperation = blendMode || 'source-over';
            ctxWeather.globalAlpha = baseOpacity; ctxWeather.fillRect(0, 0, TOTAL_WIDTH, HEIGHT); ctxWeather.restore();
        };
        
        drawWLayer('typhoonAmp', (d, time) => Math.sin(d.t * 5 + time * 0.5) * 10, null, 'source-over', 0.6);
        drawWLayer('precipAmp', (d, time) => Math.sin(d.t * 12 + time) * 5, (p) => p.rawPrecip > 100 ? colorRain(p.rawPrecip) : "#00ced1", 'multiply', 0.5);
        drawWLayer('tempAmp', (d, time) => Math.sin(d.t * 15 - time * 1.5) * 3, null, 'hard-light', 0.7);

        // Axis
        ctxWeather.save(); ctxWeather.textAlign = "center"; ctxWeather.shadowColor = "rgba(255, 255, 255, 0.8)"; ctxWeather.shadowBlur = 8;
        ctxWeather.fillStyle = "rgba(255, 255, 255, 0.9)";
        
        const dataLen = csvData.dates.length;
        csvData.dates.forEach((dateStr, i) => {
            const x = PADDING_X + (i / (dataLen - 1)) * EFFECTIVE_WIDTH;
            if (x < visibleMin || x > visibleMax) return;
            const [y, m] = dateStr.split("-");
            if (m === '01') {
                ctxWeather.font = "bold 13px sans-serif"; ctxWeather.fillStyle = "rgba(255, 255, 255, 0.7)"; ctxWeather.fillText(y, x, HEIGHT - 35); 
                ctxWeather.font = "bold 16px sans-serif"; ctxWeather.fillStyle = "rgba(255, 255, 255, 1.0)"; ctxWeather.fillText(m, x, HEIGHT - 15);
            } else if (i % 3 === 0) { 
                ctxWeather.font = "12px sans-serif"; ctxWeather.fillStyle = "rgba(255, 255, 255, 0.5)"; ctxWeather.fillText(m, x, HEIGHT - 15);
            }
        });
        ctxWeather.restore();

        if (isHovered && subImg.complete) {
            ctxWeather.save();
            subX += (targetSubX - subX) * 0.15; subY += (targetSubY - subY) * 0.15;
            const subW = 100; const subH = subW * (subImg.height / subImg.width);
            let dataRatio = Math.max(0, Math.min(1, (subX - PADDING_X) / EFFECTIVE_WIDTH));
            const pSub = points[Math.floor(dataRatio * steps)] || points[points.length-1];
            let lightColorStart = 'rgba(224, 255, 255, 0.5)'; 
            if (pSub && pSub.rawTemp > 25) lightColorStart = 'rgba(255, 69, 0, 0.7)'; 
            else if (pSub && pSub.rawTemp < 5) lightColorStart = 'rgba(138, 43, 226, 0.7)'; 
            ctxWeather.translate(subX, subY); if (!isFacingRight) ctxWeather.scale(-1, 1);
            ctxWeather.drawImage(subImg, -subW / 2, -subH / 2, subW, subH);
            ctxWeather.globalCompositeOperation = 'screen';
            const lightGrad = ctxWeather.createRadialGradient(subW/2, 0, 5, subW/2 + 100, 0, 150);
            lightGrad.addColorStop(0, lightColorStart); lightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctxWeather.fillStyle = lightGrad; ctxWeather.beginPath(); ctxWeather.moveTo(subW/3, -10); ctxWeather.lineTo(subW + 150, -60);
            ctxWeather.lineTo(subW + 150, 60); ctxWeather.lineTo(subW/3, 10); ctxWeather.fill();
            ctxWeather.restore();
        }
    }

    // --- Cabbage Render ---
    if (activeLayers.cabbage && myCabbageChart) { myCabbageChart.draw(); }

    // --- Wave Render ---
    ctxWave.clearRect(0, 0, TOTAL_WIDTH, HEIGHT);
    if (activeLayers.wave) {
        const waveCenterY = HEIGHT * 0.7;
        const zeroY = waveCenterY + yScaleWave(2000); 
        ctxWave.beginPath(); ctxWave.moveTo(0, zeroY); ctxWave.lineTo(TOTAL_WIDTH, zeroY);
        ctxWave.strokeStyle = "rgba(255, 255, 255, 0.1)"; ctxWave.lineWidth = 1; ctxWave.stroke();

        const gradient = ctxWave.createLinearGradient(0, 0, TOTAL_WIDTH, 0);
        wavePoints.forEach(p => {
            const t = (p.x - PADDING_X) / EFFECTIVE_WIDTH;
            if(t>=0 && t<=1) gradient.addColorStop(t, colorScaleWave(p.value));
        });

        ctxWave.save();
        ctxWave.beginPath(); lineGenerator(wavePoints);
        ctxWave.strokeStyle = gradient; ctxWave.lineWidth = 4; ctxWave.shadowColor = "#00ced1"; ctxWave.shadowBlur = 15; ctxWave.stroke();
        ctxWave.restore();

        wavePoints.forEach(p => {
            if (p.x < visibleMin || p.x > visibleMax) return;
            let radius = 3;
            if (isHovered && activeLayers.wave) {
                const dist = Math.abs(p.x - mouseXCanvas);
                if (dist < 100) radius += (100 - dist) * 0.05;
            }
            ctxWave.beginPath(); ctxWave.arc(p.x, waveCenterY + yScaleWave(p.value), radius, 0, Math.PI * 2); ctxWave.fillStyle = "#fff"; ctxWave.fill();
        });

        // Axis
        if (!activeLayers.weather) {
            ctxWave.save(); ctxWave.textAlign = "center"; ctxWave.shadowColor = "rgba(255, 255, 255, 0.8)"; ctxWave.shadowBlur = 8;
            wavePoints.forEach((p, i) => {
                if (p.x < visibleMin || p.x > visibleMax) return;
                const monthStr = String(p.month).padStart(2,'0');
                if (p.month === 1) {
                    ctxWave.font = "bold 13px sans-serif"; ctxWave.fillStyle = "rgba(255, 255, 255, 0.7)"; ctxWave.fillText(p.year, p.x, HEIGHT - 35); 
                    ctxWave.font = "bold 16px sans-serif"; ctxWave.fillStyle = "rgba(255, 255, 255, 1.0)"; ctxWave.fillText(monthStr, p.x, HEIGHT - 15);
                } else if (i % 3 === 0) {
                    ctxWave.font = "12px sans-serif"; ctxWave.fillStyle = "rgba(255, 255, 255, 0.5)"; ctxWave.fillText(monthStr, p.x, HEIGHT - 15);
                }
            });
            ctxWave.restore();
        }
    }

    // --- Inflation Render ---
    ctxInflation.clearRect(0, 0, TOTAL_WIDTH, HEIGHT);
    if (activeLayers.inflation) {
        // Axis
        if (!activeLayers.weather && !activeLayers.wave) {
            ctxInflation.save(); ctxInflation.textAlign = "center"; ctxInflation.shadowColor = "rgba(255, 255, 255, 0.8)"; ctxInflation.shadowBlur = 8;
            inflationPoints.forEach((p, i) => {
                 if (p.x < visibleMin || p.x > visibleMax) return;
                 const monthStr = String(p.date.getMonth()+1).padStart(2,'0');
                 if (p.date.getMonth() === 0) {
                     ctxInflation.font = "bold 13px sans-serif"; ctxInflation.fillStyle = "rgba(255,255,255,0.7)"; ctxInflation.fillText(p.date.getFullYear(), p.x, HEIGHT - 35);
                     ctxInflation.font = "bold 16px sans-serif"; ctxInflation.fillStyle = "rgba(255,255,255,1)"; ctxInflation.fillText(monthStr, p.x, HEIGHT - 15);
                 } else if (i % 3 === 0) {
                     ctxInflation.font = "12px sans-serif"; ctxInflation.fillStyle = "rgba(255,255,255,0.5)"; ctxInflation.fillText(monthStr, p.x, HEIGHT - 15);
                 }
            });
            ctxInflation.restore();
        }

        if (cloudImg.complete) {
            ctxInflation.save();
            inflationPoints.forEach(p => {
                if (p.x < visibleMin || p.x > visibleMax) return;
                
                const floatY = Math.sin((globalTime * p.speed * 3) + p.phase) * (p.floatAmp * 2);
                const currentY = p.y + floatY;
                
                const cloudW = p.radius * 2;
                const cloudH = cloudW * (cloudImg.height / cloudImg.width);

                tintCanvas.width = cloudW;
                tintCanvas.height = cloudH;
                tintCtx.clearRect(0, 0, cloudW, cloudH);
                tintCtx.drawImage(cloudImg, 0, 0, cloudW, cloudH);
                tintCtx.globalCompositeOperation = 'source-in';
                tintCtx.fillStyle = p.color; 
                tintCtx.fillRect(0, 0, cloudW, cloudH);
                
                ctxInflation.globalAlpha = 0.8 + Math.sin(globalTime * 0.5 + p.phase) * 0.1;
                ctxInflation.drawImage(tintCanvas, p.x - cloudW/2, currentY - cloudH/2);
            });
            ctxInflation.restore();
        }
    }

    requestAnimationFrame(masterLoop);
}


// === UNIFIED TOOLTIP FIX ===
const tooltip = document.getElementById("tooltip");
const dateScale = d3.scaleTime().domain([new Date('2020-01-01'), new Date('2024-12-01')]).range([PADDING_X, PADDING_X + EFFECTIVE_WIDTH]);

window.addEventListener("mousemove", function(event) {
    const winWidth = window.innerWidth;
    const mouseXScreen = event.clientX;
    const ratio = Math.min(Math.max(mouseXScreen / winWidth, 0), 1);
    const maxScroll = TOTAL_WIDTH - winWidth;
    targetScroll = ratio * maxScroll; 

    const tooltipX = event.clientX;
    const tooltipY = event.clientY - 30;

    mouseXCanvas = currentScroll + mouseXScreen; 
    mouseYCanvas = event.clientY - (window.innerHeight - HEIGHT); 
    if (mouseYCanvas < 0) mouseYCanvas = event.clientY; 

    if (mouseXCanvas < PADDING_X || mouseXCanvas > TOTAL_WIDTH - PADDING_X) {
        isHovered = false; tooltip.style.opacity = 0; return;
    }
    isHovered = true;

    // 데이터가 아직 로드되지 않았으면 무시
    if (csvData.dates.length === 0) return;

    const dataLen = csvData.dates.length;
    const rawIdx = (mouseXCanvas - PADDING_X) / (EFFECTIVE_WIDTH / (dataLen - 1));
    const idx = Math.round(rawIdx);
    
    if (idx < 0 || idx >= dataLen) return;

    const dateStr = csvData.dates[idx];
    let content = "";
    
    // 1. Weather Info
    if (activeLayers.weather) {
        const temp = csvData.temps[idx];
        const precip = csvData.precips[idx];
        
        let status = "Normal"; let statusColor = "#b0e0e6";
        if(temp > 28) { status = "🔥 Heatwave"; statusColor = "#FF7F50"; }
        else if(temp < 0) { status = "❄️ Cold Wave"; statusColor = "#4B0082"; }
        if(precip > 200) { status += " & ☔ Heavy Rain"; if(statusColor === "#b0e0e6") statusColor = "#7fffd4"; }
        
        content += `<div style="color:${statusColor};font-weight:bold;margin-bottom:3px;">🌡️ ${temp}°C / ☔ ${precip}mm</div>`;
        
        // 잠수함 위치 (보간된 points 배열에서 매핑)
        const pWeather = points[Math.floor((rawIdx / (dataLen - 1)) * 800)] || points[points.length-1];
        if (pWeather) {
            const typhoonSurfaceY = baseCenterY + pWeather.baseFlow + Math.sin(pWeather.t*5 + globalTime*0.5)*10 - (15 + pWeather.tempAmp * 0.35);
            targetSubX = mouseXCanvas;
            targetSubY = Math.max(typhoonSurfaceY, Math.min(mouseYCanvas, HEIGHT - 30));
            if (mouseXCanvas > subX + 5) { isFacingRight = true; } 
            if (mouseXCanvas < subX - 5) { isFacingRight = false; }
        }
    }

    // 2. Harvest (Cabbage)
    if (activeLayers.cabbage) {
        const val = cabbageDataObj.data[idx];
        content += `<div style="color:#00ff7f; font-size:11px; margin-top:2px;">🥬 Est. Harvest: ${val}</div>`;
    }

    // 3. Price (Wave)
    if (activeLayers.wave) {
        const price = csvData.prices[idx];
        content += `<div style="color:#00bfff; font-size:11px; margin-top:2px;">📈 Price: ${price} Won</div>`;
    }

    // 4. Inflation
    if (activeLayers.inflation) {
        const score = csvData.sentiments[idx];
        const inflationPerc = ((1 - score) * 10).toFixed(1);
        content += `<div style="color:#FF7F50; font-size:11px; margin-top:2px;">💭 Infl. Risk: ${inflationPerc}</div>`;
    }

    if (content) {
        tooltip.innerHTML = `<div style="font-size:10px; color:#aaa; border-bottom:1px solid #444; padding-bottom:3px; margin-bottom:3px;">${dateStr}</div>${content}`;
        tooltip.style.left = tooltipX + 15 + "px"; 
        tooltip.style.top = tooltipY + 15 + "px"; 
        tooltip.style.opacity = 1;
    } else {
        tooltip.style.opacity = 0;
    }
});

weatherWrapper.addEventListener("mouseleave", () => { isHovered = false; tooltip.style.opacity = 0; });