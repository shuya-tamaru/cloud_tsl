import * as THREE from "three/webgpu";

export class CameraManager {
  public camera: THREE.PerspectiveCamera;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    this.setInitialPosition();
  }

  private setInitialPosition() {
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      this.camera.position.set(212, -245, 107.6);
    } else {
      this.camera.position.set(212, -245, 107.6);
    }
  }

  public updateAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
