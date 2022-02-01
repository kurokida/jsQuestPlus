x <- seq(-40,0)
mean <- 20
sd <- 3
y1 <- (1/sqrt(2 * pi))*exp((-1/2)*((x-mean)/sd)^2)
y2 <- exp((-1/2)*((x-mean)/sd)^2)
#plot(x, y)
#sum_y <- sum(y)
#plot(x, y/sum_y)

z1 <- y1/sum(y1)
z2 <- y2/sum(y2)
