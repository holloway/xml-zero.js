function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function sleeper() {
  await sleep(5000);
}

sleeper();
