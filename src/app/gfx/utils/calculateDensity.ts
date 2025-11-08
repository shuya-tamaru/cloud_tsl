import {
  exp,
  float,
  Fn,
  max,
  mix,
  pow,
  remap,
  saturate,
  sqrt,
  texture,
  vec2,
} from "three/tsl";
import { sample3D } from "./sample3D";

//@ts-ignore
export const calculateDensity = Fn(
  //@ts-ignore
  //prettier-ignore
  ([p, boxMin, boxMax, weatherMapTexture, gc, gd, noiseTexture,slices, cellsX, cellsY,noiseTextureLow,aa]) => {
    
    const uvw = p.sub(boxMin).div(boxMax.sub(boxMin));
    const uvWeather = p.xz.sub(boxMin.xz).div(boxMax.xz.sub(boxMin.xz));
    const tex = texture(weatherMapTexture, uvWeather);

    const wc0 = tex.r;
    const wc1 = tex.g;
    const wh = tex.b;
    const wd = tex.a;
    const wmc = max(wc0, saturate(gc.sub(0.5).mul(wc1).mul(2.0)));

    const ph = p.y.sub(boxMin.y).div(boxMax.y.sub(boxMin.y));

    //Shape-altering height-function
    const srb = saturate(remap(ph, 0.0, 0.2, 0.0, 1.0));
    const srt = saturate(remap(ph, wh.mul(0.2), wh, 1.0, 0.0));
    const sa = srb.mul(srt);

    //Density-altering height-function
    const drb = ph.mul(saturate(remap(ph, 0.0, 0.15, 0.0, 1.0)));
    const drt = saturate(remap(ph, 0.9, 1.0, 1.0, 0.0));
    const da = gd.mul(drb).mul(drt).mul(wd).mul(2.0);

    //Shape and detail noise
    //prettier-ignore
    //@ts-ignore
    const densitySample = sample3D(noiseTexture, uvw, slices, cellsX, cellsY)
    const sn_r = densitySample.r;
    const sn_g = densitySample.g;
    const sn_b = densitySample.b;
    const sn_a = densitySample.a;
    const sn_gba = sn_g.mul(0.625).add(sn_b.mul(0.25)).add(sn_a.mul(0.125));

    const sn_sample = remap(sn_r, sn_gba, 1, 0, 1);


    //low frequency noise
    //prettier-ignore
    //@ts-ignore
    const sn_low_sample = sample3D(noiseTextureLow, uvw, slices, cellsX, cellsY);
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

    return vec2(d, ph);
  }
);
