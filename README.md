# QUEST+

QUEST+ ([Watson, 2017](https://doi.org/10.1167/17.3.10)) is an extension of QUEST ([Watson & Pelli, 1983](https://doi.org/10.3758/BF03202828))
that can deal with multiple stimulus parameters, multiple psychometric parameters, and more than two responses options. The jsQuestPlus JavaScript library allows researchers to use the QUEST+ method in online experiments.

# How to use

See [the GitHub page](https://kurokida.github.io/jsQuestPlus/).

# Demonstrations

The demos folder contains some sample code.

## Example_1stim_1psy_2resp_Watson(2017).html

This is the sample code for [Watson's first example: "Estimation of contrast threshold {1, 1, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865). The threshold is estimated using the stimulus parameter (contrast) and responses described in Watson's paper.

 - [Run this example.](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlusV2/demos/Example_1stim_1psy_2resp_Watson(2017).html) 
 - [See the source code.](https://github.com/kurokida/jsQuestPlusV2/blob/main/demos/Example_1stim_1psy_2resp_Watson(2017).html)

## Simulation_1stim_1psy_2resp_Watson(2017).html

This file is the same as `Example_1stim_1psy_2resp_Watson(2017).html`, except that it simulates the observer's response. The final estimate will change slightly each time you run the program. 

- [Run this example.](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlusV2/demos/Simulation_1stim_1psy_2resp_Watson(2017).html) 
- [See the source code.](https://github.com/kurokida/jsQuestPlusV2/blob/main/demos/Simulation_1stim_1psy_2resp_Watson(2017).html)

## Example_2stim_3psy_2resp_Watson(2017).html

This is the sample code for [Watson's forth example: "Contrast sensitivity function {2, 3, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865). The psychometric parameters are estimated using the stimulus parameters and responses described in Watson's paper. 

- [Run this example.](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlusV2/demos/Example_2stim_3psy_2resp_Watson(2017).html)
- [See the source code.](https://github.com/kurokida/jsQuestPlusV2/blob/main/demos/Example_2stim_3psy_2resp_Watson(2017).html)

## Simulation_2stim_3psy_2resp_Watson(2017).html

This file is the same as `Example_2stim_3psy_2resp_Watson(2017).html`, except that it simulates the observer's response. The final estimates will change slightly each time you run the program. 

- [Run this example.](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlusV2/demos/Simulation_2stim_3psy_2resp_Watson(2017).html) 
- [See the source code.](https://github.com/kurokida/jsQuestPlusV2/blob/main/demos/Simulation_2stim_3psy_2resp_Watson(2017).html)

## jsPsychDemo/jsQuestPlus_jsPsychDemo.html

This is the sample code for [jsPsych](https://www.jspsych.org/7.1/) users. This simulates [Watson's second example: "Estimation of contrast threshold, slope, and lapse {1, 3, 2}"](https://jov.arvojournals.org/article.aspx?articleid=2611972#159437865). 

- [Run this example.](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlusV2/jsPsychDemo/jsQuestPlus_jsPsychDemo_auto.html) 
- [See the source code.](https://github.com/kurokida/jsQuestPlusV2/blob/main/jsPsychDemo/jsQuestPlus_jsPsychDemo_auto.html)

# Convenience functions
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
