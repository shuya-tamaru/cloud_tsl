import * as THREE from "three/webgpu";

export class SceneManager {
  public scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#fff");
    this.createSky();
  }

  private createSky() {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 32;

    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context!.createLinearGradient(0, 0, 0, 100);
      gradient.addColorStop(0.0, "#87CEEB");
      gradient.addColorStop(1.0, "#1E90FF");
      context!.fillStyle = gradient;
      context!.fillRect(0, 0, 1, 100);

      const skyMap = new THREE.CanvasTexture(canvas);
      skyMap.colorSpace = THREE.SRGBColorSpace;

      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(1000),
        new THREE.MeshBasicNodeMaterial({ map: skyMap, side: THREE.BackSide })
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
