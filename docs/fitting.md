# Fitting and plotting the results

One useful feature that jsQuestPlus does not provide, but that QUEST+ based on Mathematica and MATLAB do, is fitting a psychometric function and plotting the results. Fitting allows estimation of psychometric parameters beyond the constraints of the quantized parameter space. Although the fitting or plotting functions cannot be performed during an online experiment, they can be performed afterwards using Mathematica or MATLAB. 

This section explains how to use the MATLAB-based qpFit function to fit the jsQuestPlus data. Note that the qpFit function requires the Optimization Toolbox (The MathWorks, Inc.)

## Save the instance of the jsQuestPlus class.

The instance means jsqp in the following case:

```javascript

const jsqp = new jsQuestPlus({
    psych_func:  [func_resp0, func_resp1], 
    stim_samples: [contrast_samples], 
    psych_samples: [threshold_samples, slope, guess, lapse]
})

```

The method of storing the instance depends on the experimental tool you are using. Please refer to the tool's documentation for specific instructions. Two properties of the instance, `stim_list` and `resp_list`, will be used.

## Arrange the data

Here we use the results of running [the demo program](https://www.hes.kyushu-u.ac.jp/~kurokid/jsQuestPlusV2/demos/Example_1stim_1psy_2resp_Watson(2017).html). Substitute the contents of the stim_list for `stim` and the contents of the resp_list for `outcome`. Do not change the variable names.

This is the MATLAB code.

```matlab

stim = [
    -18,
    -22,
    -25,
    -28,
    -30,
    -22,
    -13,
    -15,
    -16,
    -18,
    -19,
    -20,
    -21,
    -22,
    -23,
    -19,
    -20,
    -20,
    -18,
    -18,
    -19,
    -17,
    -17,
    -18,
    -18,
    -18,
    -19,
    -19,
    -19,
    -19,
    -19,
    -19
];

outcome = [
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1
];

outcome = outcome + 1; % The responses in JavaScript is 0 or 1, but in MATLAB these correspond to 1 or 2.

trialDataTable = table(stim, outcome);

trialData = table2struct(trialDataTable);

```

## Fitting the results

We refer to [qpQuestPlusCoreFunctionDemo.m](https://github.com/BrainardLab/mQUESTPlus/blob/master/demos/qpQuestPlusCoreFunctionDemo.m)

```matlab

psiParamsQuest = [-20, 3.5, 0.5, 0.02]; % jsqp.getEstimates() returns
nOutcomes = 2;

%% Find aximum likelihood fit.  Use psiParams from QUEST+ as the starting
% parameter for the search, and impose as parameter bounds the range
% provided to QUEST+.
psiParamsFit = qpFit( ...
    trialData, ... % results from online experiments
    @qpPFWeibull, ...
    psiParamsQuest, ... % estimates from online experiments
    nOutcomes, 'lowerBounds', [-40 2 0.5 0],'upperBounds',[0 5 0.5 0.04]);

fprintf('Maximum likelihood fit parameters: %0.1f, %0.1f, %0.1f, %0.2f\n', ...
    psiParamsFit(1),psiParamsFit(2),psiParamsFit(3),psiParamsFit(4));

```

## Plotting the results

We refer to [qpQuestPlusCoreFunctionDemo.m](https://github.com/BrainardLab/mQUESTPlus/blob/master/demos/qpQuestPlusCoreFunctionDemo.m)

```matlab

%% Plot of trial locations with maximum likelihood fit
figure; clf; hold on
stimCounts = qpCounts(qpData(trialData),nOutcomes);
stim = [stimCounts.stim];
stimFine = linspace(-40,0,100)';
plotProportionsFit = qpPFWeibull(stimFine,psiParamsFit);
for cc = 1:length(stimCounts)
    nTrials(cc) = sum(stimCounts(cc).outcomeCounts);
    pCorrect(cc) = stimCounts(cc).outcomeCounts(2)/nTrials(cc);
end
for cc = 1:length(stimCounts)
    h = scatter(stim(cc),pCorrect(cc),100,'o','MarkerEdgeColor',[0 0 1],'MarkerFaceColor',[0 0 1],...
        'MarkerFaceAlpha',nTrials(cc)/max(nTrials),'MarkerEdgeAlpha',nTrials(cc)/max(nTrials));
end
plot(stimFine,plotProportionsFit(:,2),'-','Color',[1.0 0.2 0.0],'LineWidth',3);
xlabel('Stimulus Value');
ylabel('Proportion Correct');
xlim([-40 00]); ylim([0 1]);
title({'Estimate Weibull threshold, slope, and lapse', ''});
drawnow;

```

## Sample image

You will get the following figure.

![qpFit_image](/images/qpFit_image.png)
