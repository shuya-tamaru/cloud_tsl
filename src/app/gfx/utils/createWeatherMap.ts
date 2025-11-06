import {
  clamp,
  float,
  Fn,
  instanceIndex,
  mx_fractal_noise_float,
  mx_worley_noise_float,
  textureStore,
  uvec2,
  vec2,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";

export function createWeatherMap(size = 512) {
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

    const invFractal = clamp(mx_fractal_noise_float(uv.mul(20.0)), 0.0, 1.0);
    const invWorley = clamp(mx_worley_noise_float(uv.mul(10.0)), 0.0, 1.0);

    // const wc0 = mx_noise_float(uv.mul(3)); // clouds probability (red channel)
    // const wc1 = invFractal.mul(invWorley); // clouds probability (green channel)
    const wc0 = float(1.0).sub(mx_worley_noise_float(uv.mul(3))); //Low freq
    const wc1 = float(1.0).sub(mx_worley_noise_float(uv.mul(6.0)));
    // const wh = float(1.0);
    // const wd = float(1.0);
    const wh = float(1.0); // maxheight (blue channel)
    const wd = float(1.0); // cloud density (alpha channel)

    const color = vec4(wc0, wc1, wh, wd);
    textureStore(storageTexture, indexUV, color).toWriteOnly();
  });

  //@ts-ignore
  const compute = computeTexture({
    storageTexture,
  }).compute(size * size);

  return { compute, storageTexture };
}
