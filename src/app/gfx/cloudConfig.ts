import { uniform } from "three/tsl";

export class CloudConfig {
  //gc ∈ [0,1] … “雲が出現する基本確率”。出現/不出現のマスク側で効かせる。
  public gc = uniform(0.7);
  //gd ∈ [0,∞] … “雲の全体不透明度”。最終密度（もしくは透過）にスカラーで掛け
  public gd = uniform(0.9);

  public aa = uniform(0);

  public b = uniform(0.4);

  public csi = uniform(0.5);

  public cse = uniform(10);

  public ins = uniform(0.5);
  public outs = uniform(-0.5);
  public ivo = uniform(0.3);

  public ac = uniform(0.3);

  public amin = uniform(0.2);

  //-1 to 1
  public osa = uniform(0.9);

  public boxSize = { x: uniform(100), y: uniform(60), z: uniform(100) };

  public weatherPositionParam = uniform(5);
  public weatherPositionParamLow = uniform(6);

  public textureSlice = { x: uniform(16), y: uniform(16) };
  public textureSize = 128;
  public textureSizeLow = 16;
  public textureFrequencies = {
    freq1_perlin: uniform(8),
    freq1_worley: uniform(2),
    freq1_perlin_ratio: uniform(0.15),
    freq2: uniform(10.0),
    freq3: uniform(20),
    freq4: uniform(30),
  };
}
