### The misframed debate

The debate around AI autonomy is framed as "how much to trust the model." That is the wrong question.

The actual question: **does your system make decisions that someone will have to explain later?** If yes, you need to be able to reconstruct those decisions — not because of ethics or safety theatre, but because your velocity will collapse when you can't.

A workflow is an agent with tight constraints. An agent is a workflow with loose constraints. The meaningful distinction is not autonomy level — it is legibility.

### What actually breaks

The failures in agentic AI systems are not model problems. They are "nobody can reconstruct what actually happened" problems.

The pattern:
- Decisions only existed in the prompt context
- Success criteria were "whatever the model gave us"
- Assumptions got buried in chat logs that nobody saved
- Context lived in threads that got archived

Everything works fine — until three weeks later someone asks "why did we do it that way" and nobody knows. That is when velocity dies.

### Four failure modes of agent deployment

**The Fake Employee**: treating the agent as a consistent, bounded worker. Agents are stochastic, context-limited, and will confidently do whatever is asked even when it is impossible or wrong.

**The Lil Helper**: using agents for every small decision within a workflow. Two compounding effects: *silent dependency* (the agent becomes load-bearing without anyone noticing) and *institutional skill atrophy* (the team gradually loses the ability to do the thing without the agent, while the agent is never reliable enough to fully own it).

**The Analyst**: using agents for deep analysis. They produce plausible-sounding surface-level analysis and hallucinate constantly on anything requiring deep domain knowledge. They were mostly trained on Reddit.

**The Knowledge Base**: using agents as sources of truth for specialised domains. An LLM hasn't been trained on the right data to know case law, niche scientific research, or engineering standards. It will answer anyway, confidently.

**Root cause of all four**: nobody defined what the agent can do, what it can't do, or how to tell when it fails.

### Decision debt

Decision debt accumulates when:
- Choices are made without writing anything down
- Assumptions stay in people's heads
- Success is "whatever we got"
- Nobody tracks what happened

Like technical debt, decision debt eventually stops operations. You spend all your time trying to reconstruct what happened instead of making progress.

### Governance structure used in this project

**Decision records**: every time an agent does something consequential, the decision is recorded in a version-controlled markdown file — what was decided, what constraints were active, how to undo it.

**Versioned outputs**: all outputs (tool specs, module compendium, gap reports) are files in the repo, not chat logs. This turns decisions into history instead of folklore.

**Pre-defined success criteria**: success criteria for each phase are written into the process guides before the phase runs. Not after, not "whatever we got."

**Bounded authority**: agents are given explicit scope — what decisions they can make, what files they can touch, when to escalate to human review.

**Mandatory read-before-implement**: agents are required to read source documentation before writing code. No implementing from training memory. If the reference doc is missing, the agent stops and flags it.

**Attributable actions**: every code file traces to the process phase that produced it. Every formula traces to the Wikipedia article it was derived from. Attribution enables learning from failures.

### Why governance makes agents more useful

Without governance, giving agents more autonomy just makes the black box bigger. More decisions = more unauditable mess.

With governance, more autonomy is manageable. More decisions just means more documented, reviewable, changeable choices. The difference is between opaque governance (rules with no feedback) and operational governance (who decided what, why, and how to change it).

Governance is not bureaucracy. It is infrastructure for making agency legible, bounded, and usable at scale.
