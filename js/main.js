import { branchesConfig, movementBounds } from "./config.js";
import { createSceneContext, bindResizeHandler } from "./scene.js";
import { createCaveMaterial, createMainTunnelMesh, createBranchMesh } from "./geometry.js";
import { createBranchSignMesh, startFadeAndRedirect } from "./ui.js";
import { bindMovementControls, bindSelectionControls } from "./controls.js";
import { startAnimationLoop } from "./animate.js";

const { scene, camera, renderer, headlight } = createSceneContext();
const caveMaterial = createCaveMaterial();
const mainTunnel = createMainTunnelMesh(caveMaterial);

scene.add(mainTunnel);

const interactiveTargets = [];
branchesConfig.forEach((cfg) => {
    const branchMesh = createBranchMesh(cfg, caveMaterial);
    scene.add(branchMesh);

    const signMesh = createBranchSignMesh(cfg);
    scene.add(signMesh);
    interactiveTargets.push(signMesh);
});

const state = {
    targetZ: 150,
    currentZ: 150,
    touchStartY: 0,
    isTransitioning: false
};

bindMovementControls(state, movementBounds);
bindSelectionControls({
    state,
    camera,
    interactiveTargets,
    onTargetSelected: (target) => {
        state.isTransitioning = true;
        state.targetZ = target.position.z + 50;
        startFadeAndRedirect(target.userData.redirectUrl, 600);
    }
});
bindResizeHandler(camera, renderer);
startAnimationLoop({ state, camera, headlight, renderer, scene });
