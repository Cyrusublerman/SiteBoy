# Cannon–Thurston map

In mathematics, a Cannon–Thurston map is any of a number of continuous group-equivariant maps between the boundaries of two hyperbolic metric spaces extending a discrete isometric actions of the group on those spaces.

The notion originated from a seminal 1980s preprint of James Cannon and William Thurston "Group-invariant Peano curves" (eventually published in 2007) about fibered hyperbolic 3-manifolds.

Cannon–Thurston maps provide many natural geometric examples of space-filling curves.


## History

The Cannon–Thurston map first appeared in a mid-1980s preprint of James W. Cannon and William Thurston called "Group-invariant Peano curves". The preprint remained unpublished until 2007, but, in the meantime, had generated numerous follow-up works by other researchers.

In their paper, Cannon and Thurston considered the following situation. Let M be a closed hyperbolic 3-manifold that fibers over the circle with fiber S. Then S itself is a closed hyperbolic surface, and its universal cover ${\tilde {S}}$ can be identified with the hyperbolic plane $\mathbb {H} ^{2}$. Similarly, the universal cover of M can be identified with the hyperbolic 3-space $\mathbb {H} ^{3}$. The inclusion $S\subseteq M$ lifts to a $\pi _{1}(S)$-invariant inclusion
$${\tilde {S}}=\mathbb {H} ^{2}\subseteq \mathbb {H} ^{3}={\tilde {M}}
$$. This inclusion is highly distorted because the action of $\pi _{1}(S)$ on $\mathbb {H} ^{3}$ is not geometrically finite.

Nevertheless, Cannon and Thurston proved that this distorted inclusion $\mathbb {H} ^{2}\subseteq \mathbb {H} ^{3}$ extends to a continuous $\pi _{1}(S)$-equivariant map

$j:\mathbb {S} ^{1}\to \mathbb {S} ^{2}$,

where $\mathbb {S} ^{1}=\partial \mathbb {H} ^{2}$ and $\mathbb {S} ^{2}=\partial \mathbb {H} ^{3}$. Moreover, in this case, the map j is surjective, so that it provides a continuous onto function from the circle onto the 2-sphere, that is, a space-filling curve.

Cannon and Thurston also explicitly described the map $j:\mathbb {S} ^{1}\to \mathbb {S} ^{2}$, via collapsing stable and unstable laminations of the monodromy pseudo-Anosov homeomorphism of S for this fibration of M. In particular, this description implies that the map j is uniformly finite-to-one, with the pre-image of every point of $\mathbb {S} ^{2}$ having cardinality at most 2g, where g is the genus of S.

After the paper of Cannon and Thurston generated a large amount of follow-up work, with other researchers analyzing the existence or non-existence of analogs of the map j in various other set-ups motivated by the Cannon–Thurston result.


## Cannon–Thurston maps and Kleinian groups


### Kleinian representations of surface groups

The original example of Cannon and Thurston can be thought of in terms of Kleinian representations of the surface group $H=\pi _{1}(S)$. As a subgroup of $G=\pi _{1}(M)$, the group H acts on $\mathbb {H} ^{3}={\tilde {M}}$ by isometries, and this action is properly discontinuous. Thus one gets a discrete representation
$$\rho :H\to \mathbb {P} SL(2,\mathbb {C} )=\operatorname {Isom} _{+}(\mathbb {H} ^{3})
$$.

The group $H=\pi _{1}(S)$ also acts by isometries, properly discontinuously and co-compactly, on the universal cover $\mathbb {H} ^{2}={\tilde {S}}$, with the limit set $\Lambda H\subseteq \partial H^{2}=\mathbb {S} ^{1}$ being equal to $\mathbb {S} ^{1}$. The Cannon–Thurston result can be interpreted as saying that these actions of H on $\mathbb {H} ^{2}$ and $\mathbb {H} ^{3}$ induce a continuous H-equivariant map $j:\mathbb {S} ^{1}\to \mathbb {S} ^{2}$.

One can ask, given a hyperbolic surface S and a discrete representation
$$\rho :\pi _{1}(S)\to \mathbb {P} SL(2,\mathbb {C} )
$$, if there exists an induced continuous map $j:\Lambda H\to \mathbb {S} ^{2}$.

For Kleinian representations of surface groups, the most general result in this direction is due to Mahan Mj (2014). Let S be a complete connected finite volume hyperbolic surface. Thus S is a surface without boundary, with a finite (possibly empty) set of cusps. Then one still has $\mathbb {H} ^{2}={\tilde {S}}$ and $\Lambda \pi _{1}(S)=\mathbb {S} ^{1}$ (even if S has some cusps). In this setting Mj proved the following theorem:

Let S be a complete connected finite volume hyperbolic surface and let $H=\pi _{1}(S)$. Let $\rho :H\to \mathbb {P} SL(2,\mathbb {C} )$ be a discrete faithful representation without accidental parabolics. Then $\rho$ induces a continuous H-equivariant map $j:\mathbb {S} ^{1}\to \mathbb {S} ^{2}$.

Here the "without accidental parabolics" assumption means that for $1\neq h\in H$, the element $\rho (h)$ is a parabolic isometry of $\mathbb {H} ^{3}$ if and only if $h$ is a parabolic isometry of $\mathbb {H} ^{2}$. One of important applications of this result is that in the above situation the limit set
$$\Lambda \rho (\pi _{1}(S))\subseteq \mathbb {S} ^{2}
$$is locally connected.

This result of Mj was preceded by numerous other results in the same direction, such as Minsky (1994), Alperin, Dicks and Porti (1999), McMullen (2001), Bowditch (2007) and (2013), Miyachi (2002), Souto (2006), Mj (2009), (2011), and others. In particular, Bowditch's 2013 paper introduced the notion of a "stack" of Gromov-hyperbolic metric spaces and developed an alternative framework to that of Mj for proving various results about Cannon–Thurston maps.


### General Kleinian groups

In a 2017 paper, Mj proved the existence of the Cannon–Thurston map in the following setting:

Let $\rho :G\to \mathbb {P} SL(2,\mathbb {C} )$ be a discrete faithful representation where G is a word-hyperbolic group, and where $\rho (G)$ contains no parabolic isometries of $\mathbb {H} ^{3}$. Then $\rho$ induces a continuous G-equivariant map $j:\partial G\to \mathbb {S} ^{2}$, where $\partial G$ is the Gromov boundary of G, and where the image of j is the limit set of G in $\mathbb {S} ^{2}$.

Here "induces" means that the map
$$J:G\cup \partial G\to \mathbb {H} ^{3}\cup \mathbb {S} ^{2}
$$is continuous, where $J|_{\partial G}=j$ and $J(g)=gx_{0},g\in G$ (for some basepoint $x_{0}\in \mathbb {H} ^{3}$). In the same paper Mj obtains a more general version of this result, allowing G to contain parabolics, under some extra technical assumptions on G. He also provided a description of the fibers of j in terms of ending laminations of $\mathbb {H} ^{3}/G$.


## Cannon–Thurston maps and word-hyperbolic groups


### Existence and non-existence results

Let G be a word-hyperbolic group and let H ≤ G be a subgroup such that H is also word-hyperbolic. If the inclusion i:H → G extends to a continuous map ∂i: ∂H → ∂G between their hyperbolic boundaries, the map ∂i is called a Cannon–Thurston map. Here "extends" means that the map between hyperbolic compactifications ${\hat {i}}:H\cup \partial H\to G\cup \partial G$, given by
$${\hat {i}}|_{H}=i,{\hat {i}}|_{\partial H}=\partial i
$$, is continuous. In this setting, if the map ∂i exists, it is unique and H-equivariant, and the image ∂i(∂H) is equal to the limit set $\Lambda _{\partial G}(H)$.

If H ≤ G is quasi-isometrically embedded (i.e. quasiconvex) subgroup, then the Cannon–Thurston map ∂i: ∂H → ∂G exists and is a topological embedding. However, it turns out that the Cannon–Thurston map exists in many other situations as well.

Mitra proved that if G is word-hyperbolic and H ≤ G is a normal word-hyperbolic subgroup, then the Cannon–Thurston map exists. (In this case if H and Q = G/H are infinite then H is not quasiconvex in G.) The original Cannon–Thurston theorem about fibered hyperbolic 3-manifolds is a special case of this result.

If H ≤ G are two word-hyperbolic groups and H is normal in G then, by a result of Mosher, the quotient group Q = G/H is also word-hyperbolic. In this setting Mitra also described the fibers of the map ∂i: ∂H → ∂G in terms of "algebraic ending laminations" on H, parameterized by the boundary points z ∈ ∂Q.

In another paper, Mitra considered the case where a word-hyperbolic group G splits as the fundamental group of a graph of groups, where all vertex and edge groups are word-hyperbolic, and the edge-monomorphisms are quasi-isometric embeddings. In this setting Mitra proved that for every vertex group $A_{v}$, for the inclusion map $i:A_{v}\to G$ the Cannon–Thurston map $\partial i:\partial A_{v}\to \partial G$ does exist.

By combining and iterating these constructions, Mitra produced examples of hyperbolic subgroups of hyperbolic groups H ≤ G where the subgroup distortion of H in G is an arbitrarily high tower of exponentials, and the Cannon–Thurston map $\partial i:\partial H\to \partial G$ exists. Later Barker and Riley showed that one can arrange for H to have arbitrarily high primitive recursive distortion in G.

In a 2013 paper, Baker and Riley constructed the first example of a word-hyperbolic group G and a word-hyperbolic (in fact free) subgroup H ≤ G such that the Cannon–Thurston map $\partial i:\partial H\to \partial G$ does not exist. Later Matsuda and Oguni generalized the Baker–Riley approach and showed that every non-elementary word-hyperbolic group H can be embedded in some word-hyperbolic group G in such a way that the Cannon–Thurston map $\partial i:\partial H\to \partial G$ does not exist.


### Multiplicity of the Cannon–Thurston map

As noted above, if H is a quasi-isometrically embedded subgroup of a word-hyperbolic group G, then H is word-hyperbolic, and the Cannon–Thurston map $\partial i:\partial H\to \partial G$ exists and is injective. Moreover, it is known that the converse is also true: If H is a word-hyperbolic subgroup of a word-hyperbolic group G such that the Cannon–Thurston map $\partial i:\partial H\to \partial G$ exists and is injective, then H is uasi-isometrically embedded in G.

It is known, for more general convergence groups reasons, that if H is a word-hyperbolic subgroup of a word-hyperbolic group G such that the Cannon–Thurston map $\partial i:\partial H\to \partial G$ exists then for every conical limit point for H in $\partial G$ has exactly one pre-image under $\partial i$. However, the converse fails: If $\partial i:\partial H\to \partial G$ exists and is non-injective, then there always exists a non-conical limit point of H in ∂G with exactly one preimage under ∂i.

It the context of the original Cannon–Thurston paper, and for many generalizations for the Kleinin representations
$$\rho :\pi _{1}(S)\to \mathbb {P} SL(2,\mathbb {C} ),
$$the Cannon–Thurston map $j:\mathbb {S} ^{1}\to \mathbb {S} ^{2}$ is known to be uniformly finite-to-one. That means that for every point $p\in \mathbb {S} ^{2}$, the full pre-image $j^{-1}(p)$ is a finite set with cardinality bounded by a constant depending only on S.

In general, it is known, as a consequence of the JSJ-decomposition theory for word-hyperbolic groups, that if $1\to H\to G\to Q\to 1$ is a short exact sequence of three infinite torsion-free word-hyperbolic groups, then H is isomorphic to a free product of some closed surface groups and of a free group.

If $H=\pi _{1}(S)$ is the fundamental group of a closed hyperbolic surface S, such hyperbolic extensions of H are described by the theory of "convex cocompact" subgroups of the mapping class group Mod(S). Every subgroup Γ ≤ Mod(S) determines, via the Birman short exact sequence, an extension

$1\to H\to E_{\Gamma }\to \Gamma \to 1$

Moreover, the group $E_{\Gamma }$ is word-hyperbolic if and only if Γ ≤ Mod(S) is convex-cocompact. In this case, by Mitra's general result, the Cannon–Thurston map ∂i:∂H → ∂EΓ does exist. The fibers of the map ∂i are described by a collection of ending laminations on S determined by Γ. This description implies that map ∂i is uniformly finite-to-one.

If $\Gamma$ is a convex-cocompact purely atoroidal subgroup of Out ⁡ ( F n ) {\displaystyle \operatorname {Out} (F_{n})} (where $n\geq 3$) then for the corresponding extension $1\to F_{n}\to E_{\Gamma }\to \Gamma \to 1$ the group $E_{\Gamma }$ is word-hyperbolic. In this setting Dowdall, Kapovich and Taylor proved that the Cannon–Thurston map $\partial i:\partial F_{n}\to \partial E_{\Gamma }$ is uniformly finite-to-one, with point preimages having cardinality $\leq 2n$. This result was first proved by Kapovich and Lustig under the extra assumption that $\Gamma$ is infinite cyclic, that is, that $\Gamma$ is generated by an atoroidal fully irreducible element of $\operatorname {Out} (F_{n})$.

Ghosh proved that for an arbitrary atoroidal $\phi \in \operatorname {Out} (F_{n})$ (without requiring $\Gamma =\langle \phi \rangle$ to be convex cocompact) the Cannon–Thurston map $\partial i:\partial F_{n}\to \partial E_{\Gamma }$ is uniformly finite-to-one, with a bound on the cardinality of point preimages depending only on n. (However, Ghosh's result does not provide an explicit bound in terms of n, and it is still unknown if the 2n bound always holds in this case.)

It remains unknown, whenever H is a word-hyperbolic subgroup of a word-hyperbolic group G such that the Cannon–Thurston map $\partial i:\partial H\to \partial G$ exists, if the map $\partial i$ is finite-to-one. However, it is known that in this setting for every $p\in \Lambda _{\partial G}H$ such that p is a conical limit point, the set $(\partial i)^{-1}(p)$ has cardinality 1.


## Generalizations, applications and related results


- As an application of the result about the existence of Cannon–Thurston maps for Kleinian surface group representations, Mj proved that if $\Gamma \leq \mathbb {P} SL(2,\mathbb {C} )$ is a finitely generated Kleinian group such that the limit set $\Lambda \subseteq \partial \mathbb {H} ^{3}$ is connected, then $\Lambda$ is locally connected.
- Leininger, Mj and Schleimer, given a closed hyperbolic surface S, constructed a 'universal' Cannon–Thurston map from a subset of $\partial \pi _{1}(S)=\mathbb {S} ^{1}$ to the boundary $\partial {\mathcal {C}}(S,z)$ of the curve complex of S with one puncture, such that this map, in a precise sense, encodes all the Cannon–Thurston maps corresponding to arbitrary ending laminations on S. As an application, they prove that $\partial {\mathcal {C}}(S,z)$ is path-connected and locally path-connected.
- Leininger, Long and Reid used Cannon–Thurston maps to show that any finitely generated torsion-free nonfree Kleinian group with limit set equal to $\mathbb {S} ^{2}$, which is not a lattice and contains no parabolic elements, has discrete commensurator in $\mathbb {P} SL(2,\mathbb {C} )$.
- Jeon and Ohshika used Cannon–Thurston maps to establish measurable rigidity for Kleinian groups.
- Inclusions of relatively hyperbolic groups as subgroups of other relatively hyperbolic groups in many instances also induce equivariant continuous maps between their Bowditch boundaries; such maps are also referred to as Cannon–Thurston maps.
- More generally, if G is a group acting as a discrete convergence group on two metrizable compacta M and Z, a continuous G-equivariant map M → Z (if such a map exists) is also referred to as a Cannon–Thurston map. Of particular interest in this setting is the case where G is word-hyperbolic and M = ∂G is the hyperbolic boundary of G, or where G is relatively hyperbolic and M = ∂G is the Bowditch boundary of G.
- Mj and Pal obtained a generalization of Mitra's earlier result for graphs of groups to the relatively hyperbolic context.
- Pal obtained a generalization of Mitra's earlier result, about the existence of the Cannon–Thurston map for short exact sequences of word-hyperbolic groups, to relatively hyperbolic contex.


- Mj and Rafi used the Cannon–Thurston map to study which subgroups are quasiconvex in extensions of free groups and surface groups by convex cocompact subgroups of $\operatorname {Out} t(F_{n})$ and of mapping class groups.


## Further reading


- Mahan Mj, Mahan (2018). "Cannon–Thurston maps". Proceedings of the International Congress of Mathematicians—Rio de Janeiro 2018. Vol. II. Invited lectures (PDF). World Sci. Publ., Hackensack, NJ. pp. 885–917. ISBN 978-981-3272-91-0.
