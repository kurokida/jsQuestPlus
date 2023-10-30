// This is an ES6 version of Example 1 in 
// https://github.com/kurokida/jsQuestPlus/blob/417c8ecba3d7cc4daf2110ebd08c71c912b921d9/test/jsQuestPlus-test1.html
// You can execute this example by running `node jsQuestPlus_test.js`
//
// The line below import jsQuestPlus as an ES6 Module
import jsQuestPlus from '../dist/jsQuestPlus.module.js'

// For the rest, this script is a literal copy of lines 13 to 93 of this example:
// https://github.com/kurokida/jsQuestPlus/blob/main/test/jsQuestPlus-test1.html

/////////////////////////////////////////////////////////////////////
//
// Example 1: 1 stimulus parameter x 1 PF parameter x 2 responses
//
// Psychometric function corresponding to the first response
// This is the same as jsQuestPlus.weibull
function func_resp0(stim, threshold, slope, guess, lapse) {
    // const tmp = slope * (stim - threshold)/20
    // return lapse - (guess + lapse -1)*Math.exp(-Math.pow(10, tmp))

    return jsQuestPlus.weibull(stim, threshold, slope, guess, lapse) 
}

function func_resp1(stim, threshold, slope, guess, lapse) {
    return 1 - func_resp0(stim, threshold, slope, guess, lapse) 
}

// let stim_domain = jsQuestPlus.linspace(-40, 0)
// let threshold_domain = jsQuestPlus.linspace(-40,0)
let stim_domain = jsQuestPlus.linspace(-40, 0)
let threshold_domain = jsQuestPlus.linspace(-40,0)

let slope_domain = [3.5]
let guess_domain = [0.5]
let lapse_domain = [0.02]

// simulated_answers = [2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
const simulated_answers = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
const simulated_stim = [-18, -22, -25, -28, -30, -22, -13, -15, -16, -18, -19, -20, -21, -22, -23, -19, -20, -20, -18, -18, -19, -17, -17, -18, -18, -18, -19, -19, -19, -19, -19, -19]

const jsqp = new jsQuestPlus({
    psych_func: [func_resp0, func_resp1],
    stim_samples: [stim_domain],
    psych_samples: [threshold_domain, slope_domain, guess_domain, lapse_domain],
})

console.log(jsqp)
const true_threshold = -20
const true_slope = 3.5
const true_guess = 0.5
const true_lapse = 0.02

for (let i = 0; i < simulated_answers.length; i++){
    const intensity = jsqp.getStimParams()
    if (intensity !== simulated_stim[i]) alert(`Check trial ${i+1}`)
    // console.log(`Trial ${i+1}: Intensity = ${intensity}; Response = ${simulated_answers[i]}`)
    jsqp.update(intensity, simulated_answers[i])

}

const estimates_mode1 = jsqp.getEstimates()
console.log(estimates_mode1)

// Comparing with the Matlab results
if (Math.abs(jsqp.normalized_posteriors[10] - 3.3479e-04) > 5e-9) alert('Check1')
if (Math.abs(jsqp.precomputed_outcome_proportions[0][5][6] - 0.2660) > 3e-5) alert('Check2')
if (Math.abs(jsqp.precomputed_outcome_proportions[1][15][16] - 0.7340) > 3e-5) alert('Check3')
if (Math.abs(jsqp.expected_entropies_by_stim[8] - 2.4284) > 1.3e-5) alert('Check4')
if (estimates_mode1[0] !== -20) alert('Check5')
if (estimates_mode1[1] !== 3.5) alert('Check6')
if (estimates_mode1[2] !== 0.5) alert('Check7')
if (estimates_mode1[3] !== 0.02) alert('Check8')
