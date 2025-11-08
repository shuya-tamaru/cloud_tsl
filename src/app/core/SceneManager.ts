import * as THREE from "three/webgpu";

export class SceneManager {
  public scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = null; // Skyで背景を描画するためnullに
    this.createSky();
  }

  private createSky() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 32;

    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context!.createLinearGradient(0, 0, 0, 32);
      // gradient.addColorStop(0.0, "#FFB6B6"); // 明るい赤（上部）
      // gradient.addColorStop(0.5, "#FF7F7F"); // 中間
      // gradient.addColorStop(1.0, "#C94A4A"); // 赤（下部）
      // gradient.addColorStop(0.0, "#87CEEB"); // 明るい空色（上部）
      // gradient.addColorStop(0.5, "#5B9BD5"); // 中間
      // gradient.addColorStop(1.0, "#4682B4"); // 青（下部）

      gradient.addColorStop(0.0, "#87CEEB"); // 明るい空色（上部）
      gradient.addColorStop(0.5, "#5B9BD5"); // 中間
      gradient.addColorStop(1.0, "#4682B4"); // 青（下部）
      context!.fillStyle = gradient;
      context!.fillRect(0, 0, 1, 32);

      const skyMap = new THREE.CanvasTexture(canvas);
      skyMap.colorSpace = THREE.SRGBColorSpace;

      const boxSizeMax = Math.max(1000, 600, 1000); // 1000
      const skyRadius = boxSizeMax * 1.5; // 1500

      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(skyRadius),
        new THREE.MeshBasicNodeMaterial({
          map: skyMap,
          side: THREE.BackSide,
          depthWrite: false, // 背景として機能させる
          depthTest: false, // 常に背景として描画
        })
      );
      this.scene.add(sky);
    }
  }

  public add(object: THREE.Object3D) {
    this.scene.add(object);
  }

  public remove(object: THREE.Object3D) {
    this.scene.remove(object);
  }
}
