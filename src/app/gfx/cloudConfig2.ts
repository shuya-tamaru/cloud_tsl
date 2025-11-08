import { uniform } from "three/tsl";

export class CloudConfig2 {
  //gc ∈ [0,1] … “雲が出現する基本確率”。出現/不出現のマスク側で効かせる。
  public gc = uniform(0.99);
  //gd ∈ [0,∞] … “雲の全体不透明度”。最終密度（もしくは透過）にスカラーで掛け
  public gd = uniform(0.9);

  public aa = uniform(0.9);

  public boxSize = { x: uniform(1000), y: uniform(600), z: uniform(1000) };

  public textureSlice = { x: uniform(16), y: uniform(16) };
  public textureSize = 64;
  public textureSizeLow = 32;
  public textureFrequencies = {
    freq1_perlin: uniform(40),
    freq1_worley: uniform(2),
    freq1_perlin_ratio: uniform(0.2),
    freq2: uniform(10.0),
    freq3: uniform(20),
    freq4: uniform(30),
  };
}
