# Created by Thomas Pronk. https://github.com/tpronk
# Library for parsing userAgent
library(uaparserjs)
# Read data
ds = read.table("sub_dat.csv", sep = ",", header = T)
# Parse userAgent
userAgents = ua_parse(ds$userAgent)
# Info about all devices
userAgents[,c("device.family", "device.brand", "device.model")]
# Info about the non-Windows and Mac OS X devices 
userAgents[
  !(userAgents$os.family %in% c("Windows", "Mac OS X")),
  c("os.family", "os.major", "device.family", "device.brand", "device.model")
]
write.csv(userAgents, "user_agent.csv")