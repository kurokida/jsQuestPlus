If you have not yet read [the instructions for use](index.md), please see that first.

# Integrations in major online experimental tools

We have confirmed that jsQuestPlus works properly in combination with [jsPsych](https://www.jspsych.org/7.1/), [PsychoJS](https://github.com/psychopy/psychojs), and [lab.js](https://lab.js.org/).

## jsPsych

The JavaScript file (jsQuestPlus.js) must be included using the `<script>` tag like other jsPsych plugins. Initialization is required at the begging of a series of trials. We recommend defining variables as global to access from other functions. 

In most jsPsych programs, the content of a stimulus is specified in the stimulus property of the plugin and can be changed dynamically using functions as follows:

```javascript

stimulus: function(){
    stim = jsqp.getStimParams()
    // Return the stimulus with the parameters suggested by jsQuestPlus.
}

```
 
For example, the data should be updated in the on_finish function of the trial.

```javascript

on_finish(data){
    const response = jsPsych.pluginAPI.compareKeys(data.response, 'f') ? 1 : 0;
    jsqp.update(stim, response)
}

```

In this example, we assume that pressing the F key for the response 1 (i.e., the yes/correct response). To repeat the trial for a predetermined number of times, the loop_function is useful. 

```javascript

let trial_num = 1
const loop_node = {
    timeline: [trial],
    loop_function: function(data){
        if (trial_num < predetermined_number){
            trial_num++
            return true
        } else {
            return false
        }
    }
}

```
 
We recommend to use jsQuestPlus in conjunction with [the psychophysics plugin](https://jspsychophysics.hes.kyushu-u.ac.jp/). Using this plugin, the experimenter can more easily present images, lines, rectangles, circles, sounds, moving objects, and Gabor patches, and the timing accuracy will be improved. Note, however, that this plugin does not improve the timing accuracy of moving objects or sound files.

## PsychoPy

jsQUEST can already be used in the PsychoPy builder (see [demo](https://gitlab.pavlovia.org/tpronk/demo_quest)). We are in the process of integrating jsQuestPlus as well. As a first step, we will perform an integration on a library level (similar to [this demo](https://gitlab.pavlovia.org/tpronk/demo_jsquest)). Next, jsQuestPlus will be integrated into the builder.

## lab.js
We have prepared a template file to make jsQuestPlus work with lab.js, and sent [a pull request](https://github.com/FelixHenninger/lab.js/pull/142).

Although the user interface of lab.js is graphical, users can write code manually. The stimulus parameters should be determined immediately before the current stimulus is presented or immediately after the previous stimulus is presented. Note that the tardy check in the builder needs to be turned on for the stimulus presentation. 

## Other tools

The jsQuestPlus library will work as long as the online experimental tool meets the following requirements: 
- The tool can load external script files.
- The tool provide the way to edit the experimental code.
- The tool provide the way to dynamically change the stimulus parameters during the experiment.

Although we haven't checked the details yet, jsQuestPlus should also work with [OpenSesame/OSWeb](https://osdoc.cogsci.nl/3.3/manual/osweb/osweb/) and [Gorilla](https://gorilla.sc/). 
