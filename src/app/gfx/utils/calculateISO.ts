import { Fn, max, mix, pow, saturate } from "three/tsl";
import { henyeyGreenstein } from "./henyeyGreenstein";

//@ts-ignore
//prettier-ignore
export const calculateISO = Fn(([dotAngle, csi, cse, ins, outs,sunDirectionLocal, rayDirLocal, ivo]) => {
  const is_extra = csi.mul(pow(saturate(dotAngle), cse));

  //@ts-ignore
  const hg_in = henyeyGreenstein(sunDirectionLocal, rayDirLocal, ins, dotAngle);
  //@ts-ignore
  const hg_out = henyeyGreenstein(sunDirectionLocal, rayDirLocal, outs, dotAngle);

  const left = max(hg_in, is_extra)
  const right = hg_out
  const iso = mix(left, right, ivo)
  return iso
});
