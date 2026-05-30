export function startAnimationLoop({ state, camera, headlight, renderer, scene, onFrameUpdate }) {
    function animate() {
        requestAnimationFrame(animate);

        state.currentZ += (state.targetZ - state.currentZ) * 0.08;
        camera.position.z = state.currentZ;
        headlight.position.z = state.currentZ - 10;
        camera.position.y = 0;

        if (onFrameUpdate) onFrameUpdate(state);

        renderer.render(scene, camera);
    }

    animate();
}
