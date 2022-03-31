trialDataTable = readtable("mydata.csv");
trialDataTable([1,end],:) = []; % Delete unnecessary rows.

trialData = table2struct(trialDataTable(:,{'stim', 'outcome'})); % Extract necessary columns and convert it to structure array.

psiParamsQuest = [-20, 3.5, 0.5, 0.02]; % jsqp.getEstimates() returns the values at the end of the series of trials.
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