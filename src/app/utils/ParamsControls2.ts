import { GUI } from "lil-gui";
import { Cloud2 } from "../gfx/Cloud2";
import { CloudConfig2 } from "../gfx/cloudConfig2";
export class ParamsControls2 {
  private gui!: GUI;
  private cloudConfig2!: CloudConfig2;
  private cloud2!: Cloud2;

  constructor(cloudConfig2: CloudConfig2, cloud2: Cloud2) {
    this.cloudConfig2 = cloudConfig2;
    this.cloud2 = cloud2;
    this.initGUI();
  }

  private initGUI() {
    this.gui = new GUI();

    // Mobile detection
    const isMobile =
      window.innerWidth <= 768 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const geometryFolder = this.gui.addFolder("🌍 Geometry");
    const cloudSettingsFolder = this.gui.addFolder("🌥️ Cloud Settings");
    const cloudTextureFolder = this.gui.addFolder("🖼️ Cloud Texture");
    const sunSettingsFolder = this.gui.addFolder("🌞 Sun Settings");

    // Close folders by default on mobile
    if (isMobile) {
      geometryFolder.close();
      cloudSettingsFolder.close();
      cloudTextureFolder.close();
      sunSettingsFolder.close();
    }

    cloudSettingsFolder
      .add(this.cloudConfig2.gc, "value", 0, 1, 0.01)
      .name("Cloud Coverage")
      .onChange((value: number) => {
        this.cloudConfig2.gc.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig2.gd, "value", 0, 1, 0.01)
      .name("Cloud Density")
      .onChange((value: number) => {
        this.cloudConfig2.gd.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig2.aa, "value", 0, 1, 0.01)
      .name("Cloud Alpha")
      .onChange((value: number) => {
        this.cloudConfig2.aa.value = value;
      });
    cloudTextureFolder
      .add(this.cloudConfig2.textureFrequencies.freq1_perlin, "value", 0, 50, 1)
      .onChange((value: number) => {
        this.cloudConfig2.textureFrequencies.freq1_perlin.value = value;
        this.cloud2.updateTextureParameters();
      })
      .name("Freq1 Perlin");
    cloudTextureFolder
      .add(this.cloudConfig2.textureFrequencies.freq1_worley, "value", 0, 50, 1)
      .onChange((value: number) => {
        this.cloudConfig2.textureFrequencies.freq1_worley.value = value;
        this.cloud2.updateTextureParameters();
      })
      .name("Freq1 Worley");

    cloudTextureFolder
      .add(
        this.cloudConfig2.textureFrequencies.freq1_perlin_ratio,
        "value",
        0,
        1,
        0.01
      )
      .onChange((value: number) => {
        this.cloudConfig2.textureFrequencies.freq1_perlin_ratio.value = value;
        this.cloud2.updateTextureParameters();
      })
      .name("Freq1 Perlin Ratio");

    cloudTextureFolder
      .add(this.cloudConfig2.textureFrequencies.freq2, "value", 0, 50, 1)
      .onChange((value: number) => {
        this.cloudConfig2.textureFrequencies.freq2.value = value;
        this.cloud2.updateTextureParameters();
      })
      .name("Medium Frequency 2");

    cloudTextureFolder
      .add(this.cloudConfig2.textureFrequencies.freq3, "value", 0, 100, 1)
      .onChange((value: number) => {
        this.cloudConfig2.textureFrequencies.freq3.value = value;
        this.cloud2.updateTextureParameters();
      })
      .name("Small Frequency 3");

    cloudTextureFolder
      .add(this.cloudConfig2.textureFrequencies.freq4, "value", 0, 100, 1)
      .onChange((value: number) => {
        this.cloudConfig2.textureFrequencies.freq4.value = value;
        this.cloud2.updateTextureParameters();
      })
      .name("Detail Frequency 4");
  }
}
