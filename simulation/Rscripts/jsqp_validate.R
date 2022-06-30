true_values <- c(-20, -20, 3, 0.02, -35, -50, 1.2, -40, -50, 1.2, 1.0)
matlab_estimates <- c(-20.0270, -19.4324, 3.7838, 0.0095, -34.5405, -50.2703, 1.2216, -41.4865, -50.2703, 1.2108, 1.0108)

dat_jsqp <- read.table('jsQuestPlus_20220111.csv', sep=",", header=T) 
sub_dat <- subset(dat_jsqp, trial_index == 1) # Retrieve 37 estimates 

write.csv(sub_dat, 'sub_dat.csv')

estimates <- c(
  t.test(sub_dat$ex1_threshold)$estimate,
  t.test(sub_dat$ex2_threshold)$estimate,
  t.test(sub_dat$ex2_slope)$estimate,
  t.test(sub_dat$ex2_lapse)$estimate,
  t.test(sub_dat$ex4_threshold)$estimate,
  t.test(sub_dat$ex4_c0)$estimate,
  t.test(sub_dat$ex4_cf)$estimate,
  t.test(sub_dat$ex5_threshold)$estimate,
  t.test(sub_dat$ex5_c0)$estimate,
  t.test(sub_dat$ex5_cf)$estimate,
  t.test(sub_dat$ex5_cw)$estimate
)

lower_values <- c(
  t.test(sub_dat$ex1_threshold)$conf.int[1],
  t.test(sub_dat$ex2_threshold)$conf.int[1],
  t.test(sub_dat$ex2_slope)$conf.int[1],
  t.test(sub_dat$ex2_lapse)$conf.int[1],
  t.test(sub_dat$ex4_threshold)$conf.int[1],
  t.test(sub_dat$ex4_c0)$conf.int[1],
  t.test(sub_dat$ex4_cf)$conf.int[1],
  t.test(sub_dat$ex5_threshold)$conf.int[1],
  t.test(sub_dat$ex5_c0)$conf.int[1],
  t.test(sub_dat$ex5_cf)$conf.int[1],
  t.test(sub_dat$ex5_cw)$conf.int[1]
)

upper_values <- c(
  t.test(sub_dat$ex1_threshold)$conf.int[2],
  t.test(sub_dat$ex2_threshold)$conf.int[2],
  t.test(sub_dat$ex2_slope)$conf.int[2],
  t.test(sub_dat$ex2_lapse)$conf.int[2],
  t.test(sub_dat$ex4_threshold)$conf.int[2],
  t.test(sub_dat$ex4_c0)$conf.int[2],
  t.test(sub_dat$ex4_cf)$conf.int[2],
  t.test(sub_dat$ex5_threshold)$conf.int[2],
  t.test(sub_dat$ex5_c0)$conf.int[2],
  t.test(sub_dat$ex5_cf)$conf.int[2],
  t.test(sub_dat$ex5_cw)$conf.int[2]
)

output <- data.frame(true_values, estimates, lower_values, upper_values)
write.csv(output, 'validate.csv')
