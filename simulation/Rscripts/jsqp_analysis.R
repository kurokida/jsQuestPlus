library(tidyverse)
# Be careful not to include the data with trial_index=0
# because the update_time is NULL.
dat_jsqp <- read.table('jsQuestPlus_20220111.csv', sep=",", header=T) 

# Check alerts
subset(dat_jsqp, ex1_nAlerts != 0)
subset(dat_jsqp, ex2_nAlerts != 0)
subset(dat_jsqp, ex4_nAlerts != 0)
subset(dat_jsqp, ex5_nAlerts != 0)

# Mean and 95% CI
summarized_data <- dat_jsqp %>%
  dplyr::group_by(ID, samples) %>%
  dplyr::summarise(mean_init_time = mean(init_time),
                   mean_get_stim_time = mean(getStimParams_time),
                   mean_update_time = mean(update_time)) %>%
  dplyr::group_by(samples) %>%
  dplyr::summarise(init_time_estimate = t.test(mean_init_time)$estimate,
                   init_time_lower = t.test(mean_init_time)$conf.int[1],
                   init_time_upper = t.test(mean_init_time)$conf.int[2],
                   get_stim_time_estimate = t.test(mean_get_stim_time)$estimate,
                   get_stim_time_lower = t.test(mean_get_stim_time)$conf.int[1],
                   get_stim_time_upper = t.test(mean_get_stim_time)$conf.int[2],
                   update_time_estimate = t.test(mean_update_time)$estimate,
                   update_time_lower = t.test(mean_update_time)$conf.int[1],
                   update_time_upper = t.test(mean_update_time)$conf.int[2])

# Mean and SD
summarized_data2 <- dat_jsqp %>%
  dplyr::group_by(ID, samples) %>%
  dplyr::summarise(mean_init_time = mean(init_time),
                   mean_get_stim_time = mean(getStimParams_time),
                   mean_update_time = mean(update_time)) %>%
  dplyr::group_by(samples) %>%
  dplyr::summarise(init_time_mean = mean(mean_init_time),
                   init_time_sd = sd(mean_init_time),
                   get_stim_time_mean = mean(mean_get_stim_time),
                   get_stim_time_sd = sd(mean_get_stim_time),
                   update_time_mean = mean(mean_update_time),
                   update_time_sd = sd(mean_update_time))


sub_dat <- subset(dat_jsqp, trial_index == 1)

##################
## OS and device information
sub_dat %>%
  group_by(platform_name) %>%
  summarise(count = n())

sub_dat %>%
  group_by(os) %>%
  summarise(count = n())
  
sub_dat %>%
  group_by(family) %>%
  summarise(count = n()) %>%
  spread(family,count)

# Watson's (2017) data
watson_data <- c(0.0044, 0.041, 0.20, 0.27)*1000
output <- cbind(summarized_data, watson_data = watson_data)
write.csv(output, "output.csv")
