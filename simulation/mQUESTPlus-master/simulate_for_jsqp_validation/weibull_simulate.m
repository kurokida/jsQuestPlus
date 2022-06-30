function resp = simulate_ex1(x)
threshold = -20;
slope = 3.5;
guess = 0.5;
lapse = 0.02;
y = lapse - (guess + lapse - 1).*exp(-10.^(slope.*(x - threshold)/20));

if rand() > y
    resp = 2;
else
    resp = 1;
end

%       static weibull(stim, threshold, slope, guess, lapse) {
%           const tmp = slope * (stim - threshold)/20;
%           return lapse - (guess + lapse -1)*Math.exp(-Math.pow(10, tmp))
%       }
