import * as THREE from "three/webgpu";
import { CloudConfig2 } from "./cloudConfig2";
import {
  cameraPosition,
  clamp,
  float,
  Fn,
  If,
  Loop,
  max,
  min,
  modelWorldMatrixInverse,
  normalize,
  positionWorld,
  saturate,
  remap,
  vec3,
  vec4,
  texture,
  exp,
  mix,
  pow,
  sqrt,
} from "three/tsl";
import { createWeatherMap } from "./utils/createWeatherMap";
import { createNoiseTexture } from "./utils/createNoiseTexture";
import { sample3D } from "./utils/sample3D";

export class Cloud2 {
  private scene: THREE.Scene;
  private renderer: THREE.WebGPURenderer;
  private cloudConfig2: CloudConfig2;

  private weatherMapTexture!: THREE.StorageTexture;
  private noiseTexture!: THREE.StorageTexture;
  private noiseTextureLow!: THREE.StorageTexture;

  private geometry!: THREE.BoxGeometry;
  private material!: THREE.MeshBasicNodeMaterial;
  private mesh!: THREE.Mesh;

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGPURenderer,
    cloudConfig2: CloudConfig2
  ) {
    this.scene = scene;
    this.renderer = renderer;
    this.cloudConfig2 = cloudConfig2;
    this.computeWeatherMap();
    this.computeNoiseTexture();
    this.computeNoiseTextureLow();
    this.createGeometry();
    this.createMaterial();
    this.createMesh();
  }

  private createGeometry() {
    const { boxSize } = this.cloudConfig2;
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
    const { compute, storageTexture: weatherMapTexture } =
      createWeatherMap(512);

    this.weatherMapTexture = weatherMapTexture;
    await this.renderer.computeAsync(compute);
  }

  private async computeNoiseTexture() {
    const { textureSize, textureSlice, textureFrequencies } = this.cloudConfig2;
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
      this.cloudConfig2;
    const { compute, storageTexture } = createNoiseTexture(
      textureSizeLow,
      textureSlice.x.value,
      textureFrequencies
    );

    this.noiseTextureLow = storageTexture;
    await this.renderer.computeAsync(compute);
  }

  private updateMaterialNode() {
    const { boxSize, gd, gc, textureSlice, aa } = this.cloudConfig2;
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

      const invDir = vec3(1.0).div(rayDirLocal);
      const t0 = boxMin.sub(rayOriginLocal).mul(invDir);
      const t1 = boxMax.sub(rayOriginLocal).mul(invDir);
      //箱から入る時
      const tmin = min(t0, t1);
      //箱から出る時
      const tmax = max(t0, t1);

      //箱に入る距離
      const dstA = max(max(tmin.x, tmin.y), tmin.z);
      //Box 内を進む距離
      const dstB = min(min(tmax.x, tmax.y), tmax.z);

      //rayoriginから箱に入る距離
      //dstAが負の場合、つまりtminが負ということはBoxの意入るまでの時刻がマイナス、つまりもう入っている。なのでBoxまでの距離は0
      const dstToBox = max(0.0, dstA);
      //Box 内を進む距離 9999は数値爆発回避
      const dstInsideBox = clamp(dstB.sub(dstToBox), 0.0, 9999.0);

      If(dstA.greaterThanEqual(dstB), () => {
        color.assign(vec4(0.0));
      });

      const steps = 64;
      const dstTraveled = float(0).toVar();
      const stepSize = dstInsideBox.div(float(steps));
      const totalDensity = float(0.0).toVar();
      Loop(steps, () => {
        //最初のStepでBoxの手前まで行く
        const p = rayOriginLocal.add(
          rayDirLocal.mul(dstToBox.add(dstTraveled))
        );
        const uvw = p.sub(boxMin).div(boxMax.sub(boxMin));

        //texture
        const uvWeather = p.xz.sub(boxMin.xz).div(boxMax.xz.sub(boxMin.xz));
        const tex = texture(this.weatherMapTexture, uvWeather);

        //local space 0 to 1
        // WMc = max(wc0, SAT (gc−0.5) ×wc1 ×2)
        const wc0 = tex.r;
        const wc1 = tex.g;
        const wh = tex.b;
        const wd = tex.a;
        const wmc = max(wc0, saturate(gc.sub(0.5).mul(wc1).mul(2.0)));
        const ph = p.y.sub(boxMin.y).div(boxMax.y.sub(boxMin.y));

        //Shape-altering height-function
        const srb = saturate(remap(ph, 0.0, 0.07, 0.0, 1.0));
        const srt = saturate(remap(ph, wh.mul(0.2), wh, 1.0, 0.0));
        const sa = srb.mul(srt);

        //Density-altering height-function
        const drb = ph.mul(saturate(remap(ph, 0.0, 0.15, 0.0, 1.0)));
        const drt = saturate(remap(ph, 0.9, 1.0, 1.0, 0.0));
        const da = gd.mul(drb).mul(drt).mul(wd).mul(2.0);

        //Shape and detail noise
        //prettier-ignore
        //@ts-ignore
        const densitySample = sample3D(this.noiseTexture, uvw, slices, cellsX, cellsY)
        const sn_r = densitySample.r;
        const sn_g = densitySample.g;
        const sn_b = densitySample.b;
        const sn_a = densitySample.a;
        const sn_gba = sn_g.mul(0.625).add(sn_b.mul(0.25)).add(sn_a.mul(0.125));

        const sn_sample = remap(sn_r, sn_gba, 1, 0, 1);

        //low frequency noise
        //prettier-ignore
        //@ts-ignore
        const sn_low_sample = sample3D(this.noiseTextureLow, uvw, slices, cellsX, cellsY);
        const sn_low_g = sn_low_sample.g;
        const sn_low_b = sn_low_sample.b;
        const sn_low_a = sn_low_sample.a;
        const dnFbm = sn_low_g
          .mul(0.625)
          .add(sn_low_b.mul(0.25))
          .add(sn_low_a.mul(0.125));

        const dn_mod = float(0.35)
          .mul(exp(float(-1).mul(gc).mul(0.75)))
          .mul(mix(dnFbm, float(1.0).sub(dnFbm), saturate(float(ph).mul(5))));

        const sa_avil = pow(
          sa,
          saturate(remap(ph, 0.65, 0.95, 1, float(1.0).sub(aa.mul(gc))))
        );

        const sn_nd = saturate(
          remap(sn_sample.mul(sa_avil), float(1.0).sub(gc.mul(wmc)), 1, 0, 1)
        );
        const da_avil = da.mul(
          mix(1.0, saturate(remap(sqrt(ph), 0.4, 0.95, 1, 0.2)), aa)
        );
        const d = saturate(remap(sn_nd, dn_mod, 1, 0, 1)).mul(da_avil);

        totalDensity.addAssign(d);
        dstTraveled.addAssign(stepSize);
      });
      const densityPerSample = totalDensity.div(1);
      const transmittance = exp(densityPerSample.mul(-1));
      const opacity = float(1.0).sub(transmittance);

      const col = vec3(1.0);
      // return vec4(col, opacity);
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
}
