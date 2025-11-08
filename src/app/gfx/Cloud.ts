import * as THREE from "three/webgpu";
import { CloudConfig } from "./cloudConfig";
import {
  cameraPosition,
  float,
  Fn,
  If,
  Loop,
  max,
  modelWorldMatrixInverse,
  normalize,
  positionWorld,
  vec3,
  vec4,
  exp,
  dot,
  abs,
} from "three/tsl";
import { createWeatherMap } from "./utils/createWeatherMap";
import { createNoiseTexture } from "./utils/createNoiseTexture";
import { calculateBoxDistance } from "./utils/calculateBoxDistance";
import { calculateDensity } from "./utils/calculateDensity";
import { calculateISO } from "./utils/calculateISO";
import { calculateOSAmbient } from "./utils/calculateOSAmbient";

export class Cloud {
  private scene: THREE.Scene;
  private renderer: THREE.WebGPURenderer;
  private cloudConfig: CloudConfig;

  private weatherMapTexture!: THREE.StorageTexture;
  private noiseTexture!: THREE.StorageTexture;
  private noiseTextureLow!: THREE.StorageTexture;

  private geometry!: THREE.BoxGeometry;
  private material!: THREE.MeshBasicNodeMaterial;
  private mesh!: THREE.Mesh;

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGPURenderer,
    cloudConfig: CloudConfig
  ) {
    this.scene = scene;
    this.renderer = renderer;
    this.cloudConfig = cloudConfig;
    this.computeWeatherMap();
    this.computeNoiseTexture();
    this.computeNoiseTextureLow();
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
  }

  private createGeometry() {
    const { boxSize } = this.cloudConfig;
    this.geometry = new THREE.BoxGeometry(
      boxSize.x.value,
      boxSize.y.value,
      boxSize.z.value
    );
  }

  private createMaterial() {
    this.material = new THREE.MeshBasicNodeMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.updateMaterialNode();
  }

  private createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  public addToScene() {
    this.scene.add(this.mesh);
  }

  private async computeWeatherMap() {
    const { weatherPositionParam, weatherPositionParamLow } = this.cloudConfig;
    const { compute, storageTexture: weatherMapTexture } = createWeatherMap(
      512,
      weatherPositionParam,
      weatherPositionParamLow
    );

    this.weatherMapTexture = weatherMapTexture;
    await this.renderer.computeAsync(compute);
  }

  private async computeNoiseTexture() {
    const { textureSize, textureSlice, textureFrequencies } = this.cloudConfig;
    const { compute, storageTexture } = createNoiseTexture(
      textureSize,
      textureSlice.x.value,
      textureFrequencies
    );

    this.noiseTexture = storageTexture;
    await this.renderer.computeAsync(compute);
  }

  private async computeNoiseTextureLow() {
    const { textureSizeLow, textureSlice, textureFrequencies } =
      this.cloudConfig;
    const { compute, storageTexture } = createNoiseTexture(
      textureSizeLow,
      textureSlice.x.value,
      textureFrequencies
    );

    this.noiseTextureLow = storageTexture;
    await this.renderer.computeAsync(compute);
  }

  private updateMaterialNode() {
    const {
      boxSize,
      gd,
      gc,
      textureSlice,
      aa,
      b,
      osa,
      csi,
      cse,
      ins,
      outs,
      ivo,
      ac,
      amin,
    } = this.cloudConfig;
    const cellsX = textureSlice.x.value;
    const cellsY = textureSlice.y.value;
    const slices = cellsX * cellsY;

    this.material.fragmentNode = Fn(() => {
      const boxMin = vec3(
        boxSize.x.mul(-0.5),
        boxSize.y.mul(-0.5),
        boxSize.z.mul(-0.5)
      );
      const boxMax = vec3(
        boxSize.x.mul(0.5),
        boxSize.y.mul(0.5),
        boxSize.z.mul(0.5)
      );

      const color = vec4(0.0, 0.0, 0.0, 1.0).toVar();

      const rayOriginWorld = cameraPosition;
      const rayDirWorld = normalize(positionWorld.sub(cameraPosition));
      const invModel = modelWorldMatrixInverse;
      const rayOriginLocal = invModel.mul(vec4(rayOriginWorld, 1.0)).xyz;
      const rayDirLocal = normalize(invModel.mul(vec4(rayDirWorld, 0.0)).xyz);

      //sun

      const sunDirection = normalize(vec3(0.3, 1.0, 0.2));
      const sunDirectionLocal = normalize(
        invModel.mul(vec4(sunDirection, 0.0)).xyz
      );
      //sun

      //@ts-ignore
      //prettier-ignore
      const boxDistance = calculateBoxDistance(boxMin, boxMax, rayOriginLocal, rayDirLocal);
      const dstA = boxDistance.x;
      const dstB = boxDistance.y;
      const dstToBox = boxDistance.z;
      const dstInsideBox = boxDistance.w;

      If(dstA.greaterThanEqual(dstB), () => {
        color.assign(vec4(0.0));
      });

      const steps = 16;
      const dstTraveled = float(0).toVar();
      const stepSize = dstInsideBox.div(float(steps));
      const totalDensity = float(0.0).toVar();
      const accumulatedColor = vec3(0.0).toVar();

      Loop(steps, () => {
        //最初のStepでBoxの手前まで行く
        const p = rayOriginLocal.add(
          rayDirLocal.mul(dstToBox.add(dstTraveled))
        );

        //@ts-ignore
        //prettier-ignore
        const result = calculateDensity(p, boxMin, boxMax,  this.weatherMapTexture, gc, gd, this.noiseTexture, slices, cellsX, cellsY, this.noiseTextureLow, aa);
        const d = result.x;
        const ph = result.y;

        totalDensity.addAssign(d);
        dstTraveled.addAssign(stepSize);

        If(d.greaterThan(0), () => {
          //@ts-ignore
          //prettier-ignore
          const sunDistance = calculateBoxDistance(boxMin, boxMax, p, sunDirectionLocal);
          const distanceInsideBoxSun = sunDistance.w;
          const sunSteps = 8;
          const sunDstTraveled = float(0).toVar();
          const stepSizeSun = distanceInsideBoxSun.div(float(sunSteps));
          const accumulatedSunDensity = float(0).toVar();

          Loop(sunSteps, () => {
            const pSun = p.add(sunDirectionLocal.mul(sunDstTraveled));
            //@ts-ignore
            //prettier-ignore
            const sunDensity = calculateDensity(pSun, boxMin, boxMax, this.weatherMapTexture, gc, gd, this.noiseTexture, slices, cellsX, cellsY, this.noiseTextureLow, aa);
            accumulatedSunDensity.addAssign(sunDensity);
            sunDstTraveled.addAssign(stepSizeSun);
          });
          //sunLight amount

          const e = max(exp(float(-1).mul(b).mul(accumulatedSunDensity)), 0.8);
          const eClamp = max(e, exp(float(-1).mul(b).mul(ac)));
          const eAalter = max(d.mul(amin), eClamp);

          const dotAngle = dot(
            normalize(sunDirectionLocal),
            normalize(rayDirLocal).negate()
          );
          const dotAbs = abs(dotAngle);
          const threshold = 0.9;
          const angle = max(dotAbs, threshold);
          //@ts-ignore
          //prettier-ignore
          const iso = calculateISO(angle, csi, cse, ins, outs, sunDirectionLocal, rayDirLocal, ivo);

          //@ts-ignore
          //prettier-ignore
          const osambient = calculateOSAmbient(d, ph, osa);

          accumulatedColor.addAssign(eAalter.mul(d).mul(iso).mul(osambient));
        });
      });

      const densityPerSample = totalDensity;
      const opacity = float(1.0).sub(exp(densityPerSample.mul(-1.0)));

      // const col = vec3(accumulatedColor);
      const col = vec3(float(1.0).sub(accumulatedColor));

      return vec4(col, opacity);
    })();
  }

  public async updateTextureParameters() {
    await this.computeNoiseTexture();
    await this.computeNoiseTextureLow();
    this.material.dispose();
    this.material = new THREE.MeshBasicNodeMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.mesh.material = this.material;
    this.updateMaterialNode();
  }

  public async updateWeatherPositionParam() {
    await this.computeWeatherMap();
    this.updateMaterialNode();
    this.material.dispose();
    this.mesh.material = this.material;
    this.material.needsUpdate = true;
  }
}
