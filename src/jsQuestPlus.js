// This project is inspired by the following two projects.
//  https://github.com/petejonze/QuestPlus
//  https://github.com/BrainardLab/mQUESTPlus
// Kudos to the developers!
// 
import numeric from 'numeric_es6';

console.log('jsQuestPlus Version 2.0.0')

class jsquest {
    // PF menas Psychometric Functions
    constructor(settings){
        const PF = settings.psych_func
        const stim_params = settings.stim_samples
        const PF_params = settings.psych_samples

        this.nAlerts = 0

        this.PF = PF

        stim_params.forEach(param =>{
            if (!Array.isArray(param)) {
                alert('The stimulus parameters must be specified as an array.')
                this.nAlerts++
            }
        })        

        const num_of_psy_samples = []
        PF_params.forEach(param =>{
            num_of_psy_samples.push(param.length)

            if (!Array.isArray(param)) {
                alert('The parameters of the psychometric function must be specified as an array.')
                this.nAlerts++
            }
        })

        this.stim_params = stim_params
        this.PF_params = PF_params

        // The combvec function is almost identical to that of MATLAB.
        // https://jp.mathworks.com/help/deeplearning/ref/combvec.html?lang=en
        this.comb_stim_params = stim_params.reduce(jsquest.combvec) // comb means combined; vec means vectors.
        this.comb_PF_params = PF_params.reduce(jsquest.combvec)
        

        let prior_data
        if (typeof settings.priors === 'undefined'){
            prior_data = jsquest.set_prior(num_of_psy_samples)
        } else {
            prior_data = settings.priors
        }

        prior_data.priors.forEach((prob_array, index) => {
            if (prob_array.length !== PF_params[index].length) alert(`The length of the probability array ${prob_array.length} does not match the length of the parameter ${PF_params[index].length}.`)
        })

        this.priors = prior_data.priors
        this.comb_priors = prior_data.comb_priors
        this.normalized_priors = prior_data.normalized_priors
        this.normalized_posteriors = this.normalized_priors
        this.posteriors = prior_data // This can be used as the prior distribution of the next condition.
        this.responses = numeric.linspace(0, PF.length-1, PF.length)
                
        // Precompute outcome proportions (likelihoods)
        // response x stimulus (row) x PF parameters (column)
        const precomputed_outcome_proportions = []
        this.PF.forEach(func => {
            const likelihoods_stimulus_domain = []
            this.comb_stim_params.forEach(stim => {
                const probabilities = []
                this.comb_PF_params.forEach(param => { // PF parameters
                    const tmp_arguments = Array.isArray(stim) ? stim.concat(param) : [stim].concat(param)
                    const p = func(...tmp_arguments)
                    if (p < 0) {
                        alert('Psychometric function has returned negative probability for an outcome')
                        this.nAlerts++
                    }
                    if (p > 1){
                        alert('Psychometric function has returned probability that exceeds one for an outcome')
                        this.nAlerts++
                    }
                    probabilities.push(p)
                })
                likelihoods_stimulus_domain.push(probabilities)
            })
            precomputed_outcome_proportions.push(likelihoods_stimulus_domain)    
        })
        this.precomputed_outcome_proportions = precomputed_outcome_proportions

        this.expected_entropies_by_stim = jsquest.update_entropy_by_stim(this) // The initial entropies
    }

    // This is similar to the QuestSd function
    // http://psychtoolbox.org/docs/QuestSd 
    getSDs(){
        const params = numeric.transpose(this.comb_PF_params)
        const sd = []
        params.forEach(data => {
            const tmp = numeric.mul(data, this.normalized_posteriors)
            const mean = numeric.sum(tmp)

            // p=sum(q.pdf);
            // sd=sqrt(sum(q.pdf.*q.x.^2)/p-(sum(q.pdf.*q.x)/p).^2);
            const p = numeric.sum(this.normalized_posteriors) // This will be 1 as long the normalized posteriors are used.
            if (p === 0) {
                alert('Divided by zero.')
                console.error('Divided by zero.')
                this.nAlerts++
            }
            const tmp1 = numeric.pow(data, 2)
            const tmp2 = numeric.mul(this.normalized_posteriors, tmp1)
            const tmp3 = numeric.div(numeric.sum(tmp2), p)
            const tmp4 = numeric.div(mean, p)
            const tmp5 = numeric.pow(tmp4, [2])
            const tmp6 = numeric.sqrt(numeric.sub(tmp3, tmp5)) // tmp6 is an array containing only one element
            // console.log(tmp6)
            // return tmp6[0]
            sd.push(tmp6[0])
        })
        return sd
    }

    // Same as the getParamEsts()
    getEstimates(thresholdingRule = 'mode', roundStimuliToDomain = true){
        switch (thresholdingRule){
            case 'mean': {
                const params = numeric.transpose(this.comb_PF_params)
                const estimates_mean = []
                const deviation = []
                params.forEach(data => {
                    const tmp = numeric.mul(data, this.normalized_posteriors)
                    const mean = numeric.sum(tmp)
                    estimates_mean.push(mean)
                    deviation.push(numeric.pow(numeric.sub(data, mean), 2))
                })

                if (roundStimuliToDomain) {
                    const dev_matrix = numeric.transpose(deviation)
                    const tmp_array = []
                    dev_matrix.forEach(data => {
                        const avg = numeric.sum(data)/data.length
                        tmp_array.push(Math.sqrt(avg))
                    })
                    const idx_mean = jsquest.find_min_index(tmp_array)
                    return this.comb_PF_params[idx_mean]
                } else {
                    return estimates_mean
                }
            }
            // case 'median':
                // Pending
                // The following code is a faithful reproduction of the Matlab code.
                // However, I'm skeptical about this calculation
                // because the method seems to depend on the order of the data in normalized_posteriors.
                // I am not sure if the value obtained by this calculation is the median.
                //
                // See https://github.com/petejonze/QuestPlus/issues/2
                // 
                // const cumsum_array = jsquest.cumsum(this.normalized_posteriors)
                // const abs_array = numeric.abs(numeric.sub(cumsum_array, 0.5))
                // const idx_median = jsquest.find_min_index(abs_array)
                // return this.comb_PF_params[idx_median]
            case 'mode': {
                const idx_mode = jsquest.find_max_index(this.normalized_posteriors)
                return this.comb_PF_params[idx_mode]
            }
            default:
                alert(`The argument of the getEstimates must be "mean" or "mode".`)
        }
    }


    
    getStimParams(num){
        // Arrange the entropies in ascending order and return the parameters of the stimuli in the specified position.

        let index
        if (typeof num === 'undefined' || num === 1){
            index = jsquest.find_min_index(this.expected_entropies_by_stim)
        } else {
            const tmp_array = numeric.linspace(0, this.expected_entropies_by_stim.length-1)
            tmp_array.sort((a, b) => this.expected_entropies_by_stim[a] - this.expected_entropies_by_stim[b])
            index = tmp_array[num - 1]
        }
        let stim = this.comb_stim_params[index]
        return stim
    }

    update(stim, resp){
        const stimIdx = this.comb_stim_params.indexOf(stim)

        if (!Object.prototype.hasOwnProperty.call(this, 'stim_list')){
            this.stim_list = [stim]
            this.resp_list = [resp]
            this.stim_index_list = [stimIdx]
        } else {
            this.stim_list.push(stim)
            this.resp_list.push(resp)
            this.stim_index_list.push(stimIdx)
        }
        const new_posterior = numeric.mul(this.normalized_posteriors, this.precomputed_outcome_proportions[resp][stimIdx])
        const s = numeric.sum(new_posterior)
        if (s === 0) {
            alert('Divided by zero.')
            console.error('Divided by zero.')
            this.nAlerts++
        }
        this.normalized_posteriors = numeric.div(new_posterior, s)
        this.posteriors.normalized_priors = this.normalized_posteriors
        this.expected_entropies_by_stim = jsquest.update_entropy_by_stim(this)
    }

    static set_prior(prior_array, norm_flag){
        const priors = []
        prior_array.forEach(prob_array => {
            if (Array.isArray(prob_array)){ // prob_array is an array of probabilities
                if (typeof norm_flag === 'undefined' || norm_flag){
                    if (Math.abs(numeric.sum(prob_array) - 1) > 0.01) alert(`set_prior Error: The sum of the probability array is not 1. The sum is ${numeric.sum(prob_array)}.`)
                }
                priors.push(prob_array)
            } else { // prob_array is the number of the psychometric parameter samples
                const unit_vector = numeric.linspace(1, 1, prob_array) // numeric.rep?
                if (prob_array === 0) {
                    alert('Divided by zero.')
                    console.error('set_prior Error 1: Divided by zero.')
                }
                priors.push(numeric.div(unit_vector, prob_array))
            }
        })

        const comb_priors = priors.reduce(jsquest.combvec)

        let mulitiplied_priors = []
        if (Array.isArray(comb_priors[0])){
            comb_priors.forEach(element => {
                mulitiplied_priors.push(element.reduce(jsquest.multiply_reducer))
            })
        } else {
            mulitiplied_priors = comb_priors
        }

        const sum_of_priors = numeric.sum(mulitiplied_priors)
        if (sum_of_priors === 0) {
            alert('Divided by zero.')
            console.error('set_prior Error 2: Divided by zero.')
        }

        const normalized_priors = numeric.div(mulitiplied_priors, sum_of_priors)

        return {
            priors,
            comb_priors,
            normalized_priors
        }
    }

    static update_entropy_by_stim(data){
        const EH_array = numeric.rep([data.comb_stim_params.length], 0)
        data.precomputed_outcome_proportions.forEach(proportions_at_stim_params => { // For each response
            proportions_at_stim_params.forEach((proportions_at_PF_params, index) => { // For each stimulus domain
                const posterior_times_proportions = numeric.mul(data.normalized_posteriors, proportions_at_PF_params)
                const expected_outcomes = numeric.sum(posterior_times_proportions)
                if (expected_outcomes === 0) {
                    alert('update_entropy_by_stim Error: Divided by zero.')
                    console.error('update_entropy_by_stim Error: Divided by zero.')
                }
                const posterior = numeric.div(posterior_times_proportions, expected_outcomes)
                // const tmp_entropy = numeric.mul(posterior, numeric.log(posterior)) // Note that log2 is used in qpArrayEntropy
                const tmp_entropy = numeric.mul(posterior, jsquest.log2(posterior))
                const H = (-1) * tmp_entropy.reduce((a,b) => a + (isNaN(b) ? 0: b), 0) // nansum function 
                // https://stackoverflow.com/questions/50956086/javascript-equivalent-of-nansum-from-matlab

                //  Compute the expected entropy for each stimulus by averaging entropies over each outcome
                EH_array[index] = EH_array[index] + expected_outcomes * H
            })
        })
        return EH_array
    }

    // Wrappers for the numeric.js
    static linspace = numeric.linspace
    static abs(a) {
        return numeric.abs(a)
    }
    static add(a, b){
        return numeric.add(a, b)
    }
    static cos(a){
        return numeric.cos(a)
    }
    static dim(a){
        return numeric.dim(a)
    }
    static div(a, b) {
        return numeric.div(a, b)
    }
    static dot = numeric.dot
    static exp(a){
        return numeric.exp(a)
    }
    static floor(a){
        return numeric.floor(a) 
    }
    static isFinite(a){
        return numeric.isFinite(a)
    }
    static isNaN(a){
        return numeric.isNaN(a)
    }
    static log(a){
        return numeric.log(a)
    }
    static mod(a, b){
        return numeric.mod(a, b)
    }
    static mul(a, b){
        return numeric.mul(a, b)
    }
    static pow(a, b){
        return numeric.pow(a, b)
    }
    static round(a){
        return numeric.round(a)
    }
    static sin(a){
        return numeric.sin(a)
    }
    static sqrt(a){
        return numeric.sqrt(a)
    }
    static sub(a, b){
        return numeric.sub(a, b)
    }
    static sum(a){
        return numeric.sum(a)
    }
    static transpose = numeric.transpose

    static log2(array){
        const length = array.length
        const output = []
        for (let i = 0; i < length; i++) output.push(Math.log2(array[i]))
        return output
    }

    // It is similar to the combvec function in MATLAB.
    // https://jp.mathworks.com/help/deeplearning/ref/combvec.html?lang=en
    static combvec(a, b, divide_flag){
        if (divide_flag === "undefined") divide_flag = true
        let output = [] 
        if (Array.isArray(a) && divide_flag){
            divide_flag = false
            a.forEach(element => {
                const res = jsquest.combvec(element, b, divide_flag)
                output = output.concat(res)
            })
        } else if (Array.isArray(b)){
            b.forEach(element => {
                output.push(jsquest.combvec(a, element, divide_flag))
            })
        }
        else {
            if (!Array.isArray(a)) a = [a]
            return a.concat(b)
        }
        return output
    }

    static multiply_reducer(a, b) {
        return a * b
    }
    
    // This is the same as the cumusm function of MATLAB
    static cumsum(array){
        const output = [array[0]]
        for (let i = 1; i < array.length; i++){
            const tmp = output[output.length - 1] + array[i]
            output.push(tmp)
        }
        return output
    }

    static find_min_index(array){
        const min = array.reduce(min_reducer)
        return array.indexOf(min)    

        function min_reducer(a, b) {
            return Math.min(a, b);
        }
    }
    
    static find_max_index(array){
        const max = array.reduce(max_reducer)
        return array.indexOf(max)    

        function max_reducer(a, b) {
            return Math.max(a, b);
        }
    }

    // https://stackoverflow.com/questions/5259421/cumulative-distribution-function-in-javascript
    // ただし引数の順番を変更して、一番目をxとしている
    // erf関数を使用する方法もあるようだ
    static normcdf(x, mean, sigma) {
        const z = (x-mean)/Math.sqrt(2*sigma*sigma);
        const t = 1/(1+0.3275911*Math.abs(z));
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const erf = 1-(((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-z*z);
        let sign = 1;
        if(z < 0)
        {
            sign = -1;
        }
        return (1/2)*(1+sign*erf);
    }

    static weibull(stim, threshold, slope, guess, lapse) {
        const tmp = slope * (stim - threshold)/20
        return lapse - (guess + lapse -1)*Math.exp(-Math.pow(10, tmp))
    }

    static simulate_weibull_two_resp(current_intensity, true_threshold, true_slope, true_guess, true_lapse){
        if (Math.random() > jsquest.weibull(current_intensity, true_threshold, true_slope, true_guess, true_lapse)){
            return 1 // yes
        } else {
            return 0 // no
        }
    } 

    static array(start, interval, end){
        const tmp = Math.floor((end-start)/interval)
        const adjusted_end = start + interval * tmp
        return numeric.linspace(start, adjusted_end, tmp+1)
    }

    // exp((-1/2) * ((x_array - mean)/sd)^2)
    static gauss(x_array, mean, sd, norm_flag){
        const tmp1 = numeric.div(numeric.sub(x_array, mean), sd)
        const tmp2 = numeric.pow(tmp1, 2)
        const tmp3 = numeric.exp(numeric.mul(-0.5, tmp2))

        if (typeof norm_flag === 'undefined' || norm_flag){
            return numeric.div(tmp3, numeric.sum(tmp3))
        } else {
            return tmp3
        }
    }

    // Note that the following code is written in qpUnitizeArray
    //
    // %% Get summed values for each column
    // %
    // % I fussed with this code in the profiler, but couldn't get it to run
    // % much faster than it does.  The code inside the if doesn't get used very
    // % often, in cases I tried.  I suppose one could live dangerously and not do
    // % the check for the zero divide.  But I don't think pain if it ever failed
    // % to be caught is worth the risk.
    // sumOfValues = sum(inputArray,1);
    // uniformArray = bsxfun(@rdivide,inputArray,sumOfValues);
    // if (any(sumOfValues == 0))
    //     index = find(sumOfValues == 0);
    //     [m,~] = size(inputArray);
    //     uniformColumn = qpUniformArray([m 1]);
    //     uniformArray(:,index) = repmat(uniformColumn,1,length(index));
    // end    

}

export default jsquest;