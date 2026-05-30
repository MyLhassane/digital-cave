export function createGlowingSignboard(text, colorHex) {
    const THREE = window.THREE;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(3, 9, 20, 0.9)";
    ctx.fillRect(0, 0, 512, 180);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 172);

    const grad = ctx.createLinearGradient(0, 0, 512, 180);
    grad.addColorStop(0, "#011f38");
    grad.addColorStop(1, colorHex);
    ctx.fillStyle = grad;
    ctx.fillRect(20, 20, 472, 140);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 90);

    return new THREE.CanvasTexture(canvas);
}

export function createBranchSignMesh(cfg) {
    const THREE = window.THREE;
    const signTex = createGlowingSignboard(cfg.name, cfg.color);
    const signMat = new THREE.MeshBasicMaterial({
        map: signTex,
        side: THREE.DoubleSide,
        transparent: true
    });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(160, 55), signMat);

    signMesh.position.set(0, 0, cfg.zFork);
    signMesh.rotation.y = cfg.angle * 0.5;
    signMesh.translateZ(-300);
    signMesh.translateX(cfg.side * -50);
    signMesh.position.y = 80;
    signMesh.userData = { redirectUrl: `sections.html?domain=${cfg.id}` };

    return signMesh;
}

export function startFadeAndRedirect(url, delayMs = 600) {
    const fadeOverlay = document.getElementById("fade-overlay");
    fadeOverlay.style.opacity = "1";
    setTimeout(() => {
        window.location.href = url;
    }, delayMs);
}
