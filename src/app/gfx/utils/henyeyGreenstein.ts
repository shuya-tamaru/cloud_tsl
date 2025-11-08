import { float, Fn, PI, pow } from "three/tsl";
//@ts-ignore
//prettier-ignore
export const henyeyGreenstein = Fn(([sunDirectionLocal, rayDirLocal, g,dotAngle]) => {
  const g2 = g.mul(g);
  const coefficient = float(1.0).div(float(4.0).mul(PI));
  const numerator = float(1.0).sub(g2);
  const denominator = pow(
    float(1.0).add(g2).sub(float(2.0).mul(g).mul(dotAngle)),
    float(1.5)
  );
  return coefficient.mul(numerator.div(denominator));
});
