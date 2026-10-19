export function createTrackPlayer({ onChange, schedule = setTimeout, cancel = clearTimeout }) {
  let frames = [], timer = null, disposed = false;
  const state = { cursor: 0, total: 0, playing: false, direction: 0, interval: 1, preview: true, visibleIndex: Infinity, nowTime: null };
  function clear() { if (timer !== null) { cancel(timer); timer = null; } }
  function notify() { if (!disposed) onChange?.({ ...state }); }
  function update() {
    const point = frames[state.cursor - 1];
    state.visibleIndex = state.preview ? Infinity : point?.index ?? -1;
    state.nowTime = state.preview ? frames[0]?.timestamp ?? null : point?.timestamp ?? null;
  }
  function stop() { clear(); state.playing = false; state.direction = 0; notify(); }
  function queue() { if (state.playing && !disposed) timer = schedule(() => { timer = null; advance(); }, state.interval * 1000); }
  function advance() {
    if (!state.playing || disposed) return;
    state.cursor = Math.max(1, Math.min(frames.length, state.cursor + state.direction));
    update();
    const ended = state.direction === 1 ? state.cursor >= frames.length : state.cursor <= 1;
    if (ended) { state.playing = false; state.direction = 0; }
    notify(); if (!ended) queue();
  }
  return {
    load(value) { if (disposed) return; clear(); frames = [...value]; Object.assign(state, { total: frames.length, cursor: 0, playing: false, direction: 0, interval: 1, preview: true }); update(); notify(); },
    start(direction) {
      if (disposed || !frames.length || ![1, -1].includes(direction)) return false;
      if (state.playing && state.direction === direction) return false;
      clear();
      if (state.preview) state.cursor = direction === 1 ? 0 : frames.length;
      else if (direction === 1 && state.cursor === frames.length) state.cursor = 0;
      else if (direction === -1 && state.cursor <= 1) state.cursor = frames.length;
      state.preview = false; state.playing = true; state.direction = direction; advance(); return true;
    },
    stop,
    speed(action) {
      if (disposed || ![1, 2].includes(action)) return false;
      const next = state.interval + (action === 1 ? 0.25 : -0.25);
      if (next < 0.25 || next > 2.75) return false;
      state.interval = next; clear(); notify(); queue(); return true;
    },
    snapshot: () => ({ ...state, timerCount: timer === null ? 0 : 1, disposed }),
    dispose() { clear(); disposed = true; frames = []; state.playing = false; state.direction = 0; },
  };
}
