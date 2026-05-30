import { createSceneContext, bindResizeHandler } from "./scene.js";
import { createCaveTunnel, createCaveMaterial } from "./geometry.js";
import { startAnimationLoop } from "./animate.js";
import { bindMovementControls, bindSelectionControls } from "./controls.js";
import { startFadeAndRedirect } from "./ui.js";

const urlParams = new URLSearchParams(window.location.search);
const domainId = urlParams.get("domain") || "natural";

const subSectionsDatabase = {
    natural: ["الفيزياء الكونية", "الكيمياء العضوية", "العلوم الحياتية", "جيولوجيا الأرض"],
    social: ["علم النفس السلوكي", "علم الاجتماع البنيوي", "الاقتصاد السياسي"],
    formal: ["الرياضيات البحتة", "المنطق الرياضي", "هندسة البرمجيات"]
};
const currentSections = subSectionsDatabase[domainId] || [];

const { scene, camera, renderer, headlight } = createSceneContext();

const totalLength = Math.max(2000, currentSections.length * 600);
const caveMaterial = createCaveMaterial(0x120124, 0x440088);
const corridor = createCaveTunnel({
    radius: 300, length: totalLength, radialSegments: 24, heightSegments: 40,
    zOffset: -totalLength / 2 + 100, material: caveMaterial
});
scene.add(corridor);

const interactivePortals = [];
function createPortalTexture(title) {
    const THREE = window.THREE;
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 120;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(3, 9, 20, 0.9)"; ctx.fillRect(0, 0, 400, 120);
    ctx.strokeStyle = "#9d00ff"; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 394, 114);
    const grad = ctx.createLinearGradient(0, 0, 400, 120);
    grad.addColorStop(0, "#1a0236"); grad.addColorStop(1, "#9d00ff");
    ctx.fillStyle = grad; ctx.fillRect(15, 15, 370, 90);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(title, 200, 60);
    return new THREE.CanvasTexture(canvas);
}

currentSections.forEach((secName, index) => {
    const THREE = window.THREE;
    const zPos = -400 - (index * 550);
    const isLeft = index % 2 === 0;
    const xPos = isLeft ? -100 : 100;

    const portalTex = createPortalTexture(secName);
    const portalMat = new THREE.MeshBasicMaterial({ map: portalTex, transparent: true, side: THREE.DoubleSide });
    const portalPlane = new THREE.Mesh(new THREE.PlaneGeometry(120, 36), portalMat);

    portalPlane.position.set(xPos, 20, zPos);
    portalPlane.rotation.y = isLeft ? Math.PI / 4 : -Math.PI / 4;
    portalPlane.userData = { redirectUrl: `posts.html?domain=${domainId}&section=${encodeURIComponent(secName)}` };

    scene.add(portalPlane);
    interactivePortals.push(portalPlane);
});

const maxDepth = -(currentSections.length * 550) - 200;
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
    startFadeAndRedirect("index.html", 500);
});

bindSelectionControls({
    state,
    camera,
    interactiveTargets: interactivePortals,
    onTargetSelected: (target) => {
        state.isTransitioning = true;
        startFadeAndRedirect(target.userData.redirectUrl, 600);
    }
});

bindResizeHandler(camera, renderer);
startAnimationLoop({ state, camera, headlight, renderer, scene });
