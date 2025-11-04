import {
  float,
  Fn,
  instanceIndex,
  mx_noise_float,
  mx_worley_noise_float,
  textureStore,
  uint,
  uniform,
  uvec2,
  vec3,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";
import type { UniformTypeOf } from "../../types/UniformType";

interface Frequencies {
  freq1: UniformTypeOf<number>;
  freq2: UniformTypeOf<number>;
  freq3: UniformTypeOf<number>;
  freq4: UniformTypeOf<number>;
}

export function createNoiseTexture(
  size = 64,
  cellCount = 6,
  frequencies: Frequencies = {
    freq1: uniform(2.0),
    freq2: uniform(8.0),
    freq3: uniform(20),
    freq4: uniform(1),
  }
) {
  const slices = cellCount * cellCount;

  const storageTexture = new THREE.StorageTexture(
    size * cellCount,
    size * cellCount
  );
  storageTexture.minFilter = THREE.LinearFilter;
  storageTexture.magFilter = THREE.LinearFilter;
  storageTexture.generateMipmaps = false;
  storageTexture.needsUpdate = true;

  const freq1 = frequencies.freq1;
  const freq2 = frequencies.freq2;
  const freq3 = frequencies.freq3;
  const freq4 = frequencies.freq4;

  //@ts-ignore
  const computeTexture = Fn(({ storageTexture }) => {
    const posX = instanceIndex.mod(size * cellCount).toVar();
    const posY = instanceIndex.div(size * cellCount).toVar();
    const indexUV = uvec2(posX, posY);

    const row = uint(posY.div(size)).toVar();
    const col = uint(posX.div(size)).toVar();
    const slice = row.mul(cellCount).add(col).toVar();

    const localX = posX.sub(col.mul(size));
    const localY = posY.sub(row.mul(size));

    const pt = vec3(
      float(localX).div(size),
      float(localY).div(size),
      float(slice).div(slices) // z座標 (0-1)
    );

    // const r = mx_worley_noise_float(pt.mul(freq1)); // 大きな構造
    // const g = mx_worley_noise_float(pt.mul(freq2)); // 中規模の詳細
    // const b = mx_worley_noise_float(pt.mul(freq3)); // 小さな詳細
    // const a = mx_noise_float(pt.mul(freq4)); // 最細部
    const r = float(1.0).sub(mx_worley_noise_float(pt.mul(freq1))); // 大きな構造
    const g = float(1.0).sub(mx_worley_noise_float(pt.mul(freq2))); // 中規模の詳細
    const b = float(1.0).sub(mx_noise_float(pt.mul(freq3))); // 小さな詳細
    const a = float(1.0).sub(mx_noise_float(pt.mul(freq4))); // 最細部

    const color = vec4(r, g, b, a);
    textureStore(storageTexture, indexUV, color).toWriteOnly();
  });

  //@ts-ignore
  const compute = computeTexture({
    storageTexture,
  }).compute(size * size * cellCount * cellCount);

  return { compute, storageTexture };
}
