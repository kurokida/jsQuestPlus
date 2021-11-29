# QUEST+

QUEST+ ([Watson, 2017](https://doi.org/10.1167/17.3.10)) is an extension of QUEST ([Watson & Pelli, 1983](https://doi.org/10.3758/BF03202828))
that can deal with multiple stimulus parameters, multiple psychometric functions, and more than two response options.

# jsQuestPlus
jsQuestPlus is a JavaScript library to use the QUEST+ method in online experiments.

# How to use

This section describes how to use jsQuestPlus for [the Watson's second example "Estimation of contrast threshold, slope, and lapse {1, 3, 2}](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865)".

To initialize the QUEST+ data, the psychometric functions corresponding to each response must be specified. For example, the function representing probabilities of incorrect responses in the 2AFC task can be written as follows.

```javascript
function func_resp0 (stim, threshold, slope, guess, lapse) {
    const tmp = slope * (stim - threshold)/20
    return lapse - (guess + lapse -1) * Math.exp ( -Math.pow (10, tmp))
    // Alternatively, the weibull function provided by jsQUEST is available as follows.
    // return jsQuestPlus.weibull (stim, threshold, slope, guess, lapse) 
}
```

Note that the incorrect response corresponds to 0. Similarly, the function representing probabilities of correct responses (response = 1) in the 2AFC task can be written as follows:

```javascript
function func_resp1(stim, threshold, slope, guess, lapse) {
    return 1 - func_resp0(stim, threshold, slope, guess, lapse) 
}
```

Note that the func_resp0 and func_resp1 are complementary, that is, they add up to 1. Then, specify the range of possible values for the stimulus and psychometric parameters. These parameters must be specified as an array, including the case where they are single values. The `jsQuestPlus.linspace` and `jsQuestPlus.array` functions are useful.

```javascript
const contrast_samples = jsQuestPlus.linspace (-40, 0) // [-40, -39, -38, ..., -1, 0]
const threshold_samples = jsQuestPlus.linspace (-40,0) // [-40, -39, -38, ..., -1, 0]
const slope_samples = jsQuestPlus.linspace (2,5) // [2, 3, 4, 5]
const lapse_samples = jsQuestPlus.array (0, 0.01, 0.04) // [0, 0.01, 0.02, 0.03, 0.04]
const guess = [0.5] // Although the parameter of guess is assumed as a single value, this should be specified as an array.
```

After specifying the psychometric functions and all parameters, initialize the QUEST+ data as follows:

```javascript
const jsqp = new jsQuestPlus ([func_resp0, func_resp1], [contrast_samples], [threshold_samples, slope_samples, guess, lapse_samples])
```

The jsqp is an abbreviation of jsQuestPlus, and any variable names are available. The first argument of the jsQuestPlus function is an array of the psychometric functions, the second argument is an array of the stimulus parameters, and the third argument is an array of the psychometric parameters. Note that the elements in each array (e.g., threshold_samples, slope_samples, guess, and lapse_samples) must be written in the order specified in the psychometric function declaration. Priors will be treated as a uniform probability over all psychometric parameter combinations.
	
After completing the initialization, the stimulus parameters that are predicted to yield the most informative results at the next trial can be obtained as follows:

```javascript
const stim = jsqp.getStimParams()
```

The getStimParams function returns the stimulus parameter(s) which minimizes the expected entropies of the p.d.f. of the psychometric parameters. The QUEST+ method recommends to present the stimulus with the retuned parameters and obtain the response. In the 2AFC task, the response is 0 or 1. The experimenter needs to carefully assign the number so as to correspond to the specified order of the psychometric functions. If a correct response (response = 1) is obtained, update the QUEST data as follows:

```javascript
jsqp.update(stim, 1)
```

The presentation of stimuli, obtaining the responses, and updating of QUEST data are repeated a predetermined number of times. Finally, the psychometric parameter estimates with the highest p.d.f. can be obtained as follows:

```javascript
const estimates = jsqp.getEstimates()
```

The `estimates` array includes all the estimates of the psychometric parameters, that is, the threshold, slope, and lapse in this example.


# Libraries
- [The numeric.js](https://github.com/sloisel/numeric): This performs matrix/array calculations at high speed. This library is included in jsQuestPlus, so there is no need to install it separately or write it in a script tag. The following numeric functions can be used by prefixing `jsQuestPlus`: `abs, add, cos, dim, div, dot, exp, floor, isFinite, isNaN, linspace, log, mod, mul, pow, round, sin, sqrt, sub, sum, transpose`


# The following section describes how to use jsQUEST as an ES6 module.

@tpronk developed a prototype of jsQuestPlus as an ES6 module. He adapted the code to act like an ES6 module, so it can easily be imported into other ES6 modules as follows:

```javascript
import {jsquest} from "./jsQuestPlus.module.js";
```

# Information for developers/contributors

## Installation
Install node, then clone the repo to your hard drive. Next, you can install jsQuestPlus and its dependencies by running:

`npm install`

## Building jsQUEST
To package jsQuestPlus and it's dependencies, and export those as UMD bundle, run the command below. Your bundle will be available in the `dist/` directory:

`npx rollup -c`

## Notes
jsQuestPlus depends on the numeric library, which @tpronk forked and turned into an ES6 module as well. The fork of numeric can be found [here](https://github.com/tpronk/numeric).
