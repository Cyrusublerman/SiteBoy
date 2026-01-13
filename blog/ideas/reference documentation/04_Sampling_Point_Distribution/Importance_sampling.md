# Importance sampling

Importance sampling is a Monte Carlo method for evaluating properties of a particular distribution, while only having samples generated from a different distribution than the distribution of interest. Its introduction in statistics is generally attributed to a paper by Teun Kloek and Herman K. van Dijk in 1978, but its precursors can be found in statistical physics as early as 1949. Importance sampling is also related to umbrella sampling in computational physics. Depending on the application, the term may refer to the process of sampling from this alternative distribution, the process of inference, or both.


## Basic theory

Let $X\colon \Omega \to \mathbb {R}$ be a random variable in some probability space $(\Omega ,{\mathcal {F}},\mathbb {P} )$. We wish to estimate the expected value of $X$ under $\mathbb {P}$, denoted $\mathbb {E} _{\mathbb {P} }[X]$. If we have statistically independent random samples $X_{1},\ldots ,X_{n}$, generated according to $\mathbb {P}$, then an empirical estimate of $\mathbb {E} _{\mathbb {P} }[X]$ is just


$${\widehat {\mathbb {E} }}_{\mathbb {P} }[X]={\frac {1}{n}}\sum _{i=1}^{n}X_{i}\quad \mathrm {where} \;X_{i}\sim \mathbb {P} (X)
$$

and the precision of this estimate depends on the variance of $X$:


$$\operatorname {var} _{\mathbb {P} }{\big [}{\widehat {\mathbb {E} }}_{\mathbb {P} }[X]{\big ]}={\frac {\operatorname {var} _{\mathbb {P} }[X]}{n}}.
$$

The basic idea of importance sampling is to sample from a different distribution to lower the variance of the estimation of $\mathbb {E} _{\mathbb {P} }[X]$, or when sampling directly from $\mathbb {P}$ is difficult.

This is accomplished by first choosing a random variable $Y\geq 0$ such that $\mathbb {E} _{\mathbb {P} }[Y]=1$ and that $\mathbb {P}$-almost everywhere $Y(\omega )\neq 0$. With the variable $Y$ we define a probability $\mathbb {Q}$ that satisfies


$$\mathbb {E} _{\mathbb {P} }[X]=\mathbb {E} _{\mathbb {Q} }\left[{\frac {X}{Y}}\right].
$$

The variable $X/Y$ will thus be sampled under $\mathbb {Q}$ to estimate $\mathbb {E} _{\mathbb {P} }[X]$ as above and this estimation is improved when


$$\operatorname {var} _{\mathbb {Q} }\left[{\frac {X}{Y}}\right]<\operatorname {var} _{\mathbb {P} }[X].
$$

When $X$ is of constant sign over $\Omega$, the best variable $Y$ would clearly be
$$Y^{*}={\frac {X}{\mathbb {E} _{\mathbb {P} }[X]}}\geq 0
$$, so that $X/Y^{*}$ is the searched constant $\mathbb {E} _{\mathbb {P} }[X]$ and a single sample under $\mathbb {Q} ^{*}$ suffices to give its value. Unfortunately we cannot take that choice, because $\mathbb {E} _{\mathbb {P} }[X]$ is precisely the value we are looking for! However this theoretical best case $Y^{*}$ gives us an insight into what importance sampling does: for all $x\in \mathbb {R}$, the density of $\mathbb {Q} ^{*}$ at $X=x$ can be written as


$${\begin{aligned}\mathbb {Q} ^{*}{\big (}X\in [x;x+dx]{\big )}&=\int _{\omega \in \{X\in [x;x+dx]\}}{\frac {X(\omega )}{\mathbb {E} _{\mathbb {P} }[X]}}\,d\mathbb {P} (\omega )\\[6pt]&={\frac {1}{\mathbb {E} _{\mathbb {P} }[X]}}\;x\,\mathbb {P} (X\in [x;x+dx]).\end{aligned}}
$$

To the right, $x\,\mathbb {P} (X\in [x;x+dx])$ is one of the infinitesimal elements that sum up to $\mathbb {E} _{\mathbb {P} }[X]$:


$$\mathbb {E} _{\mathbb {P} }[X]=\int _{-\infty }^{+\infty }x\,\mathbb {P} (X\in [x;x+dx])
$$

therefore, a good probability change $\mathbb {Q}$ in importance sampling will redistribute the law of $X$ so that its samples' frequencies are sorted directly according to their contributions in $\mathbb {E} _{\mathbb {P} }[X]$ as opposed to $\mathbb {E} _{\mathbb {P} }[1]$. Hence the name "importance sampling."

Importance sampling is often used as a Monte Carlo integrator. When $\mathbb {P}$ is the uniform distribution over $\Omega =\mathbb {R}$, the expectation $\mathbb {E} _{\mathbb {P} }[X]$ corresponds to the integral of the real function $X\colon \mathbb {R} \to \mathbb {R}$.


## Application to probabilistic inference

Such methods are frequently used to estimate posterior densities or expectations in state and/or parameter estimation problems in probabilistic models that are too hard to treat analytically. Examples include Bayesian networks and importance weighted variational autoencoders.


## Application to simulation

Importance sampling is a variance reduction technique that can be used in the Monte Carlo method. The idea behind importance sampling is that certain values of the input random variables in a simulation have more impact on the parameter being estimated than others. If these "important" values are emphasized by sampling more frequently, then the estimator variance can be reduced. Hence, the basic methodology in importance sampling is to choose a distribution which "encourages" the important values. This use of "biased" distributions will result in a biased estimator if it is applied directly in the simulation. However, the simulation outputs are weighted to correct for the use of the biased distribution, and this ensures that the new importance sampling estimator is unbiased. The weight is given by the likelihood ratio, that is, the Radon–Nikodym derivative of the true underlying distribution with respect to the biased simulation distribution.

The fundamental issue in implementing importance sampling simulation is the choice of the biased distribution which encourages the important regions of the input variables. Choosing or designing a good biased distribution is the "art" of importance sampling. The rewards for a good distribution can be huge run-time savings; the penalty for a bad distribution can be longer run times than for a general Monte Carlo simulation without importance sampling.

Consider $X$ to be the sample and
$${\frac {f(X)}{g(X)}}
$$to be the likelihood ratio, where $f$ is the probability density (mass) function of the desired distribution and $g$ is the probability density (mass) function of the biased/proposal/sample distribution. Then the problem can be characterized by choosing the sample distribution $g$ that minimizes the variance of the scaled sample:


$$g^{*}=\min _{g}\operatorname {var} _{g}\left(X{\frac {f(X)}{g(X)}}\right).
$$

It can be shown that the following distribution minimizes the above variance:


$$g^{*}(X)={\frac {|X|f(X)}{\int |x|f(x)\,dx}}.
$$

Notice that when $X\geq 0$, this variance becomes 0.


### Mathematical approach

Consider estimating by simulation the probability $p_{t}\,$ of an event $X\geq t$, where $X$ is a random variable with cumulative distribution function $F(x)$ and probability density function $f(x)=F'(x)\,$, where prime denotes derivative. A $K$-length independent and identically distributed (i.i.d.) sequence $X_{i}\,$ is generated from the distribution $F$, and the number $k_{t}$ of random variables that lie above the threshold $t$ are counted. The random variable $k_{t}$ is characterized by the Binomial distribution


$$P(k_{t}=k)={K \choose k}p_{t}^{k}(1-p_{t})^{K-k},\,\quad \quad k=0,1,\dots ,K.
$$

One can show that $\mathbb {E} [k_{t}/K]=p_{t}$, and $\operatorname {var} [k_{t}/K]=p_{t}(1-p_{t})/K$, so in the limit $K\to \infty$ we are able to obtain $p_{t}$. Note that the variance is low if $p_{t}\approx 1$. Importance sampling is concerned with the determination and use of an alternate density function $f_{*}\,$(for $X$), usually referred to as a biasing density, for the simulation experiment. This density allows the event ${X\geq t\ }$ to occur more frequently, so the sequence lengths $K$ gets smaller for a given estimator variance. Alternatively, for a given $K$, use of the biasing density results in a variance smaller than that of the conventional Monte Carlo estimate. From the definition of $p_{t}\,$, we can introduce $f_{*}\,$ as below.


$${\begin{aligned}p_{t}&=\mathbb {E} [1_{\{X\geq t\}}]\\[6pt]&=\int 1_{\{x\geq t\}}{\frac {f(x)}{f_{*}(x)}}f_{*}(x)\,dx\\[6pt]&=\mathbb {E} _{*}[1_{\{X\geq t\}}W(X)]\end{aligned}}
$$


$$W(\cdot )\equiv {\frac {f(\cdot )}{f_{*}(\cdot )}}
$$

is a likelihood ratio and is referred to as the weighting function. The last equality in the above equation motivates the estimator


$${\hat {p}}_{t}={\frac {1}{K}}\,\sum _{i=1}^{K}1_{\{X_{i}\geq t\}}W(X_{i}),\,\quad \quad X_{i}\sim f_{*}
$$

This is the importance sampling estimator of $p_{t}\,$ and is unbiased. That is, the estimation procedure is to generate i.i.d. samples from $f_{*}\,$ and for each sample which exceeds $t\,$, the estimate is incremented by the weight $W\,$ evaluated at the sample value. The results are averaged over $K\,$ trials. The variance of the importance sampling estimator is easily shown to be


$${\begin{aligned}\operatorname {var} _{*}{\widehat {p}}_{t}&={\frac {1}{K}}\operatorname {var} _{*}[1_{\{X_{i}\geq t\}}W(X)]\\[5pt]&={\frac {1}{K}}\left\{\mathbb {E} _{*}[1_{\{X_{i}\geq t\}}^{2}W^{2}(X)]-p_{t}^{2}\right\}\\[5pt]&={\frac {1}{K}}\left\{\mathbb {E} [1_{\{X_{i}\geq t\}}W(X)]-p_{t}^{2}\right\}\end{aligned}}
$$

Now, the importance sampling problem then focuses on finding a biasing density $f_{*}\,$ such that the variance of the importance sampling estimator is less than the variance of the general Monte Carlo estimate. For some biasing density function, which minimizes the variance, and under certain conditions reduces it to zero, it is called an optimal biasing density function.


### Conventional biasing methods

Although there are many kinds of biasing methods, the following two methods are most widely used in the applications of importance sampling.


#### Scaling

Shifting probability mass into the event region ${X\geq t\ }$ by positive scaling of the random variable $X\,$ with a number greater than unity has the effect of increasing the variance (mean also) of the density function. This results in a heavier tail of the density, leading to an increase in the event probability. Scaling is probably one of the earliest biasing methods known and has been extensively used in practice. It is simple to implement and usually provides conservative simulation gains as compared to other methods.

In importance sampling by scaling, the simulation density is chosen as the density function of the scaled random variable $aX\,$, where usually $a>1$ for tail probability estimation. By transformation,


$$f_{*}(x)={\frac {1}{a}}f{\bigg (}{\frac {x}{a}}{\bigg )}\,
$$

and the weighting function is


$$W(x)=a{\frac {f(x)}{f(x/a)}}\,
$$

While scaling shifts probability mass into the desired event region, it also pushes mass into the complementary region $X<t\,$ which is undesirable. If $X\,$ is a sum of $n\,$ random variables, the spreading of mass takes place in an $n\,$ dimensional space. The consequence of this is a decreasing importance sampling gain for increasing $n\,$, and is called the dimensionality effect. A modern version of importance sampling by scaling is e.g. so-called sigma-scaled sampling (SSS) which is running multiple Monte Carlo (MC) analysis with different scaling factors. In opposite to many other high yield estimation methods (like worst-case distances WCD) SSS does not suffer much from the dimensionality problem. Also addressing multiple MC outputs causes no degradation in efficiency. On the other hand, as WCD, SSS is only designed for Gaussian statistical variables, and in opposite to WCD, the SSS method is not designed to provide accurate statistical corners. Another SSS disadvantage is that the MC runs with large scale factors may become difficult, e. g. due to model and simulator convergence problems. In addition, in SSS we face a strong bias-variance trade-off: Using large scale factors, we obtain quite stable yield results, but the larger the scale factors, the larger the bias error. If the advantages of SSS does not matter much in the application of interest, then often other methods are more efficient.


#### Translation

Another simple and effective biasing technique employs translation of the density function (and hence random variable) to place much of its probability mass in the rare event region. Translation does not suffer from a dimensionality effect and has been successfully used in several applications relating to simulation of digital communication systems. It often provides better simulation gains than scaling. In biasing by translation, the simulation density is given by

$f_{*}(x)=f(x-c),\quad c>0\,$

where $c\,$ is the amount of shift and is to be chosen to minimize the variance of the importance sampling estimator.


### Effects of system complexity

The fundamental problem with importance sampling is that designing good biased distributions becomes more complicated as the system complexity increases. Complex systems are the systems with long memory since complex processing of a few inputs is much easier to handle. This dimensionality or memory can cause problems in three ways:


- long memory (severe intersymbol interference (ISI))
- unknown memory (Viterbi decoders)
- possibly infinite memory (adaptive equalizers)

In principle, the importance sampling ideas remain the same in these situations, but the design becomes much harder. A successful approach to combat this problem is essentially breaking down a simulation into several smaller, more sharply defined subproblems. Then importance sampling strategies are used to target each of the simpler subproblems. Examples of techniques to break the simulation down are conditioning and error-event simulation (EES) and regenerative simulation.


### Evaluation of importance sampling

In order to identify successful importance sampling techniques, it is useful to be able to quantify the run-time savings due to the use of the importance sampling approach. The performance measure commonly used is $\sigma _{MC}^{2}/\sigma _{IS}^{2}\,$, and this can be interpreted as the speed-up factor by which the importance sampling estimator achieves the same precision as the MC estimator. This has to be computed empirically since the estimator variances are not likely to be analytically possible when their mean is intractable. Other useful concepts in quantifying an importance sampling estimator are the variance bounds and the notion of asymptotic efficiency. One related measure is the so-called Effective Sample Size (ESS).


### Variance cost function

Variance is not the only possible cost function for a simulation, and other cost functions, such as the mean absolute deviation, are used in various statistical applications. Nevertheless, the variance is the primary cost function addressed in the literature, probably due to the use of variances in confidence intervals and in the performance measure $\sigma _{MC}^{2}/\sigma _{IS}^{2}\,$.

An associated issue is the fact that the ratio $\sigma _{MC}^{2}/\sigma _{IS}^{2}\,$ overestimates the run-time savings due to importance sampling since it does not include the extra computing time required to compute the weight function. Hence, some people evaluate the net run-time improvement by various means. Perhaps a more serious overhead to importance sampling is the time taken to devise and program the technique and analytically derive the desired weight function.


### Multiple and adaptive importance sampling

When different proposal distributions, $g_{i}(x)$ , $i=1,\ldots ,n,$ are jointly used for drawing the samples $x_{1},\ldots ,x_{n},$ different proper weighting functions can be employed (e.g., see ). In an adaptive setting, the proposal distributions, $g_{i,t}(x)$ , $i=1,\ldots ,n,$ and $t=1,\ldots ,T,$ are updated each iteration $t$ of the adaptive importance sampling algorithm. Hence, since a population of proposal densities is used, several suitable combinations of sampling and weighting schemes can be employed.


## See also


- Monte Carlo method
- Variance reduction
- Stratified sampling
- Recursive stratified sampling
- VEGAS algorithm
- Particle filter — a sequential Monte Carlo method, which uses importance sampling
- Auxiliary field Monte Carlo
- Rejection sampling
- Variable bitrate — a common audio application of importance sampling


## External links


- Sequential Monte Carlo Methods (Particle Filtering) homepage on University of Cambridge
- Introduction to importance sampling in rare-event simulations European journal of Physics. PDF document.
- Adaptive Monte Carlo methods for rare event simulations Winter Simulation Conference
