import { float, Fn, pow, remap, saturate } from "three/tsl";

//@ts-ignore
//prettier-ignore
export const calculateOSAmbient = Fn(([density, ph, osa]) => {
  const r1 = remap(ph, 0.3, 0.9, 0.5, 1.0);
  const r2 = remap(ph, 0, 0.3, 0.8, 1.0);
  const left = float(1.0).sub(saturate(osa.mul(pow(density, r1))));
  const right = saturate(pow(r2, 0.8));
  const osambient = left.mul(right);
  return osambient;
 })
