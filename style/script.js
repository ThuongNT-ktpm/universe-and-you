import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.136.0/examples/jsm/controls/OrbitControls.js';

/* ========================================================
   1. CONFIGURATION & STATE
   ======================================================== */
const CONFIG = {
    // Ngày bắt đầu yêu nhau (Năm, Tháng - 1, Ngày, Giờ, Phút)
    loveStartDate: new Date('2024-02-14T00:00:00'),

    // Thư tình bí mật (Hiệu ứng Typewriter)
    loveLetter: `Gửi người con gái anh yêu nhất trần đời ❤️,

Cảm ơn em vì đã xuất hiện và làm cho thế giới của anh trở nên rực rỡ và ngập tràn sắc màu như dải ngân hà này.

Từng khoảnh khắc bên em, từng nụ cười và ánh mắt của em đều là những điều kỳ diệu nhất mà vũ trụ này ban tặng cho anh. Dù sau này có bao nhiêu năm tháng trôi qua, anh vẫn muốn được cùng em ngắm nhìn những vì sao và nắm chặt tay em đi hết chặng đường phía trước.

Chúc em luôn luôn hạnh phúc, rạng rỡ và mãi là công chúa nhỏ của anh nhé! ✨`,

    // Lời chúc & Caption cho từng bức ảnh
    photoCaptions: [
        { title: "Nụ cười của em", text: "Nụ cười của em là ánh sáng rạng rỡ nhất trong vũ trụ của anh." },
        { title: "Khoảnh khắc ngọt ngào", text: "Mỗi giây phút bên em đều là kỷ niệm anh muốn lưu giữ mãi mãi." },
        { title: "Ánh mắt biết nói", text: "Chỉ cần nhìn vào mắt em, anh như thấy cả bầu trời bình yên." },
        { title: "Chuyến đi kỷ niệm", text: "Cùng em đi khắp thế gian là ước muốn lớn nhất của anh." },
        { title: "Công chúa của anh", text: "Dù ngoài kia có giông bão, về bên anh em luôn được yêu thương." },
        { title: "Những ngày bình yên", text: "Chẳng cần hoa mỹ, chỉ cần có em ở bên là đủ trọn vẹn." },
        { title: "Mãi bên nhau nhé", text: "Cảm ơn em vì đã chọn đồng hành cùng anh qua mọi tháng ngày." },
        { title: "Tình yêu nhiệm màu", text: "Em là món quà tuyệt vời nhất mà cuộc đời đã mang đến cho anh." },
        { title: "Vũ trụ và Em", text: "Vũ trụ bao la rộng lớn, nhưng tình yêu anh dành cho em còn lớn hơn thế." }
    ]
};

let isStarted = false;
let autoRotate = true;
let isTypewriting = false;
let typewriterTimeout = null;

/* ========================================================
   2. THREE.JS HIGH PERFORMANCE SETUP
   ======================================================== */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 4, 22);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    precision: "mediump"
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 60;

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    resizeFxCanvas();
});

/* ========================================================
   3. OPTIMIZED COSMIC NEBULA & STARFIELD
   ======================================================== */
// Tạo texture mây tinh vân nhẹ
function createNebulaTexture(colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, colorHex);
    gradient.addColorStop(0.5, colorHex.replace(')', ', 0.25)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
}

// 4 cụm tinh vân tinh giản (không gây tụt FPS)
const nebulaGroup = new THREE.Group();
scene.add(nebulaGroup);

const nebulaColors = ['rgb(255, 105, 180)', 'rgb(147, 51, 234)', 'rgb(59, 130, 246)', 'rgb(244, 63, 94)'];
nebulaColors.forEach((color, idx) => {
    const texture = createNebulaTexture(color);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    for (let i = 0; i < 2; i++) {
        const sprite = new THREE.Sprite(material);
        const radius = Math.random() * 35 + 25;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        sprite.position.setFromSphericalCoords(radius, phi, theta);
        const scale = Math.random() * 30 + 25;
        sprite.scale.set(scale, scale, 1);
        nebulaGroup.add(sprite);
    }
});

// Bầu trời sao (Starfield - 1500 hạt tối ưu)
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xffb6c1),
        new THREE.Color(0xd8bfd8),
        new THREE.Color(0x87cefa)
    ];

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        starPositions[i3] = (Math.random() - 0.5) * 500;
        starPositions[i3 + 1] = (Math.random() - 0.5) * 500;
        starPositions[i3 + 2] = (Math.random() - 0.5) * 500;

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        starColors[i3] = col.r;
        starColors[i3 + 1] = col.g;
        starColors[i3 + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}
createStarfield();

/* ========================================================
   4. GLOWING 3D PARTICLE HEART (TÁN RA & NGƯNG TỤ)
   ======================================================== */
const heartGroup = new THREE.Group();
scene.add(heartGroup);

const HEART_COUNT = 6500; // Tăng lên 6.500 hạt sao để trái tim siêu dày dặn, sắc nét và rực rỡ
let heartGeometry;
let heartPositions;
let heartTargetPositions;
let heartScatterPositions;
let heartParticleDelays;
let heartParticleSpeeds;
let heartGlowSprite;

let isHeartGathering = false;
let heartGatherTime = 0;
const HEART_GATHER_DURATION = 7.0; // Thời gian hội tụ 7 giây
let isHeartFormed = false;

function create3DHeartParticleSystem() {
    heartGeometry = new THREE.BufferGeometry();
    heartPositions = new Float32Array(HEART_COUNT * 3);
    heartTargetPositions = new Float32Array(HEART_COUNT * 3);
    heartScatterPositions = new Float32Array(HEART_COUNT * 3);
    heartParticleDelays = new Float32Array(HEART_COUNT);
    heartParticleSpeeds = new Float32Array(HEART_COUNT);
    const colors = new Float32Array(HEART_COUNT * 3);

    const baseColor1 = new THREE.Color(0xff007f); // Hồng Rose rực rỡ
    const baseColor2 = new THREE.Color(0xff1493); // Deep Pink
    const baseColor3 = new THREE.Color(0xff69b4); // Hot Pink
    const baseColor4 = new THREE.Color(0xffb6c1); // Light Pink
    const baseColor5 = new THREE.Color(0xffffff); // Hạt trắng kim cương

    let pIdx = 0;
    for (let i = 0; i < HEART_COUNT; i++) {
        const t = Math.random() * Math.PI * 2;
        const u = (Math.random() - 0.5) * 2;

        // Công thức tham số đường cong trái tim 3D
        const x0 = 16 * Math.pow(Math.sin(t), 3);
        const y0 = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        let scaleFactor;
        let z0;

        // 40% hạt đầu tiên tập trung ở bề mặt / viền ngoài để định hình trái tim cực kỳ sắc nét
        if (i < 2600) {
            scaleFactor = 0.88 + Math.random() * 0.12; // Bo sát viền ngoài
            z0 = u * 8 * Math.sqrt(Math.max(0, 1 - Math.pow(Math.sin(t), 2)));
        } else {
            // 60% hạt còn lại lấp đầy không gian 3D bên trong
            scaleFactor = Math.pow(Math.random(), 0.55);
            z0 = u * 13 * Math.sqrt(Math.max(0, 1 - Math.pow(Math.sin(t), 2)));
        }

        const scale = 0.72 * scaleFactor;

        heartTargetPositions[pIdx] = x0 * scale;
        heartTargetPositions[pIdx + 1] = y0 * scale;
        heartTargetPositions[pIdx + 2] = z0 * scale;

        // 2. Tọa độ ban đầu (Phân tán rộng khắp vũ trụ)
        const scatterRadius = Math.random() * 70 + 25;
        const sTheta = Math.random() * Math.PI * 2;
        const sPhi = Math.acos(2 * Math.random() - 1);
        const sx = scatterRadius * Math.sin(sPhi) * Math.cos(sTheta);
        const sy = scatterRadius * Math.sin(sPhi) * Math.sin(sTheta);
        const sz = scatterRadius * Math.cos(sPhi);

        heartScatterPositions[pIdx] = sx;
        heartScatterPositions[pIdx + 1] = sy;
        heartScatterPositions[pIdx + 2] = sz;

        // Vị trí xuất phát là vị trí phân tán
        heartPositions[pIdx] = sx;
        heartPositions[pIdx + 1] = sy;
        heartPositions[pIdx + 2] = sz;

        // Độ trễ & tốc độ bay riêng phân bố đều trong 7 giây
        heartParticleDelays[i] = Math.random() * 2.3;
        heartParticleSpeeds[i] = Math.random() * 0.35 + 0.85;

        // Phối màu hạt lấp lánh đa tầng
        const randCol = Math.random();
        let col;
        if (randCol > 0.75) col = baseColor1;
        else if (randCol > 0.5) col = baseColor2;
        else if (randCol > 0.3) col = baseColor3;
        else if (randCol > 0.15) col = baseColor4;
        else col = baseColor5;

        colors[pIdx] = col.r;
        colors[pIdx + 1] = col.g;
        colors[pIdx + 2] = col.b;

        pIdx += 3;
    }

    heartGeometry.setAttribute('position', new THREE.BufferAttribute(heartPositions, 3));
    heartGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 105, 180, 0.9)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const particleTex = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
        size: 0.55, // Kích thước hạt sắc nét vừa vặn khi mật độ dày
        map: particleTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const heartPoints = new THREE.Points(heartGeometry, material);
    heartGroup.add(heartPoints);

    // Quầng sáng tâm (Bao trùm toàn bộ trái tim khổng lồ)
    const glowTex = createNebulaTexture('rgb(255, 50, 150)');
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    heartGlowSprite = new THREE.Sprite(glowMaterial);
    heartGlowSprite.scale.set(22, 22, 1);
    heartGroup.add(heartGlowSprite);
}
create3DHeartParticleSystem();

function updateHeartParticles(delta, elapsedTime) {
    if (isHeartGathering) {
        heartGatherTime += delta;
        let allArrived = true;

        for (let i = 0; i < HEART_COUNT; i++) {
            const pIdx = i * 3;
            const delay = heartParticleDelays[i];
            const speed = heartParticleSpeeds[i];

            const t = Math.max(0, Math.min(1, (heartGatherTime - delay) / (4.2 * speed)));
            if (t < 1) allArrived = false;

            // EaseInOut Cubic
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            // Xoáy xoắn ốc nhẹ khi lao về tâm
            const swirlAngle = (1 - ease) * 1.5;
            const sx = heartScatterPositions[pIdx];
            const sy = heartScatterPositions[pIdx + 1];
            const sz = heartScatterPositions[pIdx + 2];

            const tx = heartTargetPositions[pIdx];
            const ty = heartTargetPositions[pIdx + 1];
            const tz = heartTargetPositions[pIdx + 2];

            let curX = sx + (tx - sx) * ease;
            let curY = sy + (ty - sy) * ease;
            let curZ = sz + (tz - sz) * ease;

            if (swirlAngle > 0.001) {
                const cosA = Math.cos(swirlAngle);
                const sinA = Math.sin(swirlAngle);
                const rx = curX * cosA - curZ * sinA;
                const rz = curX * sinA + curZ * cosA;
                curX = rx;
                curZ = rz;
            }

            heartPositions[pIdx] = curX;
            heartPositions[pIdx + 1] = curY;
            heartPositions[pIdx + 2] = curZ;
        }

        heartGeometry.attributes.position.needsUpdate = true;

        // Quầng sáng tâm hiện dần lên
        const progressRatio = Math.min(1, heartGatherTime / HEART_GATHER_DURATION);
        if (heartGlowSprite) {
            heartGlowSprite.material.opacity = progressRatio * 0.65;
        }

        if (allArrived && heartGatherTime >= HEART_GATHER_DURATION) {
            isHeartGathering = false;
            isHeartFormed = true;
        }
    }

    // Khi đã hoàn tất tụ lại -> Phập phồng theo nhịp đập trái tim
    if (isHeartFormed) {
        const heartPulse = 1 + Math.sin(elapsedTime * 3) * 0.06;
        heartGroup.scale.set(heartPulse, heartPulse, heartPulse);
        heartGroup.rotation.y += 0.002;
    } else {
        heartGroup.rotation.y += 0.0008;
    }
}

/* ========================================================
   5. ZERO-ALLOCATION METEORS POOL (SAO BĂNG KHÔNG GIẬT LAG)
   ======================================================== */
const meteorGroup = new THREE.Group();
scene.add(meteorGroup);

const METEOR_POOL_SIZE = 4;
const meteorPool = [];

// Khởi tạo trước một vùng nhớ cố định để không tạo/hủy buffer liên tục
const meteorMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
});

for (let i = 0; i < METEOR_POOL_SIZE; i++) {
    const len = 7;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array([0, 0, 0, -len, -len * 0.5, -len]);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const meteor = new THREE.Line(geo, meteorMat.clone());
    meteor.visible = false;
    meteor.userData = {
        active: false,
        vx: 0, vy: 0, vz: 0,
        life: 0, decay: 0.02
    };
    meteorGroup.add(meteor);
    meteorPool.push(meteor);
}

function triggerMeteorFromPool() {
    const m = meteorPool.find(item => !item.userData.active);
    if (!m) return;

    m.position.set(
        (Math.random() - 0.5) * 120,
        Math.random() * 30 + 15,
        (Math.random() - 0.5) * 120
    );

    const speed = Math.random() * 1.2 + 1.0;
    m.userData.vx = -speed;
    m.userData.vy = -speed * 0.5;
    m.userData.vz = -speed;
    m.userData.life = 1.0;
    m.userData.decay = Math.random() * 0.02 + 0.015;
    m.userData.active = true;
    m.visible = true;
    m.material.opacity = 1;
}

function updateMeteorsPool() {
    if (Math.random() < 0.03) {
        triggerMeteorFromPool();
    }

    for (let i = 0; i < METEOR_POOL_SIZE; i++) {
        const m = meteorPool[i];
        if (m.userData.active) {
            m.position.x += m.userData.vx;
            m.position.y += m.userData.vy;
            m.position.z += m.userData.vz;
            m.userData.life -= m.userData.decay;
            m.material.opacity = Math.max(0, m.userData.life);

            if (m.userData.life <= 0) {
                m.userData.active = false;
                m.visible = false;
            }
        }
    }
}

/* ========================================================
   6. HỆ THỐNG THÔNG BÁO TOAST & THEO DÕI TIẾN TRÌNH TẢI
   ======================================================== */
let toastTimeout = null;
function showToast(message, icon = "✨", duration = 3200) {
    const toast = document.getElementById("toast");
    const toastIcon = document.getElementById("toast-icon");
    const toastMsg = document.getElementById("toast-message");
    if (!toast || !toastMsg) return;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastIcon.textContent = icon;
    toastMsg.textContent = message;
    toast.classList.remove("hidden");

    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, duration);
}

// Bắt sự kiện mạng
window.addEventListener("offline", () => {
    showToast("Mất kết nối mạng rồi, em kiểm tra lại nhé! 📶", "⚠️", 4000);
});
window.addEventListener("online", () => {
    showToast("Đã kết nối lại Internet thành công! ✨", "💖", 3000);
});

// Loading Progress Tracker
const loadingBox = document.getElementById("loading-box");
const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingStatusText = document.getElementById("loading-status-text");

// Cảnh báo nếu mạng yếu sau 3 giây
const slowNetworkTimer = setTimeout(() => {
    if (loadingStatusText && (!isStarted)) {
        loadingStatusText.textContent = "✨ Mạng hơi chậm xíu, vũ trụ đang gom góp yêu thương...";
    }
}, 3000);

// Hàm tạo texture dự phòng nếu ảnh bị lỗi mạng
function createFallbackImageTexture(id) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Nền gradient hồng tím
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0, '#ff1493');
    grad.addColorStop(1, '#7b2cbf');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    // Trái tim ở giữa
    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💖', 64, 64);

    return new THREE.CanvasTexture(canvas);
}

// Bo góc ảnh và tạo viền phát sáng
function createRoundedImageTexture(image) {
    const canvas = document.createElement('canvas');
    const radius = 18;
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(image, 0, 0, size, size);

    ctx.strokeStyle = 'rgba(255, 182, 193, 0.85)';
    ctx.lineWidth = 6;
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
}

// Tải 9 bức ảnh có bộ đếm và tự hồi phục khi gặp lỗi
const textureLoader = new THREE.TextureLoader();
const spriteGroup = new THREE.Group();
scene.add(spriteGroup);

const photoMaterials = [];
const photoData = [];
let loadedCount = 0;
const totalImages = 9;

function onSingleImageReady(index, texture) {
    const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.95
    });

    photoMaterials.push(mat);
    photoData.push({
        id: index,
        src: `./style/img/Anh (${index}).jpg`,
        matIndex: photoMaterials.length - 1
    });

    loadedCount++;
    if (loadingBarFill) {
        const pct = Math.min(100, Math.round((loadedCount / totalImages) * 100));
        loadingBarFill.style.width = `${pct}%`;
    }

    if (loadedCount >= totalImages && loadingStatusText) {
        clearTimeout(slowNetworkTimer);
        loadingStatusText.textContent = "✨ Vũ trụ đã sẵn sàng! Chạm hộp quà nhé ❤️";
    }
}

for (let i = 1; i <= totalImages; i++) {
    textureLoader.load(
        `./style/img/Anh (${i}).jpg`,
        (imgTexture) => {
            const roundedTexture = createRoundedImageTexture(imgTexture.image);
            onSingleImageReady(i, roundedTexture);
        },
        undefined,
        () => {
            // Xử lý khi ảnh lỗi: Dùng texture fallback để không crash web
            const fallbackTex = createFallbackImageTexture(i);
            onSingleImageReady(i, fallbackTex);
        }
    );
}

const numSprites = 200;
let spritesInitialized = false;

const checkReady = setInterval(() => {
    if (photoMaterials.length >= 5 && !spritesInitialized) {
        spritesInitialized = true;
        clearInterval(checkReady);

        for (let i = 0; i < numSprites; i++) {
            const randomIndex = Math.floor(Math.random() * photoMaterials.length);
            const mat = photoMaterials[randomIndex];
            const item = photoData[randomIndex] || photoData[0];

            const sprite = new THREE.Sprite(mat);
            const radius = Math.random() * 26 + 9;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            sprite.position.setFromSphericalCoords(radius, phi, theta);

            const scale = Math.random() * 1.3 + 1.1;
            sprite.scale.set(scale, scale, 1);

            sprite.userData = {
                photoId: item ? item.id : 1,
                src: item ? item.src : `./style/img/Anh (1).jpg`,
                captionIndex: (i) % CONFIG.photoCaptions.length
            };

            spriteGroup.add(sprite);
        }

        // Pre-compile toàn bộ Shader & Texture vào GPU trước khi mở quà để triệt tiêu độ trễ
        renderer.compile(scene, camera);
    }
}, 80);

/* ========================================================
   7. 3D LOVE MESSAGES & FLOATING EMOJIS
   ======================================================== */
function createTextSprite(message, parameters = {}) {
    const font = parameters.font || "bold 38px 'Outfit', sans-serif";
    const color = parameters.color || "#ffb6c1";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    const textWidth = context.measureText(message).width;

    canvas.width = textWidth + 60;
    canvas.height = 80;
    context.font = font;
    context.fillStyle = color;
    context.shadowColor = "rgba(255, 105, 180, 0.8)";
    context.shadowBlur = 12;
    context.fillText(message, 30, 52);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(6.5, 1.6, 1);
    return sprite;
}

function createEmojiSprite(emoji, scale = 1.8) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const size = 48;
    canvas.width = size;
    canvas.height = size;
    context.font = `${size * 0.75}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(emoji, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.65
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale, scale, 1);
    return sprite;
}

const messages = [
    "I Love You ❤️",
    "Anh Yêu Em",
    "Em Là Cả Thế Giới",
    "Anh Nhớ Em",
    "Mãi Bên Nhau Nhé 💖",
    "Nguyễn Tiến Thương",
    "Vũ Trụ Và Em ✨",
    "My Princess 👑"
];

messages.forEach((msg) => {
    const sprite = createTextSprite(msg, { color: "#ffffff" });
    sprite.position.set(
        Math.random() * 36 - 18,
        Math.random() * 20 - 10,
        Math.random() * -28
    );
    scene.add(sprite);
});

const emojis = ["❤️", "💓", "💘", "🌺", "🌹", "✨", "🍀", "💫", "💖"];
for (let i = 0; i < 20; i++) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const sprite = createEmojiSprite(emoji, Math.random() * 1.2 + 1.1);
    sprite.position.set(
        Math.random() * 40 - 20,
        Math.random() * 24 - 12,
        Math.random() * -30
    );
    scene.add(sprite);
}

/* ========================================================
   8. RAYCASTING INTERACTIVE PHOTO MODAL
   ======================================================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const photoModal = document.getElementById("photo-modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-caption-title");
const modalText = document.getElementById("modal-caption-text");
const photoClose = document.getElementById("photo-close");

function openPhotoModal(sprite) {
    if (!sprite || !sprite.userData || !sprite.userData.src) return;
    const { src, captionIndex } = sprite.userData;
    const captionInfo = CONFIG.photoCaptions[captionIndex] || CONFIG.photoCaptions[0];

    modalImg.src = src;
    modalTitle.textContent = captionInfo.title;
    modalText.textContent = `"${captionInfo.text}"`;
    photoModal.classList.remove("hidden");
}

function closePhotoModal() {
    photoModal.classList.add("hidden");
}

photoClose.addEventListener("click", closePhotoModal);
photoModal.querySelector(".modal-backdrop").addEventListener("click", closePhotoModal);

// Tối ưu cảm ứng Mobile: Phân biệt chính xác giữa cử chỉ vuốt xoay 3D và chạm mở ảnh
let pointerDownPos = { x: 0, y: 0 };
let pointerDownTime = 0;

window.addEventListener("pointerdown", (e) => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
    pointerDownTime = performance.now();
});

window.addEventListener("pointerup", (event) => {
    if (!isStarted || event.target.closest("#control-panel") || event.target.closest(".modal") || event.target.closest("#love-counter")) {
        return;
    }

    const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
    const duration = performance.now() - pointerDownTime;

    // Trên điện thoại: nếu vuốt ngón tay > 8px hoặc kéo giữ > 350ms thì là xoay vũ trụ, không mở modal
    if (dist > 8 || duration > 350) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spriteGroup.children);

    if (intersects.length > 0) {
        const hitSprite = intersects[0].object;
        openPhotoModal(hitSprite);
    }
});

/* ========================================================
   9. 2D CANVAS FX (OPTIMIZED BITMAP CACHING)
   ======================================================== */
const fxCanvas = document.getElementById("fxCanvas");
const fxCtx = fxCanvas.getContext("2d");
let fxParticles = [];

// Cache trước hình trái tim vào bitmap nhỏ để vẽ cực nhanh, không gọi fillText liên tục
const cachedHeartCanvas = document.createElement('canvas');
cachedHeartCanvas.width = 32;
cachedHeartCanvas.height = 32;
const hctx = cachedHeartCanvas.getContext('2d');
hctx.font = '22px Arial';
hctx.textAlign = 'center';
hctx.textBaseline = 'middle';
hctx.fillText('❤️', 16, 16);

function resizeFxCanvas() {
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
}
resizeFxCanvas();

class FxParticle {
    constructor(x, y, isFirework = false) {
        this.x = x;
        this.y = y;
        this.isFirework = isFirework;

        if (isFirework) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.size = Math.random() * 12 + 8;
        } else {
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5 - 0.8;
            this.gravity = -0.015;
            this.decay = Math.random() * 0.035 + 0.025;
            this.size = Math.random() * 8 + 5;
        }

        this.alpha = 1;
        this.type = Math.random() > 0.4 ? 'heart' : 'star';
        this.color = ['#ff69b4', '#ffb6c1', '#ffffff', '#e0aaff'][Math.floor(Math.random() * 4)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        if (this.type === 'heart') {
            ctx.drawImage(cachedHeartCanvas, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function triggerHeartFireworks(x, y) {
    for (let i = 0; i < 70; i++) {
        fxParticles.push(new FxParticle(x, y, true));
    }
}

// Giảm tần suất spawn particle chuột để tránh khựng
let lastPointerMove = 0;
window.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - lastPointerMove > 40) {
        lastPointerMove = now;
        if (fxParticles.length < 50) {
            fxParticles.push(new FxParticle(e.clientX, e.clientY, false));
        }
    }
});

function renderFxOnFrame() {
    if (fxParticles.length === 0) return;
    fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    for (let i = fxParticles.length - 1; i >= 0; i--) {
        const p = fxParticles[i];
        p.update();
        p.draw(fxCtx);
        if (p.alpha <= 0) {
            fxParticles.splice(i, 1);
        }
    }
}

/* ========================================================
   11. TYPEWRITER LOVE LETTER MODAL
   ======================================================== */
const letterModal = document.getElementById("letter-modal");
const letterBtn = document.getElementById("btn-letter");
const letterClose = document.getElementById("letter-close");
const typewriterTextEl = document.getElementById("typewriter-text");

function startTypewriter() {
    if (isTypewriting) return;
    isTypewriting = true;
    typewriterTextEl.textContent = "";
    let i = 0;
    const text = CONFIG.loveLetter;

    function typeChar() {
        if (i < text.length) {
            typewriterTextEl.textContent += text.charAt(i);
            i++;
            typewriterTimeout = setTimeout(typeChar, 30);
        } else {
            isTypewriting = false;
        }
    }
    typeChar();
}

function openLetterModal() {
    letterModal.classList.remove("hidden");
    startTypewriter();
}

function closeLetterModal() {
    letterModal.classList.add("hidden");
    if (typewriterTimeout) clearTimeout(typewriterTimeout);
    isTypewriting = false;
}

if (letterBtn) letterBtn.addEventListener("click", openLetterModal);
if (letterClose) letterClose.addEventListener("click", closeLetterModal);
if (letterModal) letterModal.querySelector(".modal-backdrop").addEventListener("click", closeLetterModal);

/* ========================================================
   12. AUDIO & UI CONTROLS
   ======================================================== */
const audio = document.getElementById("sound");
const overlay = document.getElementById("overlay");
const uiContainer = document.getElementById("ui-container");
const btnMusic = document.getElementById("btn-music");
const guideHint = document.getElementById("guide-hint");

if (btnMusic) {
    btnMusic.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            btnMusic.classList.add("playing");
        } else {
            audio.pause();
            btnMusic.classList.remove("playing");
        }
    });
}

let isIntroAnimating = false;
let introProgress = 0;

// Camera cố định ở góc nhìn toàn cảnh vũ trụ đẹp mắt nhất (z = 40)
camera.position.set(0, 4, 40);

// Mở Quà
overlay.addEventListener("click", (e) => {
    triggerHeartFireworks(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);

    audio.play().then(() => {
        if (btnMusic) btnMusic.classList.add("playing");
    }).catch(() => {
        showToast("Chạm nút 🎵 ở góc phải để bật nhạc nhé em!", "🎵", 4000);
    });

    overlay.classList.add("hidden");
    if (uiContainer) uiContainer.classList.remove("hidden");
    isStarted = true;
    isIntroAnimating = false;

    // Kích hoạt hàng ngàn hạt sao bay từ khắp vũ trụ tụ về thành trái tim 3D
    isHeartGathering = true;
    heartGatherTime = 0;
    isHeartFormed = false;

    setTimeout(() => {
        if (guideHint) guideHint.classList.add("fade-out");
    }, 5000);
});

/* ========================================================
   13. SINGLE UNIFIED SMOOTH RENDER LOOP (60FPS+ LOCKED)
   ======================================================== */
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsedTime = clock.getElapsedTime();

    controls.update();

    if (isStarted) {
        if (autoRotate) {
            scene.rotation.y += 0.001;
            nebulaGroup.rotation.y -= 0.0003;
        }

        // Cập nhật hiệu ứng ngưng tụ & nhịp đập của hàng ngàn hạt trái tim
        updateHeartParticles(delta, elapsedTime);

        // Cập nhật pool sao băng (Zero allocation)
        updateMeteorsPool();
    }

    // Render Three.js
    renderer.render(scene, camera);

    // Gộp render FX hạt vào cùng 1 vòng lặp để đồng bộ tuyệt đối
    renderFxOnFrame();
});
