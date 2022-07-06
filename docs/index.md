# QUEST+

QUEST+ ([Watson, 2017](https://doi.org/10.1167/17.3.10)) is an extension of QUEST ([Watson & Pelli, 1983](https://doi.org/10.3758/BF03202828))
that can deal with multiple stimulus parameters, multiple psychometric parameters, and more than two responses options. The jsQuestPlus JavaScript library allows researchers to use the QUEST+ method in online experiments. [It works in combination with existing online experimental tools such as jsPsych (de Leeuw, 2015), PsychoJS (Peirce et al., 2019), and lab.js (Henninger et al., 2021)](integration.md), and should work with other experimental tools like OpenSesame/OSWeb (Mathôt et al., 2012) and Gorilla (Anwyl-Irvine, Dalmaijer, et al., 2021). 

# How to use

This section describes how to use jsQuestPlus for [Watson's second example: "Estimation of contrast threshold, slope, and lapse {1, 3, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865).

## Importing jsQuestPlus
Builds of the jsQuestPlus library can be found in [dist/](https://github.com/kurokida/jsQuestPlus/tree/main/dist). There are two types of builds available:
* **UMD module.** `jsQuestPlus.js` can be imported as AMD module, CommonJS module, or included via a script tag. It exposes the library as a global `jsQuestPlus`.
* **ES module.** `jsQuestPlus.module.js` can be imported as ES module.

## Specify psychometric functions

To initialize the QUEST+ data, the psychometric functions corresponding to each response must be specified. For example, the function representing probabilities of incorrect responses (response = 0) in a 2-Alternative Forced-Choice task can be written as follows.

```javascript
function func_resp0 (stim, threshold, slope, guess, lapse) {
    const tmp = slope * (stim - threshold)/20
    return lapse - (guess + lapse -1) * Math.exp ( -Math.pow (10, tmp))
}
```

This describes the Weibull function, which is also available in jsQuestPlus as `jsQuestPlus.weibull`. The function representing probabilities of correct responses (response = 1) can be written as follows:

```javascript
function func_resp1(stim, threshold, slope, guess, lapse) {
    return 1 - func_resp0(stim, threshold, slope, guess, lapse) 
}
```

The func_resp0 and func_resp1 are complementary, in other words, the probabilities they return add up to 1. 

## Specify range of allowed parameter values

Next, specify the range of possible values for the stimulus and psychometric parameters. These parameters must be specified as an array, also when they are single values, for which jsQuestPlus.linspace and jsQuestPlus.array can be used:

```javascript
// [-40, -39, -38, ..., -1, 0]
const contrast_samples = jsQuestPlus.linspace (-40, 0)
const threshold_samples = jsQuestPlus.linspace (-40, 0)
// [2, 3, 4, 5]
const slope_samples = jsQuestPlus.linspace (2, 5) 
// [0, 0.01, 0.02, 0.03, 0.04]
const lapse_samples = jsQuestPlus.array (0, 0.01, 0.04) 
// The parameter of guess is assumed as a single value.
const guess = [0.5]
```

Note that a larger number of samples will affect the execution time of the QUEST+ method.

## Create jsQuestPlus instance
After specifying the psychometric functions and possible parameters, initialize the QUEST+ data as follows:

```javascript
const jsqp = new jsQuestPlus({
  psych_func:  [func_resp0, func_resp1], 
  stim_samples: [contrast_samples], 
  psych_samples: [threshold_samples, slope_samples, guess, lapse_samples]
})
```

Here, jsqp is an abbreviation of jsQuestPlus, but any valid JavaScript variable name could be used instead. The jsQuestPlus constructor should receive one argument, which is an object with three properties: psych_func, stim_samples, and psych_samples. Note that the elements in the psych_samples array (i.e., threshold, slope, guess, and lapse) must be written in the order specified in the psychometric function declaration. 

## Get and update stimulus parameters

After completing the initialization, the stimulus parameters that are predicted to yield the most informative results at the next trial can be obtained as follows:

```javascript
stim = jsqp.getStimParams()
```

The getStimParams function returns the stimulus parameter(s) that minimize(s) the expected entropies of the PDF of the psychometric parameters. The QUEST+ method recommends presenting the stimulus with the returned parameters and obtain the response. In the example task, the response is 0 or 1. This response should match the index of the the corresponing psychometric function in the array passed to the jsQuestPlus constructor. If a correct response (response = 1) is obtained, update the PDF and the expected entropies as follows:

```javascript
jsqp.update(stim, 1)
```

The presentation of stimuli, obtaining the responses, and updating of the data are repeated a predetermined number of times. Finally, the psychometric parameter estimates with the highest posterior probability can be obtained as follows:

```javascript
const estimates = jsqp.getEstimates()
```

The `estimates` array includes the estimates of each psychometric parameter, that is, the threshold, slope, and lapse in this example.

# Prior distribution of the PDF

Although priors will be treated as a uniform probability over all psychometric parameter combinations by default, these can be specified individually.

## How to specify prior distributions individually

```javascript
// Example calculation for the prior PDF of threshold.
// Assume a Gaussian function with a mean of -18 and a standard deviation of 2.
const threshold_prior = jsQuestPlus.gauss(threshold_samples, -18, 2)

const jsqp = new jsQuestPlus({
    psych_func: [func_resp0, func_resp1],
    stim_samples: [contrast_samples],
    psych_samples: [threshold_samples, slope_samples, guess, lapse_samples],
    priors: jsQuestPlus.set_prior([threshold_prior, slope_samples.length, guess.length, lapse_samples.length]),
    // The order of the priors must match the order of the psych_samples. 
    // To specify a uniform distribution (default), write the length of the parameter.
})
```

## How to use the previous jsQuestPlus data as a prior distribution

```javascript
const jsqp2 = new jsQuestPlus({
    psych_func: [func_resp0, func_resp1],
    stim_samples: [contrast_samples],
    psych_samples: [threshold_samples, slope_samples, guess, lapse_samples],
    priors: jsqp1.posteriors // Specify the posteriors of the previous condition.
})
```

# Obtaining stimulus parlameters that are not the best

The `getStimParams` function usually return the stimulus parameters that are predicted to yield the most informative results at the next trial. If you want to get a parameter that is not the best, you can specify the order in the argument. See [the discussion #4](https://github.com/kurokida/jsQuestPlus/discussions/4).


```javascript

const most_valuable_stim = jsqp.getStimParams()
const most_valuable_stim2 = jsqp.getStimParams(1) // This is the same as most_valuable_stim
const third_valuable_stim = jsqp.getStimParams(3) // Third, informative

```

# Fitting and plotting the results

See [this page](fitting.md).

# Web workers

Although jsQuestPlus is fast enough for most online experiments, one might be concerned with the execution time. A more flexible solution would be the incorporation of [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), so that jsQuestPlus calculations are executed as a background process that is less likely to interfere with the task procedure. We offer [a sample program](https://github.com/kurokida/jsQuestPlus/blob/main/jsPsychDemo/web_worker_demo.html), but note that it has not been fully tested.
