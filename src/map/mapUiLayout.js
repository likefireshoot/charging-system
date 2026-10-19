import { onMounted, onUnmounted } from "vue";

// Measure in layout pixels; #app's existing transform and browser zoom must not
// be applied twice when reserving space for business panels.
export function useMapUiLayout(root) {
  let observer, disposed = false;
  function update() {
    const element = root.value, toolbar = element?.querySelector(".readonly-toolbar");
    if (!element || !toolbar || disposed) return;
    element.style.setProperty("--map-panel-top", `${toolbar.offsetTop + toolbar.offsetHeight + 16}px`);
    const width = element.clientWidth, editable = element.classList.contains("device-map-page");
    element.style.setProperty("--map-tool-width", width <= 1150 ? "115px" : "135px");
    element.style.setProperty("--map-property-width", `${editable ? width > 1500 ? 550 : width > 1150 ? 430 : 390 : width > 1500 ? 400 : width > 1150 ? 360 : 340}px`);
  }
  onMounted(() => {
    update(); observer = new ResizeObserver(update);
    observer.observe(root.value); observer.observe(root.value.querySelector(".readonly-toolbar"));
  });
  onUnmounted(() => { disposed = true; observer?.disconnect(); observer = null; });
  function fitPadding() {
    update();
    const element = root.value, rect = element.getBoundingClientRect();
    const scale = rect.width / element.clientWidth;
    const bounds = selector => element.querySelector(selector)?.getBoundingClientRect();
    const left = bounds(".readonly-types"), tools = bounds(".device-tools");
    const panel = bounds(".device-form .popCard.on, .readonly-properties");
    const toolbar = bounds(".readonly-toolbar");
    const padding = {
      top: toolbar ? (toolbar.bottom - rect.top) / scale + 90 : 100,
      bottom: 80,
      left: left ? (left.right - rect.left) / scale + 35 : 35,
      right: panel ? (rect.right - panel.left) / scale + 35 : tools ? (rect.right - tools.left) / scale + 35 : 35,
    };
    // A very small viewport must still produce valid bounds rather than throwing.
    padding.right = Math.min(padding.right, Math.max(0, element.clientWidth - padding.left - 160));
    padding.top = Math.min(padding.top, Math.max(0, element.clientHeight - padding.bottom - 160));
    return padding;
  }
  return { fitPadding, diagnostics: () => ({ observers: observer ? 1 : 0, disposed }) };
}
