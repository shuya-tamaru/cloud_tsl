import * as THREE from "three/webgpu";
import { CloudConfig } from "./cloudConfig";
import {
  Discard,
  exp,
  float,
  Fn,
  If,
  length,
  smoothstep,
  uv,
  vec3,
  vec4,
} from "three/tsl";

export class Sun {
  private scene: THREE.Scene;
  private cloudConfig!: CloudConfig;

  private geometry!: THREE.PlaneGeometry;
  private material!: THREE.MeshBasicNodeMaterial;
  private mesh!: THREE.Mesh;

  constructor(scene: THREE.Scene, cloudConfig: CloudConfig) {
    this.scene = scene;
    this.cloudConfig = cloudConfig;
    this.createGeometry();
    this.createMaterial();
    this.createSprite();
  }

  private createGeometry() {
    this.geometry = new THREE.PlaneGeometry(50, 50);
    // this.geometry.rotateX(Math.PI / 2);
  }

  private createMaterial() {
    this.material = new THREE.MeshBasicNodeMaterial({
      side: THREE.DoubleSide,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    this.updateMaterialPosition();
  }

  private createSprite() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  private updateMaterialPosition() {
    this.material.fragmentNode = Fn(() => {
      const toCenter = uv().mul(2.0).sub(1.0);
      const r = length(toCenter);
      const threshold = 1.0;

      // Hard circle cut
      If(r.greaterThan(threshold), () => {
        Discard();
      });

      const core = exp(r.mul(-80.0)).mul(100.0);
      const glow = exp(r.mul(-8.0)).mul(4.0);
      const color = vec3(1.0, 0.95, 0.85);
      const sun = color.mul(core.add(glow));
      const alpha = float(1.0).sub(smoothstep(0.85, 1.0, r));
      return vec4(sun, alpha);
    })();
  }

  public updatePositionFromDirection() {
    const dir = new THREE.Vector3(
      this.cloudConfig.sunDirectionX.value,
      this.cloudConfig.sunDirectionY.value,
      this.cloudConfig.sunDirectionZ.value
    ).normalize();

    const offset = 300;
    this.mesh.position.copy(dir.multiplyScalar(offset));
  }

  public addToScene() {
    this.scene.add(this.mesh);
  }

  public updateLookAt(target: THREE.Vector3) {
    this.updatePositionFromDirection();
    this.mesh.lookAt(target);
  }
}
