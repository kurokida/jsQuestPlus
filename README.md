# QUEST+

QUEST+ ([Watson, 2017](https://doi.org/10.1167/17.3.10)) is an extension of QUEST ([Watson & Pelli, 1983](https://doi.org/10.3758/BF03202828))
that can deal with multiple stimulus parameters, multiple psychometric functions, and more than two response options. The jsQuestPlus JavaScript library allows researchers to use QUEST+ in online experiments.

# Demonstrations

The demos folder contains some sample code.

## [Example_1stim_1psy_2resp_Watson(2017).html](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlus/demos/Example_1stim_1psy_2resp_Watson(2017).html)

This is the sample code for [Watson's first example: "Estimation of contrast threshold {1, 1, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865). The threshold is estimated using the stimulus parameter (contrast) and responses described in Watson's paper.

## [Simulation_1stim_1psy_2resp_Watson(2017).html](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlus/demos/Simulation_1stim_1psy_2resp_Watson(2017).html)

This file is the same as `Example_1stim_1psy_2resp_Watson(2017).html`, except that it simulates the observer's response. The final estimate will change slightly each time you run the program.

## [Example_2stim_3psy_2resp_Watson(2017).html](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlus/demos/Example_2stim_3psy_2resp_Watson(2017).html)

This is the sample code for [Watson's forth example: "Contrast sensitivity function {2, 3, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865). The psychometric parameters are estimated using the stimulus parameters and responses described in Watson's paper.

## [Simulation_1stim_1psy_2resp_Watson(2017).html](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlus/demos/Simulation_2stim_3psy_2resp_Watson(2017).html)

This file is the same as `Example_2stim_3psy_2resp_Watson(2017).html`, except that it simulates the observer's response. The final estimates will change slightly each time you run the program.

## jsPsychDemo/jsQuestPlus_jsPsychDemo.html

This is the sample code for [jsPsych](https://github.com/jspsych/jsPsych/) users. This simulates [Watson's second example: "Estimation of contrast threshold, slope, and lapse {1, 3, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865).

# How to use

This section describes how to use jsQuestPlus for [Watson's second example: "Estimation of contrast threshold, slope, and lapse {1, 3, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865). Before creating an instance of jsQuestPlus, we need to specify a number of parameters.

## Importing jsQuestPlus
The library can be imported either as a UMD module or as an ES6 module.

### As a UMD module
<UMD example here>

### As an ES6 module
At the top of your script, add the following line.
	
```javascript
import {jsquest} from "./jsQuestPlus.module.js";
```

## Specify psychometric functions
First, we specify the psychometric functions that correspond to each response. The function representing probabilities of incorrect responses in a 2-Alternative Forced-Choice (2AFC) task can be written as follows.

```javascript
function func_resp0 (stim, threshold, slope, guess, lapse) {
    const tmp = slope * (stim - threshold)/20
    return lapse - (guess + lapse -1) * Math.exp ( -Math.pow (10, tmp))
    // Alternatively, the weibull function provided by jsQUEST is available as follows.
    // return jsQuestPlus.weibull (stim, threshold, slope, guess, lapse) 
}
```

An incorrect response is represented by the value 0. Similarly, the function representing the probabilities of correct responses (response = 1) in the 2AFC task can be written as follows:

```javascript
function func_resp1(stim, threshold, slope, guess, lapse) {
    return 1 - func_resp0(stim, threshold, slope, guess, lapse) 
}
```

Note that the func_resp0 and func_resp1 are complementary, that is, their probabilities add up to 1. 

## Specify range of allowed parameter values
Next, specify the range of possible values for the stimulus and psychometric parameters. These parameters must be specified as an array, also when they are single values. The `jsQuestPlus.linspace` and `jsQuestPlus.array` functions can be useful shorthands for doing so.

```javascript
const contrast_samples = jsQuestPlus.linspace (-40, 0) // [-40, -39, -38, ..., -1, 0]
const threshold_samples = jsQuestPlus.linspace (-40, 0) // [-40, -39, -38, ..., -1, 0]
const slope_samples = jsQuestPlus.linspace (2, 5) // [2, 3, 4, 5]
const lapse_samples = jsQuestPlus.array (0, 0.01, 0.04) // [0, 0.01, 0.02, 0.03, 0.04]
const guess = [0.5] // Although the parameter of guess is assumed as a single value, this should be specified as an array.
```

## Create jsQuestPlus instance
After specifying the psychometric functions and all parameters, initialize the QUEST+ data as follows:

```javascript
const jsqp = new jsQuestPlus ([func_resp0, func_resp1], [contrast_samples], [threshold_samples, slope_samples, guess, lapse_samples])
```

In this example, the instance is assigned to the variable `jsqp`, which is an abbreviation for jsQuestPlus. However, other valid variable names could be used as well. The arguments of the jsQuestPlus function are, in sequence, the following:
1. An array of psychometric functions
2. An array of stimulus parameters
3. An array of psychometric parameters. 

The first argument passed to the psychometric functions is always the stimulus parameter. Successive arguments are delivered in the same order as they are specified in the array of psychometric parameters. I.e., the first argument above is the `threshold`, which is passed as second argument to the psychometric function, the second argument above is the `slope`, which is passed as third argument to the psychometric function. Priors will be treated as a uniform probability over all psychometric parameter combinations.

## Get and update stimulus parameters  
After completing the initialization, the stimulus parameters that are predicted to yield the most informative results at the next trial, can be obtained as follows:

```javascript
const stim = jsqp.getStimParams()
```

The getStimParams function returns the stimulus parameters that minimize the expected entropies of the probability density function (PDF) of the psychometric parameters. The QUEST+ method recommends presenting the next stimulus with these parameters and register the response. In the 2AFC task, the response is 0 or 1. The experimenter needs to carefully assign the number so as to correspond to the specified order of the psychometric functions. If a correct response (response = 1) is obtained, update the QUEST data as follows:

```javascript
jsqp.update(stim, 1)
```

Presenting the stimuli, obtaining the responses, and updating of QUEST data, are repeated a predetermined number of times. Finally, the psychometric parameter estimates with the highest PDF can be obtained as follows:

```javascript
const estimates = jsqp.getEstimates()
```

The `estimates` array includes all the estimates of the psychometric parameters. For the example these are the threshold, slope, and lapse.

## Convenience functions
- The [numeric.js](https://github.com/sloisel/numeric) library performs matrix/array calculations at high speeds. This library is included in jsQuestPlus, with some of its functions available by prefixing them with `jsQuestPlus.`: `abs, add, cos, dim, div, dot, exp, floor, isFinite, isNaN, linspace, log, mod, mul, pow, round, sin, sqrt, sub, sum, transpose`.

# Information for developers

## Installation
Install node, then clone the repo to your hard drive. Next, you can install jsQuestPlus and its dependencies by running:

`npm install`

## Building jsQuestPlus
To package jsQuestPlus and it's dependencies, and export those as UMD bundle, run the command below. Your bundle will be available in the `dist/` directory:

`npx rollup -c`

## Notes
jsQuestPlus depends on a [fork of the numeric library]((https://github.com/tpronk/numeric), which turns this library into an ES6 module.
