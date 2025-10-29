x(t) = A₁cosᵖ¹(ω₁t+φ₁) + A₂cosᵖ²(ω₂t+φ₂) + Mₓcosᵖᵐ¹(ωₘ₁t+φₘ₁)sinᵖᵐ²(ωₘ₂t+φₘ₂)

y(t) = A₁sinᵖ¹(ω₁t+φ₁) + A₂sinᵖ²(ω₂t+φ₂) + Mᵧsinᵖᵐ¹(ωₘ₁t+φₘ₁)cosᵖᵐ²(ωₘ₂t+φₘ₂)

variable limitations for smooth movement (sensical):
Amplitude (A): (-1 to 1, same for both x and y, same for all A variables);
frequency(ω): (always integers, -250 to 250);
power(p):(integers, 0 to 5)
phase(φ): (-2pi to 2pi, should start and end at multiples of pi);
Modulator toggle/amplitude (M): (same as A);

initially point number at 20000 points. 
only change one variable at a time. 
no blending of values, always increment decrement within ruleset. 
