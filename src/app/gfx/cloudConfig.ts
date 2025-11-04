import { color, uniform } from "three/tsl";

export interface TextureConfig {
  size: number;
}
export class CloudConfig {
  //geometry
  public boxSize = { x: uniform(100), y: uniform(100), z: uniform(100) };
  public cloudScale = uniform(1.0);
  public cloudOffsetX = uniform(0.0);
  public cloudOffsetY = uniform(0.0);
  public cloudOffsetZ = uniform(0.0);
  public densityScale = uniform(2.0);
  public cloudVisibilityThreshold = uniform(1.52);
  public intensity = uniform(35);

  public sunDirectionX = uniform(-0.4);
  public sunDirectionY = uniform(1.0);
  public sunDirectionZ = uniform(0.2);
  public lightAbsorption = uniform(0.025);
  public darknessThreshold = uniform(0.74);
  public sunTransScale = uniform(4);
  public asymmetry = uniform(0.6);
  public lightIntensity = uniform(0.3);

  public textureSlice = { x: uniform(16), y: uniform(16) };
  public textureSize = 64;
  public textureFrequencies = {
    freq1: uniform(3.0),
    freq2: uniform(8.0),
    freq3: uniform(40.0),
    freq4: uniform(1.0),
  };

  public cloudColor = uniform(color("#fff"));
}
