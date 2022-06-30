dat_jsqp <- read.table('jsQuestPlus_20220111.csv', sep=",", header=T) 
all_data_in_this_condition <- sub_dat <- subset(dat_jsqp, samples == 911250) 
sub_dat <- subset(all_data_in_this_condition, Trial == 1) # Retrieve unique initialization time.
hist(sub_dat$init_time, seq(0, 2500, 50), main = "" , xlab = "Time for initialization (ms)")
mean(sub_dat$init_time)

hist(all_data_in_this_condition$getStimParams_time, main = "" , xlab = "Time for determination of stimulus parameters (ms)")
mean(all_data_in_this_condition$getStimParams_time)

hist(all_data_in_this_condition$update_time, main = "" , xlab = "Time for updating (ms)")
mean(all_data_in_this_condition$update_time)
