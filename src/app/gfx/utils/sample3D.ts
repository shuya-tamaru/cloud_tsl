import { float, floor, Fn, mix, texture, vec2 } from "three/tsl";

//@ts-ignore
export const sample3D = Fn(([tex, uvw, slices, cellsX, cellsY]) => {
  const sliceZ = uvw.z.mul(slices.sub(1.0));
  const slice = floor(sliceZ);
  const sliceFrac = sliceZ.fract();

  // slice0
  const col0 = slice.mod(cellsX);
  const row0 = floor(slice.div(cellsX));

  const uv0 = vec2(
    uvw.x.add(float(col0)).div(cellsX),
    uvw.y.add(float(row0)).div(cellsY)
  );
  const s0 = texture(tex, uv0);

  // === slice 1 ===
  const sliceNext = slice.add(1.0);
  const col1 = sliceNext.mod(cellsX);
  const row1 = floor(sliceNext.div(cellsX));
  const uv1 = vec2(
    uvw.x.add(float(col1)).div(cellsX),
    uvw.y.add(float(row1)).div(cellsY)
  );
  const s1 = texture(tex, uv1);

  return mix(s0, s1, sliceFrac);
});
