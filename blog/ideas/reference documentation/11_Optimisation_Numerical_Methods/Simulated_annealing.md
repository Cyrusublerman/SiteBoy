# Simulated annealing

Simulated annealing (SA) is a probabilistic technique for approximating the global optimum of a given function. Specifically, it is a metaheuristic to approximate global optimization in a large search space for an optimization problem. For large numbers of local optima, SA can find the global optimum. It is often used when the search space is discrete (for example the traveling salesman problem, the boolean satisfiability problem, protein structure prediction, and job-shop scheduling). For problems where a fixed amount of computing resource is available, finding an approximate global optimum may be more relevant than attempting to find a precise local optimum. In such cases, SA may be preferable to exact algorithms such as gradient descent or branch and bound. The problems solved by SA are currently formulated by an objective function of many variables, subject to several mathematical constraints. In practice, a constraint violation can be penalized as part of the objective function.

Similar techniques have been independently introduced on several occasions, including Pincus (1970), Khachaturyan et al. (1979, 1981), Kirkpatrick, Gelatt and Vecchi (1983), and Cerny (1985). In 1983, this approach was used by Kirkpatrick, Gelatt Jr., and Vecchi for a solution of the traveling salesman problem. They also proposed its current name, simulated annealing.

The name of the algorithm comes from annealing in metallurgy, a technique involving heating and controlled cooling of a material to alter its physical properties. This notion of slow cooling implemented in the simulated annealing algorithm is interpreted as a slow decrease in the probability of accepting worse solutions as the solution space is explored. Accepting worse solutions allows for a more extensive search for the global optimal solution. Simulated annealing algorithms work by progressively decreasing the temperature from an initial positive value to zero. At each time step, the algorithm randomly selects a solution close to the current one, measures its quality, and moves to it according to the temperature-dependent probabilities of selecting better or worse solutions.

The simulation can be performed either by a solution of kinetic equations for probability density functions, or by using a stochastic sampling method. The method is an adaptation of the Metropolis–Hastings algorithm, a Monte Carlo method to generate sample states of a thermodynamic system, published by N. Metropolis et al. in 1953.


## Overview

The state s of some physical systems, and the function E(s) to be minimized, is analogous to the internal energy of the system in that state. The goal is to bring the system, from an arbitrary initial state, to a state with the minimum possible energy.


### The basic iteration

At each step, the simulated annealing heuristic considers some neighboring state s* of the current state s, and probabilistically decides between moving the system to state s* or staying in state s. These probabilities ultimately lead the system to move to states of lower energy. Typically, this step is repeated until the system reaches a state that is good enough for the application, or until a given computation budget has been exhausted.


### The neighbors of a state

Optimization of a solution involves evaluating the neighbor states, which are new states produced through conservatively altering the current state. For example, in the traveling salesman problem, each state is typically defined as a permutation of the cities to be visited, and the neighbors of any state are the set of permutations produced by swapping any two of these cities. The well-defined way in which the states are altered to produce neighboring states is called a move, and different moves give different sets of neighboring states. These moves usually result in minimal alterations of the current state, in an attempt to progressively improve the solution through iteratively improving its parts (such as the city connections in the traveling salesman problem).

Simple heuristics like hill climbing, which move by finding better neighbor after better neighbor and stop when they have reached a solution which has no neighbors that are better solutions, is not guaranteed to lead to any of the existing better solutions – their outcome may easily be just a local optimum, while the actual best solution would be a global optimum that could be different. Metaheuristics use the neighbors of a solution as a way to explore the solution space, and although they prefer better neighbors, they probabilistically also accept worse neighbors to avoid getting stuck in local optima; they can find the global optimum if given enough time.


### Acceptance probabilities

The probability of making the transition from the current state $s$ to a candidate new state $s_{\mathrm {new} }$ is specified by an acceptance probability function $P(e,e_{\mathrm {new} },T)$, that depends on the energies $e=E(s)$ and $e_{\mathrm {new} }=E(s_{\mathrm {new} })$ of the two states, and on a global time-varying parameter $T$ called the temperature. States with a smaller energy are better than those with a greater energy. The probability function $P$ must be positive even when $e_{\mathrm {new} }$ is greater than $e$. This feature prevents the method from becoming stuck at a local minimum that is worse than the global one.

When $T$ tends to zero, the probability $P(e,e_{\mathrm {new} },T)$ must tend to zero if $e_{\mathrm {new} }>e$ and to a positive value otherwise. For sufficiently small values of $T$, the system will then increasingly favor moves that go "downhill" (i.e., to lower energy values), and avoid those that go "uphill." With $T=0$ the procedure reduces to the greedy algorithm, which makes only the downhill transitions.

In the original description of simulated annealing, the probability $P(e,e_{\mathrm {new} },T)$ was equal to 1 when $e_{\mathrm {new} }<e$—i.e., the procedure always moved downhill when it found a way to do so, irrespective of the temperature. Many descriptions and implementations of simulated annealing still take this condition as part of the method's definition. However, this condition is not essential for the method to work.

The $P$ function is usually chosen so that the probability of accepting a move decreases when the difference $e_{\mathrm {new} }-e$ increases—that is, small uphill moves are more likely than large ones. However, this requirement is not strictly necessary, provided that the above requirements are met.

Given these properties, the temperature $T$ plays a crucial role in controlling the evolution of the state $s$ of the system with regard to its sensitivity to the variations of system energies. To be precise, for a large $T$, the evolution of $s$ is sensitive to coarser energy variations, while it is sensitive to finer energy variations when $T$ is small.


### The annealing schedule

The name and inspiration of the algorithm demand an interesting feature related to the temperature variation to be embedded in the operational characteristics of the algorithm. This necessitates a gradual reduction of the temperature as the simulation proceeds. The algorithm starts initially with $T$ set to a high value (or infinity), and then it is decreased at each step following some annealing schedule—which may be specified by the user but must end with $T=0$ towards the end of the allotted time budget. In this way, the system is expected to wander initially towards a broad region of the search space containing good solutions, ignoring small features of the energy function; then drift towards low-energy regions that become narrower and narrower, and finally move downhill according to the steepest descent heuristic.

For any given finite problem, the probability that the simulated annealing algorithm terminates with a global optimal solution approaches 1 as the annealing schedule is extended. This theoretical result, however, is not particularly helpful, since the time required to ensure a significant probability of success will usually exceed the time required for a complete search of the solution space.


## Pseudocode

The following pseudocode presents the simulated annealing heuristic as described above. It starts from a state s0 and continues until a maximum of kmax steps have been taken. In the process, the call neighbour(s) should generate a randomly chosen neighbour of a given state s; the call random(0, 1) should pick and return a value in the range [0, 1], uniformly at random. The annealing schedule is defined by the call temperature(r), which should yield the temperature to use, given the fraction r of the time budget that has been expended so far.


## Selecting the parameters

In order to apply the simulated annealing method to a specific problem, one must specify the following parameters: the state space, the energy (goal) function E(), the candidate generator procedure neighbour(), the acceptance probability function P(), and the annealing schedule temperature() AND initial temperature init_temp. These choices can have a significant impact on the method's effectiveness. Unfortunately, there are no choices of these parameters that will be good for all problems, and there is no general way to find the best choices for a given problem. The following sections give some general guidelines.


### Sufficiently near neighbour

Simulated annealing may be modeled as a random walk on a search graph, whose vertices are all possible states, and whose edges are the candidate moves. An essential requirement for the neighbour() function is that it must provide a sufficiently short path on this graph from the initial state to any state which may be the global optimum – the diameter of the search graph must be small. In the traveling salesman example above, for instance, the search space for n = 20 cities has n! = 2,432,902,008,176,640,000 (2.4 quintillion) states; yet the number of neighbors of each vertex is
$$\sum _{k=1}^{n-1}k={\frac {n(n-1)}{2}}=190
$$edges (coming from $n \choose 2$), and the diameter of the graph is $n-1$.


### Transition probabilities

To investigate the behavior of simulated annealing on a particular problem, it can be useful to consider the transition probabilities that result from the various design choices made in the implementation of the algorithm. For each edge $(s,s')$ of the search graph, the transition probability is defined as the probability that the simulated annealing algorithm will move to state $s'$ when its current state is $s$. This probability depends on the current temperature as specified by temperature(), on the order in which the candidate moves are generated by the neighbour() function, and on the acceptance probability function P(). (Note that the transition probability is not simply $P(e,e',T)$, because the candidates are tested serially.)


### Acceptance probabilities

The specification of neighbour(), P(), and temperature() is partially redundant. In practice, it's common to use the same acceptance function P() for many problems and adjust the other two functions according to the specific problem.

In the formulation of the method by Kirkpatrick et al., the acceptance probability function $P(e,e',T)$ was defined as 1 if $e'<e$, and $\exp(-(e'-e)/T)$ otherwise. This formula was superficially justified by analogy with the transitions of a physical system; it corresponds to the Metropolis–Hastings algorithm, in the case where T=1 and the proposal distribution of Metropolis–Hastings is symmetric. However, this acceptance probability is often used for simulated annealing even when the neighbour() function, which is analogous to the proposal distribution in Metropolis–Hastings, is not symmetric, or not probabilistic at all. As a result, the transition probabilities of the simulated annealing algorithm do not correspond to the transitions of the analogous physical system, and the long-term distribution of states at a constant temperature $T$ need not bear any resemblance to the thermodynamic equilibrium distribution over states of that physical system, at any temperature. Nevertheless, most descriptions of simulated annealing assume the original acceptance function, which is probably hard-coded in many implementations of SA.

In 1990, Moscato and Fontanari, and independently Dueck and Scheuer, proposed that a deterministic update (i.e. one that is not based on the probabilistic acceptance rule) could speed-up the optimization process without impacting on the final quality. Moscato and Fontanari conclude from observing the analogous of the "specific heat" curve of the "threshold updating" annealing originating from their study that "the stochasticity of the Metropolis updating in the simulated annealing algorithm does not play a major role in the search of near-optimal minima". Instead, they proposed that "the smoothening of the cost function landscape at high temperature and the gradual definition of the minima during the cooling process are the fundamental ingredients for the success of simulated annealing." The method subsequently popularized under the denomination of "threshold accepting" due to Dueck and Scheuer's denomination. In 2001, Franz, Hoffmann and Salamon showed that the deterministic update strategy is indeed the optimal one within the large class of algorithms that simulate a random walk on the cost/energy landscape.


### Efficient candidate generation

When choosing the candidate generator neighbour(), one must consider that after a few iterations of the simulated annealing algorithm, the current state is expected to have much lower energy than a random state. Therefore, as a general rule, one should skew the generator towards candidate moves where the energy of the destination state $s'$ is likely to be similar to that of the current state. This heuristic (which is the main principle of the Metropolis–Hastings algorithm) tends to exclude very good candidate moves as well as very bad ones; however, the former are usually much less common than the latter, so the heuristic is generally quite effective.

In the traveling salesman problem above, for example, swapping two consecutive cities in a low-energy tour is expected to have a modest effect on its energy (length); whereas swapping two arbitrary cities is far more likely to increase its length than to decrease it. Thus, the consecutive-swap neighbor generator is expected to perform better than the arbitrary-swap one, even though the latter could provide a somewhat shorter path to the optimum (with $n-1$ swaps, instead of $n(n-1)/2$).

A more precise statement of the heuristic is that one should try the first candidate states $s'$ for which $P(E(s),E(s'),T)$ is large. For the "standard" acceptance function $P$ above, it means that $E(s')-E(s)$ is on the order of $T$ or less. Thus, in the traveling salesman example above, one could use a neighbour() function that swaps two random cities, where the probability of choosing a city-pair vanishes as their distance increases beyond $T$.


### Barrier avoidance

When choosing the candidate generator neighbor () one must also try to reduce the number of "deep" local minima—states (or sets of connected states) that have much lower energy than all its neighboring states. Such "closed catchment basins" of the energy function may trap the simulated annealing algorithm with high probability (roughly proportional to the number of states in the basin) and for a very long time (roughly exponential on the energy difference between the surrounding states and the bottom of the basin).

As a rule, it is impossible to design a candidate generator that will satisfy this goal and also prioritize candidates with similar energy. On the other hand, one can often vastly improve the efficiency of simulated annealing by relatively simple changes to the generator. In the traveling salesman problem, for instance, it is not hard to exhibit two tours $A$, $B$, with nearly equal lengths, such that (1) $A$ is optimal, (2) every sequence of city-pair swaps that converts $A$ to $B$ goes through tours that are much longer than both, and (3) $A$ can be transformed into $B$ by flipping (reversing the order of) a set of consecutive cities. In this example, $A$ and $B$ lie in different "deep basins" if the generator performs only random pair-swaps; but they will be in the same basin if the generator performs random segment-flips.


### Cooling schedule

The physical analogy that is used to justify simulated annealing assumes that the cooling rate is low enough for the probability distribution of the current state to be near thermodynamic equilibrium at all times. Unfortunately, the relaxation time—the time one must wait for the equilibrium to be restored after a change in temperature—strongly depends on the "topography" of the energy function and on the current temperature. In the simulated annealing algorithm, the relaxation time also depends on the candidate generator, in a very complicated way. Note that all these parameters are usually provided as black box functions to the simulated annealing algorithm. Therefore, the ideal cooling rate cannot be determined beforehand and should be empirically adjusted for each problem. Adaptive simulated annealing algorithms address this problem by connecting the cooling schedule to the search progress. Other adaptive approaches such as Thermodynamic Simulated Annealing, automatically adjusts the temperature at each step based on the energy difference between the two states, according to the laws of thermodynamics.


## Restarts

Sometimes it is better to move back to a solution that was significantly better rather than always moving from the current state. This process is called restarting of simulated annealing. To do this we set $s$ and $e$ to ${\text{sbest}}$ and ${\text{ebest}}$ and perhaps restart the annealing schedule. The decision to restart could be based on several criteria. Notable among these include restarting based on a fixed number of steps, based on whether the current energy is too high compared to the best energy obtained so far, restarting randomly, etc.


## Related methods


- Interacting Metropolis–Hasting algorithms (a.k.a. sequential Monte Carlo) combines simulated annealing moves with an acceptance-rejection of the best-fitted individuals equipped with an interacting recycling mechanism.
- Quantum annealing uses "quantum fluctuations" instead of thermal fluctuations to get through high but thin barriers in the target function.
- Stochastic tunneling attempts to overcome the increasing difficulty simulated annealing runs have in escaping from local minima as the temperature decreases, by 'tunneling' through barriers.
- Tabu search normally moves to neighbouring states of lower energy, but will take uphill moves when it finds itself stuck in a local minimum; and avoids cycles by keeping a "taboo list" of solutions already seen.
- Dual-phase evolution is a family of algorithms and processes (to which simulated annealing belongs) that mediate between local and global search by exploiting phase changes in the search space.
- Reactive search optimization focuses on combining machine learning with optimization, by adding an internal feedback loop to self-tune the free parameters of an algorithm to the characteristics of the problem, of the instance, and of the local situation around the current solution.
- Genetic algorithms maintain a pool of solutions rather than just one. New candidate solutions are generated not only by "mutation" (as in SA), but also by "recombination" of two solutions from the pool. Probabilistic criteria, similar to those used in SA, are used to select the candidates for mutation or combination, and for discarding excess solutions from the pool.
- Memetic algorithms search for solutions by employing a set of agents that both cooperate and compete in the process; sometimes the agents' strategies involve simulated annealing procedures for obtaining high-quality solutions before recombining them. Annealing has also been suggested as a mechanism for increasing the diversity of the search.
- Graduated optimization digressively "smooths" the target function while optimizing.
- Ant colony optimization (ACO) uses many ants (or agents) to traverse the solution space and find locally productive areas.
- The cross-entropy method (CE) generates candidate solutions via a parameterized probability distribution. The parameters are updated via cross-entropy minimization, so as to generate better samples in the next iteration.
- Harmony search mimics musicians in improvisation where each musician plays a note to find the best harmony together.
- Stochastic optimization is an umbrella set of methods that includes simulated annealing and numerous other approaches.
- Particle swarm optimization is an algorithm modeled on swarm intelligence that finds a solution to an optimization problem in a search space, or models and predicts social behavior in the presence of objectives.
- The runner-root algorithm (RRA) is a meta-heuristic optimization algorithm for solving unimodal and multimodal problems inspired by the runners and roots of plants in nature.
- Intelligent water drops algorithm (IWD) which mimics the behavior of natural water drops to solve optimization problems
- Parallel tempering is a simulation of model copies at different temperatures (or Hamiltonians) to overcome the potential barriers.
- Multi-objective simulated annealing algorithms have been used in multi-objective optimization.


## See also


## Further reading


- A. Das and B. K. Chakrabarti (Eds.), Quantum Annealing and Related Optimization Methods, Lecture Note in Physics, Vol. 679, Springer, Heidelberg (2005)
- Weinberger, E. (1990). "Correlated and uncorrelated fitness landscapes and how to tell the difference". Biological Cybernetics. 63 (5): 325–336. doi:10.1007/BF00202749. S2CID 851736.
- Press, WH; Teukolsky, SA; Vetterling, WT; Flannery, BP (2007). "Section 10.12. Simulated Annealing Methods". Numerical Recipes: The Art of Scientific Computing (3rd ed.). New York: Cambridge University Press. ISBN 978-0-521-88068-8. Archived from the original on 2011-08-11. Retrieved 2011-08-13.
- Strobl, M.A.R.; Barker, D. (2016). "On simulated annealing phase transitions in phylogeny reconstruction". Molecular Phylogenetics and Evolution. 101: 46–55. Bibcode:2016MolPE.101...46S. doi:10.1016/j.ympev.2016.05.001. PMC 4912009. PMID 27150349.
- V.Vassilev, A.Prahova: "The Use of Simulated Annealing in the Control of Flexible Manufacturing Systems", International Journal INFORMATION THEORIES & APPLICATIONS, VOLUME 6/1999
- D. Thiel, "Simulated Annealing: From Statistical Thermodynamics to Combinatory Problems Solving", Encyclopedia of Life Support Systems UNESCO – EOLSS, Chapter Systems Science and Cybernetics – Vol. III


## External links


- Simulated Annealing A JavaScript app that allows you to experiment with simulated annealing. Source code included.
- "General Simulated Annealing Algorithm" Archived 2008-09-23 at the Wayback Machine An open-source MATLAB program for general simulated annealing exercises.
- Self-Guided Lesson on Simulated Annealing A Wikiversity project.
- Google in superposition of using, not using quantum computer Ars Technica discusses the possibility that the D-Wave computer being used by Google may, in fact, be an efficient simulated annealing co-processor.
- A Simulated Annealing-Based Multiobjective Optimization Algorithm: AMOSA.
