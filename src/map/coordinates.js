import transform from "./vendor/coordtransform.cjs";
import { validatePoint } from "./geometry";

// Explicit algorithm provenance for new MapLibre points, not an AMap source claim.
export const NEW_DEVICE_PROFILE = "maplibre-legacy-storage-v1";
export const NEW_PIPE_PROFILE = "maplibre-legacy-pipe-v1";
export function writeStoragePoint(value, profile) {
  const point = validatePoint(value);
  if (profile === "WGS84") return point;
  if (![NEW_DEVICE_PROFILE, NEW_PIPE_PROFILE, "confirmed-mainland-AMap-GCJ02"].includes(profile)) throw new Error("坐标来源待确认，不能保存");
  return validatePoint(transform.wgs84togcj02(...point));
}

// Apply only an explicitly registered source; numeric ranges are not CRS evidence.
export function readStoragePoint(value, profile) {
  const target = validatePoint(value);
  if (profile === "WGS84") return target;
  if (![NEW_DEVICE_PROFILE, NEW_PIPE_PROFILE, "confirmed-mainland-AMap-GCJ02"].includes(profile)) throw new Error("坐标来源待确认");
  let guess = [...target];
  for (let i = 0; i < 30; i++) {
    const projected = transform.wgs84togcj02(...guess);
    const dx = projected[0] - target[0], dy = projected[1] - target[1];
    guess = [guess[0] - dx, guess[1] - dy];
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 1e-10) return validatePoint(guess);
  }
  throw new Error("坐标转换未收敛");
}
