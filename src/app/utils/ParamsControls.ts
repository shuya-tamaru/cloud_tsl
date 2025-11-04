import { GUI } from "lil-gui";
import * as THREE from "three/webgpu";
import { CloudConfig } from "../gfx/cloudConfig";
import { Cloud } from "../gfx/Cloud";
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
    const sunSettingsFolder = this.gui.addFolder("🌞 Sun Settings");

    // Close folders by default on mobile
    if (isMobile) {
      geometryFolder.close();
      cloudSettingsFolder.close();
      cloudTextureFolder.close();
      sunSettingsFolder.close();
    }

    cloudSettingsFolder
      .addColor(
        {
          color:
            "#" +
            new THREE.Color(
              1 - this.cloudConfig.cloudColor.value.r,
              1 - this.cloudConfig.cloudColor.value.g,
              1 - this.cloudConfig.cloudColor.value.b
            ).getHexString(THREE.SRGBColorSpace),
        },
        "color"
      )
      .name("Cloud Color")
      .onChange((value: string) => {
        const tempColor = new THREE.Color(value);
        const invertedColor = new THREE.Color(
          1 - tempColor.r,
          1 - tempColor.g,
          1 - tempColor.b
        );
        this.cloudConfig.cloudColor.value.copy(invertedColor);
      });

    //texture
    const textureSizeOptions = [16, 32, 64, 128, 256, 512];
    cloudTextureFolder
      .add(this.cloudConfig, "textureSize", textureSizeOptions)
      .name("Texture Size")
      .onChange((value: number) => {
        this.cloudConfig.textureSize = value;
        this.cloud.updateTextureParameters();
      });

    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq1, "value", 0, 50.0, 1)
      .name("Large Frequency 1")
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq1.value = value;
        this.cloud.updateTextureParameters();
      });
    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq2, "value", 0, 50, 1)
      .name("Medium Frequency 2")
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq2.value = value;
        this.cloud.updateTextureParameters();
      });
    cloudTextureFolder
      .add(this.cloudConfig.textureFrequencies.freq3, "value", 0, 100, 1)
      .name("Small Frequency 3")
      .onChange((value: number) => {
        this.cloudConfig.textureFrequencies.freq3.value = value;
        this.cloud.updateTextureParameters();
      });
    // cloudTextureFolder
    //   .add(this.cloudConfig.textureFrequencies.freq4, "value", 1, 100, 1)
    //   .name("Detail Frequency 4")
    //   .onChange((value: number) => {
    //     this.cloudConfig.textureFrequencies.freq4.value = value;
    //     this.cloud.updateTextureParameters();
    //   });

    //geometry
    geometryFolder
      .add(this.cloudConfig.boxSize.x, "value", 1.0, 500, 0.1)
      .name("Box Size X")
      .onChange((value: number) => {
        this.cloudConfig.boxSize.x.value = value;
        this.cloud.updateCloudBoundaryBox();
      });
    geometryFolder
      .add(this.cloudConfig.boxSize.y, "value", 1.0, 500, 0.1)
      .name("Box Size Y")
      .onChange((value: number) => {
        this.cloudConfig.boxSize.y.value = value;
        this.cloud.updateCloudBoundaryBox();
      });
    geometryFolder
      .add(this.cloudConfig.boxSize.z, "value", 1.0, 500, 0.1)
      .name("Box Size Z")
      .onChange((value: number) => {
        this.cloudConfig.boxSize.z.value = value;
        this.cloud.updateCloudBoundaryBox();
      });

    //cloud deformation
    cloudSettingsFolder
      .add(this.cloudConfig.densityScale, "value", 0.0, 10.0, 0.1)
      .name("Density Scale")
      .onChange((value: number) => {
        this.cloudConfig.densityScale.value = value;
      });
    cloudSettingsFolder
      .add(this.cloudConfig.cloudVisibilityThreshold, "value", 0.0, 2.0, 0.01)
      .name("Cloud Visibility Threshold")
      .onChange((value: number) => {
        this.cloudConfig.cloudVisibilityThreshold.value = value;
      });
    cloudSettingsFolder
      .add(
        { intensity: 100.0 - this.cloudConfig.intensity.value },
        "intensity",
        0.0,
        99.0,
        1
      )
      .name("Intensity")
      .onChange((value: number) => {
        this.cloudConfig.intensity.value = 100.0 - value;
      });
    sunSettingsFolder
      .add(this.cloudConfig.sunDirectionX, "value", -1.0, 1.0, 0.01)
      .name("Sun Direction X");
    // sunSettingsFolder
    //   .add(this.cloudConfig.sunDirectionY, "value", -1.0, 1.0, 0.01)
    //   .name("Sun Direction Y");
    sunSettingsFolder
      .add(this.cloudConfig.sunDirectionZ, "value", -1.0, 1.0, 0.01)
      .name("Sun Direction Z");
    sunSettingsFolder
      .add(this.cloudConfig.lightAbsorption, "value", 0, 0.1, 0.001)
      .name("Light Absorption");
    sunSettingsFolder
      .add(this.cloudConfig.darknessThreshold, "value", 0, 1.0, 0.001)
      .name("Darkness Threshold");
    sunSettingsFolder
      .add(this.cloudConfig.sunTransScale, "value", 0, 10.0, 0.1)
      .name("Sun Transmittance Scale");
    sunSettingsFolder
      .add(this.cloudConfig.asymmetry, "value", 0, 0.95, 0.001)
      .name("Asymmetry");
    sunSettingsFolder
      .add(this.cloudConfig.lightIntensity, "value", 0, 0.15, 0.001)
      .name("Light Intensity");
  }
}
