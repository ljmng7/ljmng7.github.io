// Illumination subset adapted from SunCalc 1.9.0, (c) Vladimir Agafonkin.
// BSD-2-Clause license: public/assets/sky/SUNCALC-LICENSE.txt.
// Approximate geocentric phase; displayed north-up without local horizon rotation
// or lunar libration. No location permission or network request is needed.
export function moonPhase(date: Date) {
  const rad = Math.PI / 180;
  const d = date.valueOf() / 86400000 + 2440587.5 - 2451545;
  const obliquity = rad * 23.4397;
  const coords = (longitude: number, latitude: number) => ({
    ra: Math.atan2(Math.sin(longitude) * Math.cos(obliquity) - Math.tan(latitude) * Math.sin(obliquity), Math.cos(longitude)),
    dec: Math.asin(Math.sin(latitude) * Math.cos(obliquity) + Math.cos(latitude) * Math.sin(obliquity) * Math.sin(longitude)),
  });
  const anomaly = rad * (357.5291 + .98560028 * d);
  const sunLongitude = anomaly + rad * (1.9148 * Math.sin(anomaly) + .02 * Math.sin(2 * anomaly) + .0003 * Math.sin(3 * anomaly)) + rad * 102.9372 + Math.PI;
  const sun = coords(sunLongitude, 0);
  const moonAnomaly = rad * (134.963 + 13.064993 * d);
  const longitude = rad * (218.316 + 13.176396 * d) + rad * 6.289 * Math.sin(moonAnomaly);
  const latitude = rad * 5.128 * Math.sin(rad * (93.272 + 13.229350 * d));
  const moon = coords(longitude, latitude);
  const distance = 385001 - 20905 * Math.cos(moonAnomaly);
  const separation = Math.acos(Math.max(-1, Math.min(1, Math.sin(sun.dec) * Math.sin(moon.dec) + Math.cos(sun.dec) * Math.cos(moon.dec) * Math.cos(sun.ra - moon.ra))));
  const incidence = Math.atan2(149598000 * Math.sin(separation), distance - 149598000 * Math.cos(separation));
  const angle = Math.atan2(Math.cos(sun.dec) * Math.sin(sun.ra - moon.ra), Math.sin(sun.dec) * Math.cos(moon.dec) - Math.cos(sun.dec) * Math.sin(moon.dec) * Math.cos(sun.ra - moon.ra));
  return {
    fraction: (1 + Math.cos(incidence)) / 2,
    phase: .5 + .5 * incidence * (angle < 0 ? -1 : 1) / Math.PI,
  };
}
