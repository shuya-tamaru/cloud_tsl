import { GUI } from "lil-gui";
import { Cloud } from "../gfx/Cloud";
import { CloudConfig } from "../gfx/cloudConfig";
export class ParamsControls {
  private gui!: GUI;
  private cloudConfig!: CloudConfig;
  private cloud!: Cloud;

  constructor(cloudConfig: CloudConfig, cloud: Cloud) {
    this.cloudConfig = cloudConfig;
    this.cloud = cloud;
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
    const weatherMapFolder = this.gui.addFolder("🌞 Weather Map Settings");

    // Close folders by default on mobile
    if (isMobile) {
      geometryFolder.close();
      cloudSettingsFolder.close();
      cloudTextureFolder.close();
      weatherMapFolder.close();
    }

    weatherMapFolder
      .add(this.cloudConfig.weatherPositionParam, "value", 1, 30, 1)
      .name("Weather Position Param")
      .onChange((value: number) => {
        this.cloudConfig.weatherPositionParam.value = value;
        this.cloud.updateWeatherPositionParam();
      });
    weatherMapFolder
      .add(this.cloudConfig.weatherPositionParamLow, "value", 1, 30, 1)
      .name("Weather Position Param Low")
      .onChange((value: number) => {
        this.cloudConfig.weatherPositionParamLow.value = value;
        this.cloud.updateWeatherPositionParam();
      });

    cloudSettingsFolder
      .add(this.cloudConfig.gc, "value", 0, 1, 0.01)
      .name("Cloud Coverage")
      .onChange((value: number) => {
        this.cloudConfig.gc.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.gd, "value", 0, 1, 0.01)
      .name("Cloud Density")
      .onChange((value: number) => {
        this.cloudConfig.gd.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.aa, "value", 0, 1, 0.01)
      .name("Cloud Alpha")
      .onChange((value: number) => {
        this.cloudConfig.aa.value = value;
      });

    cloudSettingsFolder
      .add(this.cloudConfig.osa, "value", 0, 1, 0.01)
      .name("Cloud OSAmbient")
      .onChange((value: number) => {
        this.cloudConfig.osa.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.csi, "value", 0, 1, 0.1)
      .name("Cloud Inside Scale")
      .onChange((value: number) => {
        this.cloudConfig.csi.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.cse, "value", 0, 10, 0.1)
      .name("Cloud Outside Scale")
      .onChange((value: number) => {
        this.cloudConfig.cse.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.ins, "value", 0, 1, 0.1)
      .name("Cloud Inside Strength")
      .onChange((value: number) => {
        this.cloudConfig.ins.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.outs, "value", 0, 1, 0.1)
      .name("Cloud Outside Strength")
      .onChange((value: number) => {
        this.cloudConfig.outs.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.ivo, "value", 0, 1, 0.1)
      .name("Cloud Inside/Outside Volume")
      .onChange((value: number) => {
        this.cloudConfig.ivo.value = value;
      });

    cloudSettingsFolder
      .add(this.cloudConfig.b, "value", 0, 10, 0.1)
      .name("Cloud Brightness")
      .onChange((value: number) => {
        this.cloudConfig.b.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.amin, "value", 0, 1, 0.1)
      .name("Cloud Ambient Min")
      .onChange((value: number) => {
        this.cloudConfig.amin.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.ac, "value", 0, 1, 0.1)
      .name("Cloud Ambient Color")
      .onChange((value: number) => {
        this.cloudConfig.ac.value = value;
      });
    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq1_perlin, "value", 0, 50, 1)
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq1_perlin.value = value;
        this.cloud.updateTextureParameters();
      })
      .name("Freq1 Perlin");
    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq1_worley, "value", 0, 50, 1)
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq1_worley.value = value;
        this.cloud.updateTextureParameters();
      })
      .name("Freq1 Worley");

    cloudTextureFolder
      .add(
        this.cloudConfig.textureFrequencies.freq1_perlin_ratio,
        "value",
        0,
        1,
        0.01
      )
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq1_perlin_ratio.value = value;
        this.cloud.updateTextureParameters();
      })
      .name("Freq1 Perlin Ratio");

    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq2, "value", 0, 50, 1)
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq2.value = value;
        this.cloud.updateTextureParameters();
      })
      .name("Medium Frequency 2");

    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq3, "value", 0, 100, 1)
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq3.value = value;
        this.cloud.updateTextureParameters();
      })
      .name("Small Frequency 3");

    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq4, "value", 0, 100, 1)
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq4.value = value;
        this.cloud.updateTextureParameters();
      })
      .name("Detail Frequency 4");
  }
}
