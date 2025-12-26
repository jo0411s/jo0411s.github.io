// =========================================================
// script.js (Data from CSV Applied)
// =========================================================

// === 1. CSV DATA INJECTION ===
const csvData = {
    dates: ['2020-01-01', '2020-02-01', '2020-03-01', '2020-04-01', '2020-05-01', '2020-06-01', '2020-07-01', '2020-08-01', '2020-09-01', '2020-10-01', '2020-11-01', '2020-12-01', '2021-01-01', '2021-02-01', '2021-03-01', '2021-04-01', '2021-05-01', '2021-06-01', '2021-07-01', '2021-08-01', '2021-09-01', '2021-10-01', '2021-11-01', '2021-12-01', '2022-01-01', '2022-02-01', '2022-03-01', '2022-04-01', '2022-05-01', '2022-06-01', '2022-07-01', '2022-08-01', '2022-09-01', '2022-10-01', '2022-11-01', '2022-12-01', '2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01', '2023-05-01', '2023-06-01', '2023-07-01', '2023-08-01', '2023-09-01', '2023-10-01', '2023-11-01', '2023-12-01', '2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01', '2024-07-01', '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01'],
    temps: [-2.9, -0.3, 6.7, 12.3, 22.2, 27.6, 29.4, 25.5, 20.5, 13.1, 4.2, -0.5, -1.1, 0.8, 7.0, 15.4, 21.4, 28.5, 27.7, 24.5, 18.8, 10.2, 4.3, -0.8, -2.7, 1.6, 10.0, 15.8, 23.5, 27.7, 29.3, 22.9, 16.9, 10.0, 1.8, -2.1, -1.7, 1.0, 10.3, 17.2, 25.3, 27.8, 25.8, 23.7, 13.0, 7.7, 1.0, -2.9, -0.7, 3.1, 12.8, 18.9, 26.9, 28.4, 27.7, 24.6, 13.0, 5.7, 0.1, -3.2],
    precips: [126, 0, 0, 126, 218, 249, 211, 115, 13, 138, 224, 249, 204, 103, 26, 149, 230, 247, 196, 91, 39, 159, 235, 245, 188, 78, 52, 169, 239, 242, 179, 65, 65, 179, 242, 239, 169, 52, 78, 188, 245, 235, 159, 39, 91, 196, 247, 230, 149, 26, 103, 204, 249, 224, 138, 13, 115, 211, 249, 218],
    prices: [3500, 3464, 3310, 3088, 2870, 2725, 4234, 5489, 3371, 3344, 3626, 3828, 3903, 3842, 3668, 3442, 3233, 3110, 5233, 4869, 3508, 3804, 4075, 4254, 4302, 4214, 4025, 3796, 3600, 3500, 5166, 6302, 3966, 4262, 4519, 4675, 4695, 4583, 4380, 4152, 3971, 4073, 5612, 4658, 4425, 4719, 4960, 5090, 5082, 4948, 4734, 4510, 4346, 5428, 6437, 6200, 8884, 5174, 5396, 5500],
    sentiments: [0.807, 0.747, 0.807, 0.855, 0.9, 0.95, 0.614, 0.312, 0.845, 0.81, 0.825, 0.701, 0.622, 0.69, 0.761, 0.815, 0.95, 0.821, 0.319, 0.463, 0.758, 0.773, 0.6, 0.639, 0.581, 0.545, 0.647, 0.719, 0.685, 0.655, 0.362, 0.25, 0.686, 0.585, 0.48, 0.448, 0.445, 0.455, 0.539, 0.566, 0.714, 0.689, 0.293, 0.561, 0.567, 0.42, 0.376, 0.351, 0.378, 0.457, 0.491, 0.561, 0.516, 0.336, 0.217, 0.183, 0.05, 0.359, 0.409, 0.268]
};

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
// 1. DATA PROCESSING & SETUP
// =========================================================
let targetScroll = 0;
let currentScroll = 0;
let globalTime = 0;

// --- Weather Setup ---
const weatherContainer = d3.select("#weather-chart-container");
weatherContainer.style("width", TOTAL_WIDTH + "px");
const weatherCanvas = weatherContainer.append("canvas").attr("width", TOTAL_WIDTH).attr("height", HEIGHT);
const ctxWeather = weatherCanvas.node().getContext("2d", { alpha: true });

// [수정] CSV 데이터를 보간(Interpolate)하여 연속적인 Weather Data 생성
const steps = 800; // 캔버스 해상도
const points = [];
const dataLen = csvData.temps.length;

// 보간 함수
function lerp(start, end, amt) { return (1 - amt) * start + amt * end; }

for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0.0 ~ 1.0
    
    // CSV 데이터 인덱스로 매핑
    const floatIndex = t * (dataLen - 1);
    const idx1 = Math.floor(floatIndex);
    const idx2 = Math.min(idx1 + 1, dataLen - 1);
    const ratio = floatIndex - idx1;

    // 데이터 가져오기 및 보간
    const tempVal1 = csvData.temps[idx1];
    const tempVal2 = csvData.temps[idx2];
    const rawTemp = lerp(tempVal1, tempVal2, ratio);

    const precipVal1 = csvData.precips[idx1];
    const precipVal2 = csvData.precips[idx2];
    const rawPrecip = lerp(precipVal1, precipVal2, ratio);

    // 시각화를 위한 정규화 및 증폭
    const baseFlow = Math.sin(t * Math.PI * 10) * 15;
    
    // Temp: -5 ~ 30 -> 높이 변화로 매핑
    const tempAmp = (rawTemp - 15) * 5; // 15도를 기준으로 위아래

    // Precip: 0 ~ 250 -> 파도 거칠기로 매핑
    const precipAmp = (rawPrecip / 100) * 15; 

    // Typhoon: 8, 9월(여름) 부근에 랜덤하게 발생하도록 시뮬레이션
    let typhoonVal = 0.2;
    // (간단히 rawTemp가 높고 precip이 높은 구간을 태풍으로 간주)
    if (rawTemp > 25 && rawPrecip > 150) typhoonVal += 1.5;

    points.push({ 
        t: t, 
        x: PADDING_X + (t * EFFECTIVE_WIDTH), 
        baseFlow: baseFlow, 
        tempAmp: tempAmp, 
        precipAmp: precipAmp, 
        typhoonAmp: typhoonVal * 20, 
        rawTemp: rawTemp, 
        rawPrecip: rawPrecip 
    });
}

const colorRain = d3.scaleSequential(d3.interpolateRgb("#00ced1", "#7fffd4")).domain([0, 200]);
const defaultTempColor = "#006994"; 
const baseCenterY = HEIGHT / 2 + 50;
const subImg = new Image(); subImg.src = "submarine.png"; 
let subX = -100; let subY = -100; let targetSubX = -100; let targetSubY = -100; let isFacingRight = true; 

// --- Cabbage Setup (Harvest) ---
// [수정] CSV의 Price 데이터를 역수로 변환하여 가상의 수확량 데이터 생성 (가격 높음 = 수확량 적음 가정)
cabbageInner.style.width = TOTAL_WIDTH + "px";
let cabbageTime = 0;
const cabbageDataObj = (() => {
    const labels = []; 
    const data = [];
    csvData.dates.forEach((dateStr, i) => {
        const [y, m] = dateStr.split("-");
        labels.push({ year: y, month: parseInt(m) });
        
        // 가격(Price)을 수확량으로 역변환 (예: 5000원 -> 작게, 2000원 -> 크게)
        // 시각적으로 적절한 높이가 나오도록 스케일링
        const price = csvData.prices[i];
        const simulatedHarvest = Math.floor(1500000 / price); // 적절한 상수로 나눔
        data.push(simulatedHarvest);
    });
    return { labels, data };
})();

// [복구] 해초 플러그인 (이미지 제거, 원래의 그리기 방식)
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
            
            // 그라데이션 설정
            const gradient = ctx.createLinearGradient(centerX, bottomY, centerX, topY);
            gradient.addColorStop(0, `hsla(120, 90%, 40%, 0.85)`); 
            gradient.addColorStop(1, `hsla(120, 90%, 75%, 0.5)`); 
            ctx.fillStyle = gradient; 
            
            ctx.beginPath();
            const width = 20;
            
            // 왼쪽 라인 (흔들림 효과)
            for (let y = bottomY; y >= topY; y -= 5) {
                const sway = Math.sin(y * 0.015 + cabbageTime * 0.7 + index * 0.5) * ((bottomY - y) / (bottomY - topY) * 6);
                ctx.lineTo(centerX - width/2 + sway, y);
            }
            
            // 상단
            ctx.quadraticCurveTo(
                centerX + Math.sin(topY*0.015+cabbageTime*0.7+index*0.5)*6, 
                topY-10, 
                centerX + width/2 + Math.sin(topY*0.015+cabbageTime*0.7+index*0.5)*6, 
                topY
            );
            
            // 오른쪽 라인
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

const ctxCabbage = document.getElementById('cabbageChart').getContext('2d');
const myCabbageChart = new Chart(ctxCabbage, {
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

// --- Wave Setup (Price) ---
waveInner.style.width = TOTAL_WIDTH + "px";
const waveCanvas = document.getElementById('waveChart');
waveCanvas.width = TOTAL_WIDTH; waveCanvas.height = HEIGHT;
const ctxWave = waveCanvas.getContext("2d", { alpha: true });

// [수정] CSV Price 데이터 사용
const wavePoints = csvData.prices.map((price, i) => {
    const [y, m] = csvData.dates[i].split("-");
    return {
        x: PADDING_X + (i / (csvData.prices.length - 1)) * EFFECTIVE_WIDTH,
        y: 0, 
        value: price,
        year: y,
        month: parseInt(m)
    };
});

// Price Range: ~2700 to ~8900
const yScaleWave = d3.scaleLinear().domain([2000, 9000]).range([0, -350]); 
const colorScaleWave = d3.scaleSequential(d3.interpolateCool).domain([2000, 9000]);
const waveCenterY = HEIGHT * 0.7; // 위치 조금 내림

const lineGenerator = d3.line().x(d => d.x).y(d => waveCenterY + yScaleWave(d.value)).curve(d3.curveCatmullRom.alpha(0.5)).context(ctxWave);

// --- Inflation Setup (Sentiment as Clouds) ---
inflationInner.style.width = TOTAL_WIDTH + "px";
const inflationCanvas = document.getElementById('inflationChart');
inflationCanvas.width = TOTAL_WIDTH; inflationCanvas.height = HEIGHT;
const ctxInflation = inflationCanvas.getContext('2d', { alpha: true });

// [유지] 구름 이미지 로드
const cloudImg = new Image();
cloudImg.src = "cloud.png";

const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d');

const inflationPoints = [];
csvData.sentiments.forEach((score, i) => {
    const progress = i / (csvData.sentiments.length - 1);
    const x = PADDING_X + (progress * EFFECTIVE_WIDTH);
    const date = new Date(csvData.dates[i]);
    
    // Sentiment(0~1) -> Inflation Perception (High means Bad)
    // 점수가 낮을수록(부정적일수록) 인플레이션 우려가 크다고 가정 -> 높이 위치 상단으로, 빨간색
    const inflationMetric = (1 - score) * 10; // 0 ~ 10
    
    // 구름 크기용 카운트 (랜덤성 부여)
    const count = 500 + Math.random() * 1000;

    inflationPoints.push({ 
        x: x, 
        inflation: inflationMetric, 
        count: count, 
        date: date, 
        phase: Math.random() * Math.PI * 2, 
        speed: 0.02 + Math.random() * 0.03, 
        floatAmp: 5 + Math.random() * 10 
    });
});

// [유지] 구름 위치 상향 조정
const yScaleInf = d3.scaleLinear().domain([0, 10]).range([HEIGHT - 100, 50]);
const colorScaleInf = d3.scaleSequential(d3.interpolateRgb("#00BFFF", "#FF3333")).domain([2, 8]);
const rScaleInf = d3.scaleSqrt().domain([0, 1500]).range([30, 90]);

inflationPoints.forEach(p => { 
    p.y = yScaleInf(p.inflation); 
    p.color = colorScaleInf(p.inflation); 
    p.radius = rScaleInf(p.count); 
});


// =========================================================
// 2. MASTER RENDER LOOP
// =========================================================
let mouseXCanvas = -1000; let mouseYCanvas = -1000; let isHovered = false;

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
        
        // 날짜 라벨 표시 (데이터 기반)
        const labelStep = Math.floor(csvData.dates.length / 10); // 너무 많으니 적당히 건너뛰며 표시
        csvData.dates.forEach((dateStr, i) => {
            const x = PADDING_X + (i / (dataLen - 1)) * EFFECTIVE_WIDTH;
            if (x < visibleMin || x > visibleMax) return;
            
            const [y, m] = dateStr.split("-");
            if (m === '01') {
                ctxWeather.font = "bold 13px sans-serif"; ctxWeather.fillStyle = "rgba(255, 255, 255, 0.7)"; ctxWeather.fillText(y, x, HEIGHT - 35); 
                ctxWeather.font = "bold 16px sans-serif"; ctxWeather.fillStyle = "rgba(255, 255, 255, 1.0)"; ctxWeather.fillText(m, x, HEIGHT - 15);
            } else if (i % 3 === 0) { // 3개월마다 표시
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
    if (activeLayers.cabbage) { myCabbageChart.draw(); }

    // --- Wave Render ---
    ctxWave.clearRect(0, 0, TOTAL_WIDTH, HEIGHT);
    if (activeLayers.wave) {
        const zeroY = waveCenterY + yScaleWave(2000); // Base price line
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

        // Axis (Only if weather is hidden)
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
        // Axis (Only if others are hidden)
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
                
                // 둥실거리는 움직임
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
masterLoop(); 


// === UNIFIED TOOLTIP FIX ===
const tooltip = document.getElementById("tooltip");
const dateScale = d3.scaleTime().domain([new Date(csvData.dates[0]), new Date(csvData.dates[csvData.dates.length-1])]).range([PADDING_X, PADDING_X + EFFECTIVE_WIDTH]);

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

    // 데이터 인덱스 계산
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
        
        // 잠수함 타겟 위치 업데이트
        const pWeather = points[Math.floor((rawIdx / (dataLen - 1)) * steps)] || points[points.length-1];
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
        // 역산된 수확량 표시
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
        // 점수가 낮을수록 부정적(High Inflation Fear)
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