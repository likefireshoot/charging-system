// Recolor the existing local basemap without changing its features, labels,
// zoom coverage, fonts or source attribution.
export const waterMapColors = { water: "#dcecf2", land: "#f4f6f1" };

export function applyWaterMapTheme(style) {
  const landColors = {
    "#9cd3b4": "#e0ecdf", "#a0d9a0": "#deeadb", "#99d2bb": "#e4ede1",
    "#e7e7e7": "#f7f8f6", "#e2e0d7": "#f4f0df", "#c6dcdc": "#e8eeeb",
    "#e2dfda": waterMapColors.land,
    "rgba(210, 239, 207, 1)": "#edf2e7", "rgba(255, 243, 215, 1)": "#f4f1e5",
    "rgba(230, 230, 230, 1)": "#eef1ec", "rgba(216, 239, 210, 1)": "#edf2e7",
    "rgba(255, 255, 255, 1)": "#ffffff", "rgba(234, 239, 210, 1)": "#eff2e8",
    "rgba(196, 231, 210, 1)": "#e3eddf",
  };
  const softLand = value => Array.isArray(value) ? value.map(softLand) : landColors[value] || value;
  const landuse = { hospital: "#f4e9e6", industrial: "#e8eded", school: "#f2eedf",
    beach: "#f5efda", zoo: "#e4eee3", aerodrome: "#e9eeeb", runway: "#f5f7f4",
    pedestrian: "#efeee5", pier: "#e7eeeb" };
  for (const layer of style.layers) {
    const paint = layer.paint ||= {}, source = layer["source-layer"];
    if (layer.type === "background") paint["background-color"] = waterMapColors.water;
    if (source === "earth" && layer.type === "fill") paint["fill-color"] = waterMapColors.land;
    if (source === "landcover" && layer.type === "fill") paint["fill-color"] = softLand(paint["fill-color"]);
    if (source === "landuse" && layer.type === "fill") {
      paint["fill-color"] = softLand(paint["fill-color"]);
      const kind = layer.id.replace(/-east$/, "").replace("landuse_", "");
      if (landuse[kind]) paint["fill-color"] = landuse[kind];
    }
    if (source === "water") {
      if (layer.type === "fill") paint["fill-color"] = waterMapColors.water;
      if (layer.type === "line") paint["line-color"] = "#b8d6e1";
    }
    if (source === "buildings" && layer.type === "fill") {
      paint["fill-color"] = "#dce3dd";
    }
    if (source === "roads" && layer.type === "line") {
      if (layer.id.includes("casing")) paint["line-color"] = "#d8e1db";
      else if (layer.id.includes("rail")) paint["line-color"] = "#a8b7b2";
      else if (layer.id.includes("tunnels")) paint["line-color"] = "#e1e6df";
      else if (layer.id.includes("highway")) paint["line-color"] = "#f0dec0";
      else if (layer.id.includes("major")) paint["line-color"] = "#faf6e9";
      else paint["line-color"] = "#ffffff";
    }
    if (source === "boundaries" && layer.type === "line") paint["line-color"] = "#a6b6b2";
    if (layer.type === "symbol" && "text-color" in paint) {
      paint["text-color"] = source === "water" ? "#63899c" : source === "places" ? "#4e6766" : "#6e8079";
      if ("text-halo-color" in paint) paint["text-halo-color"] = "#fafcf8";
    }
  }
  return style;
}
