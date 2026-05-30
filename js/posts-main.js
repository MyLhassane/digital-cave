import { createSceneContext, bindResizeHandler } from "./scene.js";
import { createCaveTunnel, createCaveMaterial } from "./geometry.js";
import { startAnimationLoop } from "./animate.js";
import { bindMovementControls } from "./controls.js";
import { startFadeAndRedirect } from "./ui.js";

const THREE = window.THREE;

const urlParams = new URLSearchParams(window.location.search);
const domainId = urlParams.get("domain") || "natural";

const { scene, camera, renderer, headlight } = createSceneContext();

const totalPanels = 10;
const panelSpacing = 320;
const caveLength = (totalPanels * panelSpacing) + 2000;

const caveMaterial = createCaveMaterial(0x01131a, 0x004466);
const cave = createCaveTunnel({
    radius: 400, length: caveLength, radialSegments: 20, heightSegments: 60,
    zOffset: -caveLength / 2 + 200, material: caveMaterial
});
scene.add(cave);

const wallBaseColors = [
    new THREE.Color(0x020a14), new THREE.Color(0x120124),
    new THREE.Color(0x01140a), new THREE.Color(0x1a020b)
];
const wallEmissiveColors = [
    new THREE.Color(0x004477), new THREE.Color(0x440088),
    new THREE.Color(0x005522), new THREE.Color(0x660022)
];

const panelsGroup = new THREE.Group();
scene.add(panelsGroup);
const panelsData = [];

function createPanelTexture(title, desc) {
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 512; pCanvas.height = 680;
    const pCtx = pCanvas.getContext("2d");

    pCtx.fillStyle = "rgba(3, 9, 20, 0.98)"; pCtx.fillRect(0, 0, 512, 680);
    pCtx.strokeStyle = "#00d4ff55"; pCtx.lineWidth = 6; pCtx.strokeRect(3, 3, 506, 674);

    const grad = pCtx.createLinearGradient(0, 0, 512, 240);
    grad.addColorStop(0, "#011f38"); grad.addColorStop(1, "#00d4ff");
    pCtx.fillStyle = grad; pCtx.fillRect(25, 25, 462, 240);

    pCtx.fillStyle = "#ffffff"; pCtx.font = "bold 34px sans-serif";
    pCtx.textAlign = "right"; pCtx.textBaseline = "top";
    pCtx.fillText(title, 472, 295);

    pCtx.fillStyle = "#9fa9b8"; pCtx.font = "24px sans-serif";
    const words = desc.split(" "); let line = ""; let yPos = 365;
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        if (pCtx.measureText(testLine).width > 420 && n > 0) {
            pCtx.fillText(line, 472, yPos);
            line = words[n] + " "; yPos += 40;
        } else { line = testLine; }
    }
    pCtx.fillText(line, 472, yPos);
    return new THREE.CanvasTexture(pCanvas);
}

for (let i = 0; i < totalPanels; i++) {
    const isLeft = (i % 2 === 0);
    const texture = createPanelTexture(
        `المقالة الرائعة ${i + 1}`,
        "هذا النص هو ملخص محاكي للمقالة يتم توزيعه ديناميكياً داخل اللوحة مع الحفاظ على التوهج والجمالية العالية للبيئة الكريستالية المغلفة."
    );
    const panelMat = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
    const panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(160, 210), panelMat);

    const xPos = isLeft ? -110 : 110;
    const zPos = -(i * panelSpacing) - 400;

    panelMesh.position.set(xPos, 0, zPos);
    panelsGroup.add(panelMesh);
    panelsData.push({ mesh: panelMesh, z: zPos, isLeft: isLeft });
}

const maxDepth = -(totalPanels * panelSpacing) + 100;
const bounds = { minZ: maxDepth, maxZ: 160 };

const state = {
    targetZ: 100,
    currentZ: 100,
    touchStartY: 0,
    isTransitioning: false
};

bindMovementControls(state, bounds, () => {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    startFadeAndRedirect(`sections.html?domain=${domainId}`, 500);
});

bindResizeHandler(camera, renderer);
startAnimationLoop({
    state, camera, headlight, renderer, scene,
    onFrameUpdate: () => {
        let colorProgress = Math.abs(state.currentZ) / (panelSpacing * 3);
        let currentFloor = Math.floor(colorProgress) % wallBaseColors.length;
        let currentCeil = (currentFloor + 1) % wallBaseColors.length;
        let blendFactor = colorProgress % 1;

        caveMaterial.color.copy(wallBaseColors[currentFloor]).lerp(wallBaseColors[currentCeil], blendFactor);
        caveMaterial.emissive.copy(wallEmissiveColors[currentFloor]).lerp(wallEmissiveColors[currentCeil], blendFactor);
        scene.fog.color.copy(caveMaterial.color);

        panelsData.forEach(panel => {
            let relativeZ = panel.z - state.currentZ;

            if (relativeZ > 130 || relativeZ < -2400) { panel.mesh.visible = false; return; }
            else { panel.mesh.visible = true; }

            if (relativeZ > -400) {
                let exitFade = (relativeZ - (-400)) / 500;
                panel.mesh.material.opacity = 1 - Math.max(0, Math.min(1, exitFade));
            } else if (relativeZ < -1600) {
                let farFade = 1 - ((-relativeZ - 1600) / 800);
                panel.mesh.material.opacity = Math.max(0, Math.min(1, farFade));
            } else { panel.mesh.material.opacity = 1; }

            let baseAngle = panel.isLeft ? 0.32 : -0.32;
            let finalAngle = baseAngle;
            if (relativeZ > -450 && relativeZ < -50) {
                let factor = (relativeZ - (-450)) / 400;
                finalAngle = baseAngle * (1 - Math.max(0, Math.min(1, factor)));
            } else if (relativeZ >= -50) { finalAngle = 0; }
            panel.mesh.rotation.y = finalAngle;
        });
    }
});
