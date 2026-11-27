/** Reveal once the map is ready after a minimum delay, or after the deadline. */
function beginReveal({ isReady, onReveal, reduced = false, clock = Date.now, scheduleInterval = setInterval, cancelInterval = clearInterval, scheduleTimeout = setTimeout, cancelTimeout = clearTimeout }) {
  const start = clock();
  let done = false;
  const finish = () => { if (!done) { done = true; onReveal(); } };
  const check = () => { if (clock() - start >= (reduced ? 0 : 1000) && isReady()) finish(); };
  const poll = scheduleInterval(check, 100);
  const fallback = scheduleTimeout(finish, reduced ? 1000 : 3000);
  check();
  return () => { done = true; cancelInterval(poll); cancelTimeout(fallback); };
}
module.exports = { beginReveal };
