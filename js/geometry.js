export function applyCrystallineDisplacement(geometry) {
    const THREE = window.THREE;
    const posAttr = geometry.attributes.position;
    const colors = [];

    for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);
        const angle = Math.atan2(y, x);

        const rockNoise = Math.sin(z * 0.03) * 40 + Math.cos(angle * 6 + z * 0.01) * 25;
        posAttr.setX(i, x + Math.cos(angle) * rockNoise);
        posAttr.setY(i, y + Math.sin(angle) * rockNoise);

        if (Math.abs(Math.sin(z * 0.04)) > 0.88) {
            colors.push(0.1, 0.3, 0.5);
        } else {
            colors.push(0.05, 0.08, 0.12);
        }
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
}

export function createCaveMaterial() {
    const THREE = window.THREE;
    return new THREE.MeshLambertMaterial({
        vertexColors: true,
        flatShading: true,
        side: THREE.DoubleSide,
        color: new THREE.Color(0x01131a),
        emissive: new THREE.Color(0x004466)
    });
}

export function createMainTunnelMesh(material) {
    const THREE = window.THREE;
    const mainTunnelGeo = new THREE.CylinderGeometry(400, 400, 3500, 24, 60, true);
    mainTunnelGeo.rotateX(Math.PI / 2);
    mainTunnelGeo.translate(0, 0, -1600);
    applyCrystallineDisplacement(mainTunnelGeo);
    return new THREE.Mesh(mainTunnelGeo, material);
}

export function createBranchMesh(cfg, material) {
    const THREE = window.THREE;
    const branchLength = 1200;
    const branchGeo = new THREE.CylinderGeometry(150, 150, branchLength, 16, 20, true);
    branchGeo.rotateX(Math.PI / 2);
    applyCrystallineDisplacement(branchGeo);

    const branchMesh = new THREE.Mesh(branchGeo, material);
    branchMesh.position.set(0, 0, cfg.zFork);
    branchMesh.rotation.y = cfg.angle;
    branchMesh.translateZ(-(branchLength / 2) - 280);

    return branchMesh;
}
