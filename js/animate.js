export function startAnimationLoop({ state, camera, headlight, renderer, scene }) {
    function animate() {
        requestAnimationFrame(animate);

        state.currentZ += (state.targetZ - state.currentZ) * 0.08;
        camera.position.z = state.currentZ;
        headlight.position.z = state.currentZ - 10;
        camera.position.y = 0;

        renderer.render(scene, camera);
    }

    animate();
}
