current_folder = fileparts(pwd);
addpath([current_folder filesep 'psifunctions'])
addpath([current_folder filesep 'questplus'])
addpath([current_folder filesep 'utilities'])

% The allcomb function is required in qpInitialize.m
% Jos (10584) (2022). allcomb(varargin) (https://www.mathworks.com/matlabcentral/fileexchange/10064-allcomb-varargin), MATLAB Central File Exchange. Retrieved June 3, 2022.
addpath([current_folder filesep 'allcomb'])

rng('shuffle');

estimates = zeros(1, 11);
SDs = zeros(1, 11);

nSimulation = 3;

% The data presented in our paper was calculated with 37 times and took about 20 minutes.
nSimulation = 37; 

count = 1;
nTotal = (32+64+32+64)*nSimulation;

%% Example 1 in Watson (2017)
tmp_params = zeros(1, nSimulation);
for j = 1:nSimulation
    questData = qpInitialize('stimParamsDomainList',{[-40:1:0]}, ...
     'psiParamsDomainList',{-40:0, 3.5, 0.5, 0.02});

    for i = 1:32
        stim = qpQuery(questData);
        resp = simulate_ex1(stim);
        questData = qpUpdate(questData, stim, resp); 
        msg = ['Progress: ' num2str(round(count/nTotal*100)) '%'];
        disp(msg);
        count = count + 1;
    end
    psiParamsIndex = qpListMaxArg(questData.posterior);
    psiParamsQuest = questData.psiParamsDomain(psiParamsIndex,:);
    tmp_params(1, j) = psiParamsQuest(1);
end

estimates(1) = mean(tmp_params);
SDs(1) = std(tmp_params);

%% Example 2 in Watson (2017)
tmp_params = zeros(3, nSimulation);
for j = 1:nSimulation
    questData = qpInitialize('stimParamsDomainList',{[-40:1:0]}, ...
     'psiParamsDomainList',{-40:0, 2:5, 0.5, 0:0.01:0.04});

    for i = 1:64
    %for i = 1:64*3
        stim = qpQuery(questData);
        resp = simulate_ex2(stim);
        questData = qpUpdate(questData, stim, resp); 
        msg = ['Progress: ' num2str(round(count/nTotal*100)) '%'];
        disp(msg);
        count = count + 1;
    end
    psiParamsIndex = qpListMaxArg(questData.posterior);
    psiParamsQuest = questData.psiParamsDomain(psiParamsIndex,:);
    tmp_params(1, j) = psiParamsQuest(1);
    tmp_params(2, j) = psiParamsQuest(2);
    tmp_params(3, j) = psiParamsQuest(4);
end

writematrix(tmp_params, 'matlab_simulation2.csv')
estimates(2:4) = mean(tmp_params, 2);
SDs(2:4) = std(tmp_params, 0, 2);

%% Example 4 in Watson (2017)
tmp_params = zeros(3, nSimulation);
for j = 1:nSimulation
    questData = qpInitialize( ...
        'qpPF', @qpPFSTCSF, ...
        'stimParamsDomainList', {0:2:40, 0, -50:2:0}, ... % spatial_freq, temporal_freq, contrast
        'psiParamsDomainList', {-50:2:-30, -60:2:-40, 0.8:0.2:1.6, 0}); % threshold, c0, cf, cw

    for i = 1:32
        stim = qpQuery(questData);
        resp = simulate_ex4(stim);
        questData = qpUpdate(questData, stim, resp);
        msg = ['Progress: ' num2str(round(count/nTotal*100)) '%'];
        disp(msg);
        count = count + 1;
    end
    psiParamsIndex = qpListMaxArg(questData.posterior);
    psiParamsQuest = questData.psiParamsDomain(psiParamsIndex,:);
    tmp_params(1, j) = psiParamsQuest(1);
    tmp_params(2, j) = psiParamsQuest(2);
    tmp_params(3, j) = psiParamsQuest(3);
end

estimates(5:7) = mean(tmp_params, 2);
SDs(5:7) = std(tmp_params, 0, 2);

%% Example 5 in Watson (2017)
tmp_params = zeros(4, nSimulation);
for j = 1:nSimulation
    questData = qpInitialize( ...
        'qpPF', @qpPFSTCSF, ...
        'stimParamsDomainList', {0:5:40, 0:5:40, -40:5:0}, ... % spatial_freq, temporal_freq, contrast
        'psiParamsDomainList', {-50:5:-30, -60:5:-40, 0.8:0.2:1.6, 0.8:0.2:1.6}); % threshold, c0, cf, cw

    for i = 1:64
        stim = qpQuery(questData);
        resp = simulate_ex5(stim);
        questData = qpUpdate(questData, stim, resp);
        msg = ['Progress: ' num2str(round(count/nTotal*100)) '%'];
        disp(msg);
        count = count + 1;
    end
    psiParamsIndex = qpListMaxArg(questData.posterior);
    psiParamsQuest = questData.psiParamsDomain(psiParamsIndex,:);
    tmp_params(1, j) = psiParamsQuest(1);
    tmp_params(2, j) = psiParamsQuest(2);
    tmp_params(3, j) = psiParamsQuest(3);
    tmp_params(4, j) = psiParamsQuest(4);
end

estimates(8:11) = mean(tmp_params, 2);
SDs(8:11) = std(tmp_params, 0, 2);

%% plot a weibull function
x = -40:0;
y1 = weibull(x, -20, 2, 0.5, 0.02)
y2 = weibull(x, -20, 5, 0.5, 0.02)
plot(x, y1, x, y2)
%hold on
figure
y3 = weibull(x, -20, 3.5, 0.5, 0)
y4 = weibull(x, -20, 3.5, 0.5, 0.04)
plot(x, y3, x, y4)

%% functions
function res = weibull(x, threshold, slope, guess, lapse)
    res = lapse - (guess + lapse - 1).*exp(-10.^(slope.*(x - threshold)/20));
end

function resp = simulate_ex1(x)
    threshold = -20;
    slope = 3.5;
    guess = 0.5;
    lapse = 0.02;
    y = weibull(x, threshold, slope, guess, lapse);
    
    if rand() > y
        resp = 2;
    else
        resp = 1;
    end
end

function resp = simulate_ex2(x)
    threshold = -20;
    slope = 3;
    guess = 0.5;
    lapse = 0.02;
    y = weibull(x, threshold, slope, guess, lapse);
    if rand() > y
        resp = 2;
    else
        resp = 1;
    end
end

function resp = simulate_ex4(stim)
    threshold = -35;
    c0 = -50;
    cf = 1.2;

    freq = stim(1);
    contrast = stim(3);

    max_value = max([threshold, c0 + cf*freq]);
    y = weibull(contrast, max_value, 3, 0.5, 0.01);
    
    if rand() > y
        resp = 2;
    else
        resp = 1;
    end
end

function resp = simulate_ex5(stim)
    threshold = -40;
    c0 = -50;
    cf = 1.2;
    cw = 1.0;

    spatial_freq = stim(1);
    temporal_freq = stim(2);
    contrast = stim(3);

    max_value = max([threshold, c0 + cf*spatial_freq + cw*temporal_freq]);
    y = weibull(contrast, max_value, 3, 0.5, 0.01);
    
    if rand() > y
        resp = 2;
    else
        resp = 1;
    end
end
