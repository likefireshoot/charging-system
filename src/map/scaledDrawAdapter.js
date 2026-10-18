import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

// The existing application scales its root with CSS. Terra's event coordinates
// are viewport pixels, while MapLibre.project returns unscaled canvas pixels.
// Keep both Terra projection directions in viewport pixels, including hit tests.
export class ScaledDrawAdapter extends TerraDrawMapLibreGLAdapter {
  constructor(options) {
    super(options);
    this.prototypeMap = options.map;
  }

  getScale() {
    const canvas = this.prototypeMap.getCanvas();
    const rect = canvas.getBoundingClientRect();
    return { x: rect.width / canvas.clientWidth || 1, y: rect.height / canvas.clientHeight || 1 };
  }

  project(lng, lat) {
    const point = this.prototypeMap.project([lng, lat]);
    const scale = this.getScale();
    return { x: point.x * scale.x, y: point.y * scale.y };
  }

  unproject(x, y) {
    const scale = this.getScale();
    const point = this.prototypeMap.unproject([x / scale.x, y / scale.y]);
    return { lng: point.lng, lat: point.lat };
  }

  getLngLatFromEvent(event) {
    const rect = this.prototypeMap.getCanvas().getBoundingClientRect();
    return this.unproject(event.clientX - rect.left, event.clientY - rect.top);
  }
}
