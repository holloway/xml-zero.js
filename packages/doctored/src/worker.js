self.onmessage = function(e) {
  result.textContent = e.data;
  console.log("Message received from worker", result);

  self.postMessage({
    type: "result",
    index: current_event.index,
    result: {
      error_lines: error_lines,
      error_summary: error_summary
    }
  });
};
