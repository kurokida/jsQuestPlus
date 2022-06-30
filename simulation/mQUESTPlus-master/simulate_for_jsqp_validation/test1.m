questData = qpInitialize('stimParamsDomainList',{[-40:1:0]}, ...
     'psiParamsDomainList',{-40:0, 2:5, 0.5, 0:0.01:0.04});

% 刺激が２次元
% questData = qpInitialize('stimParamsDomainList',{-40:1:0, 5:1:10}, ...
%     'psiParamsDomainList',{-40:0, 2:5, 0.5, 0:0.01:0.04});


% Parameters of the simulated Weibull
simulatedPsiParams = [-20, 3, .5, .02];

% Function handle that will take stimulus parameters x and simulate
% a trial according to the parameters above.
simulatedObserverFun = @(x) qpSimulatedObserver(x,@qpPFWeibull,simulatedPsiParams);

% Freeze random number generator so output is repeatable
rng('default'); rng(2004,'twister');

% Get stimulus for this trial
%stim = qpQuery(questData);

% Simulate outcome
%outcome = simulatedObserverFun(stim);

% Update quest data structure
%questData = qpUpdate(questData,stim,outcome); 

questData = qpUpdate(questData,stim,1); % 1の反応はNO?
%stim2 = qpQuery(questData);

for i = 1:40
    stim = qpQuery(questData);
    resp = simple_simulate(stim);
    msg = ['Trial' num2str(i) ': stim=' num2str(stim) '; resp=' num2str(resp)];
    disp(msg)
    questData = qpUpdate(questData, stim, resp); 
end
psiParamsIndex = qpListMaxArg(questData.posterior)
psiParamsQuest = questData.psiParamsDomain(psiParamsIndex,:)
