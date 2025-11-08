import { clamp, Fn, max, min, vec3, vec4 } from "three/tsl";

//@ts-ignore
//prettier-ignore
export const calculateBoxDistance = Fn(([boxMin, boxMax, originLocal, dirLocal]) => {
    const invDir = vec3(1.0).div(dirLocal);
    const t0 = boxMin.sub(originLocal).mul(invDir);
    const t1 = boxMax.sub(originLocal).mul(invDir);

    //箱から入る時
    const tmin = min(t0, t1);
    //箱から出る時
    const tmax = max(t0, t1);
    //箱に入る距離
    const dstA = max(max(tmin.x, tmin.y), tmin.z);
    //Box 内を進む距離
    const dstB = min(min(tmax.x, tmax.y), tmax.z);

    const dstToBox = max(0.0, dstA);
    //Box 内を進む距離 9999は数値爆発回避
    const dstInsideBox = clamp(dstB.sub(dstToBox), 0.0, 9999.0);

    return vec4(dstA, dstB, dstToBox, dstInsideBox);
  });
