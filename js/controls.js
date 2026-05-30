function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function bindMovementControls(state, bounds, onExceedMax) {
    window.addEventListener("touchstart", (e) => {
        state.touchStartY = e.touches[0].clientY;
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
        if (state.isTransitioning) return;
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const deltaY = state.touchStartY - touchY;
        state.targetZ -= deltaY * 2.0;

        if (onExceedMax && state.targetZ > bounds.maxZ) {
            onExceedMax();
            state.targetZ = bounds.maxZ;
            state.touchStartY = touchY;
            return;
        }

        state.targetZ = clamp(state.targetZ, bounds.minZ, bounds.maxZ);
        state.touchStartY = touchY;
    }, { passive: false });

    window.addEventListener("wheel", (e) => {
        if (state.isTransitioning) return;
        state.targetZ -= e.deltaY * 0.75;

        if (onExceedMax && state.targetZ > bounds.maxZ) {
            onExceedMax();
            state.targetZ = bounds.maxZ;
            return;
        }

        state.targetZ = clamp(state.targetZ, bounds.minZ, bounds.maxZ);
    });
}

export function bindSelectionControls({ state, camera, interactiveTargets, onTargetSelected }) {
    const THREE = window.THREE;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function handleClick(clientX, clientY) {
        if (state.isTransitioning) {
            return;
        }

        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(interactiveTargets);
        if (intersects.length > 0) {
            onTargetSelected(intersects[0].object);
        }
    }

    window.addEventListener("click", (e) => handleClick(e.clientX, e.clientY));
    window.addEventListener("touchend", (e) => {
        if (e.changedTouches.length > 0) {
            handleClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
    });
}
