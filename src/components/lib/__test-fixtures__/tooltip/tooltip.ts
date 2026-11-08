const TOOLTIP_OPEN_DELAY_MS = 400;
const OPEN_DELAY_MARGIN_MS = 200;

// A tooltip that is not going to open shows nothing to wait for, so the test
// waits past the open delay before it checks that no tooltip appeared.
export const waitForOpenDelay = async () => {
  const promise = new Promise((resolve) => {
    setTimeout(resolve, TOOLTIP_OPEN_DELAY_MS + OPEN_DELAY_MARGIN_MS);
  });

  await promise;
};
