// Map interaction geometry uses WGS84 [longitude, latitude]. Legacy API adapters
// belong at the data boundary and must not be applied to these mock coordinates.
const RADIUS = 6371000;
const RAD = Math.PI / 180;

export function validatePoint(point) {
  if (!Array.isArray(point) || point.length !== 2 ||
      !point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) {
    throw new Error("Invalid WGS84 [longitude, latitude]");
  }
  return [...point];
}

export function distanceMeters(a, b) {
  a = validatePoint(a); b = validatePoint(b);
  const h = Math.sin((b[1] - a[1]) * RAD / 2) ** 2 +
    Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin((b[0] - a[0]) * RAD / 2) ** 2;
  return 2 * RADIUS * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

export function lineLengthMeters(coordinates) {
  return coordinates.slice(1).reduce((total, point, i) => total + distanceMeters(coordinates[i], point), 0);
}

export function bearingDegrees(a, b) {
  a = validatePoint(a); b = validatePoint(b);
  const p = a[1] * RAD, q = b[1] * RAD, d = (b[0] - a[0]) * RAD;
  return (Math.atan2(Math.sin(d) * Math.cos(q),
    Math.cos(p) * Math.sin(q) - Math.sin(p) * Math.cos(q) * Math.cos(d)) / RAD + 360) % 360;
}

export function moveMeters(point, meters, bearing) {
  const [lng, lat] = validatePoint(point);
  if (!Number.isFinite(meters) || meters < 0 || !Number.isFinite(bearing)) throw new Error("Invalid movement");
  const p = lat * RAD, l = lng * RAD, t = bearing * RAD, d = meters / RADIUS;
  const newLat = Math.asin(Math.sin(p) * Math.cos(d) + Math.cos(p) * Math.sin(d) * Math.cos(t));
  const newLng = l + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(p), Math.cos(d) - Math.sin(p) * Math.sin(newLat));
  return validatePoint([((newLng / RAD + 540) % 360) - 180, newLat / RAD]);
}
