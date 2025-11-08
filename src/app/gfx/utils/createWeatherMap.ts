import {
  float,
  Fn,
  instanceIndex,
  mx_noise_float,
  mx_worley_noise_float,
  textureStore,
  uniform,
  uvec2,
  vec2,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";

export function createWeatherMap(
  size = 512,
  weatherPositionParam = uniform(5),
  weatherPositionParamLow = uniform(6)
) {
  const storageTexture = new THREE.StorageTexture(size, size);
  storageTexture.minFilter = THREE.LinearFilter;
  storageTexture.magFilter = THREE.LinearFilter;
  storageTexture.generateMipmaps = false;
  storageTexture.needsUpdate = true;

  //@ts-ignore
  const computeTexture = Fn(({ storageTexture }) => {
    const index = instanceIndex;

    const posX = index.mod(size).toVar();
    const posY = index.div(size).toVar();

    const indexUV = uvec2(posX, posY);
    const uv = vec2(float(posX).div(size), float(posY).div(size));

    const wc0 = float(1.0).sub(mx_noise_float(uv.mul(weatherPositionParam)));
    const wc1 = float(1.0).sub(
      mx_worley_noise_float(uv.mul(weatherPositionParamLow))
    );
    const wh = float(1.0);
    const wd = float(1.0);

    const color = vec4(wc0, wc1, wh, wd);
    textureStore(storageTexture, indexUV, color).toWriteOnly();
  });

  //@ts-ignore
  const compute = computeTexture({
    storageTexture,
  }).compute(size * size);

  return { compute, storageTexture };
}
