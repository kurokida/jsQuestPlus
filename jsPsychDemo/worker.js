// This program simulates Watson (2017)'s first example: "Estimation of contrast threshold {1, 1, 2}".
importScripts("../dist/jsQuestPlus.js");

function func_resp0 (stim, threshold, slope, guess, lapse) {
    const tmp = slope * (stim - threshold)/20
    return lapse - (guess + lapse -1) * Math.exp ( -Math.pow (10, tmp))
}

function func_resp1(stim, threshold, slope, guess, lapse) {
    return 1 - func_resp0(stim, threshold, slope, guess, lapse) 
}

const contrast_samples = jsQuestPlus.linspace(-40, 0) // [-40, -39, -38, ..., -1, 0]
const threshold_samples = jsQuestPlus.linspace(-40,0) // [-40, -39, -38, ..., -1, 0]
const slope = [3.5] // Don't forget to add brackets, i.e., specify as an array.
const guess = [0.5]
const lapse = [0.02]

const jsqp = new jsQuestPlus({
    psych_func:  [func_resp0, func_resp1], 
    stim_samples: [contrast_samples], 
    psych_samples: [threshold_samples, slope, guess, lapse]
})
console.log(jsqp);

onmessage = function(e) {
  console.log('Worker: Message received from main script');
  const stim = e.data[0];
  const resp = e.data[1];

  if (typeof stim === "undefined") { // When stimulus parameters are not specified
    postMessage([jsqp.getStimParams(), jsqp.getEstimates()]);
  } else {
    if (typeof resp === "undefined") { // When response is not specified
        throw new Error('Response must be specified.');
    } else {
        jsqp.update(stim, resp);
        postMessage([jsqp.getStimParams(), jsqp.getEstimates()]);
    }
  }
}
