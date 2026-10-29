/** A short blink after an irregular rest, with an occasional second blink. */
export function createIdleBlink(setClosed: (closed: boolean) => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const randomDelay = (min: number, max: number) => min + Math.random() * (max - min);

  function wait() {
    timer = setTimeout(() => close(true), randomDelay(2500, 6500));
  }

  function close(canDouble: boolean) {
    setClosed(true);
    timer = setTimeout(() => {
      setClosed(false);
      if (canDouble && Math.random() < 0.15) {
        timer = setTimeout(() => close(false), randomDelay(90, 160));
      } else {
        wait();
      }
    }, randomDelay(100, 170));
  }

  function stop() {
    clearTimeout(timer);
    timer = undefined;
    setClosed(false);
  }

  return {
    start() {
      stop();
      wait();
    },
    stop
  };
}
