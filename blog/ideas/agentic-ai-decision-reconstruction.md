# Agentic AI isn’t failing because of too much governance. It’s failing because decisions can’t be reconstructed.

**Source:** https://www.reddit.com/r/BlackboxAI_/comments/1q6igk0/agentic_ai_isnt_failing_because_of_too_much/
**Scraped:** 2026-01-08T01:49:09.107Z
**Stats:** 8 comments, 2 levels deep

---

## Content

An AI that Aims to Build Full Self-Coding.

A lot of the current debate around agentic systems feels inverted.

People argue about autonomy vs control, bureaucracy vs freedom, agents vs workflows — as if agency were a philosophical binary.

In practice, that distinction doesn’t matter much.

What matters is this: Does the system take actions across time, tools, or people that later create consequences someone has to explain?

If the answer is yes, then the system already has enough agency to require governance — not moral governance, but operational governance.

Most failures I’ve seen in agentic systems weren’t model failures. They weren’t bad prompts. They weren’t even “too much autonomy.”

They were systems where:

decisions existed only implicitly

intent lived in someone’s head

assumptions were buried in prompts or chat logs

success criteria were never made explicit

Things worked — until someone had to explain progress, failures, or tradeoffs weeks later.

That’s where velocity collapses.

The real fault line isn’t agents vs workflows. A workflow is just constrained agency. An agent is constrained agency with wider bounds.

The real fault line is legibility.

Once you externalize decision-making into inspectable artifacts — decision records, versioned outputs, explicit success criteria — something counterintuitive happens: agency doesn’t disappear. It becomes usable at scale.

This is also where the “bureaucracy kills agents” argument breaks down. Governance doesn’t restrict intelligence. It prevents decision debt.

And one question I don’t see discussed enough: If agents are acting autonomously, who certifies that a decision was reasonable under its context at the time? Not just that it happened — but that it was defensible.

Curious how others here handle traceability and auditability once agents move beyond demos and start operating across time.

## Comments

- **AutoModerator**

- **Cuntslapper9000**
  The issue ATM is that the abilities of the tools are poorly defined and poorly understood.
  
  Some people treat the tools like they are a subordinate worker. This doesn't make sense as a real worker has consistency, known limitations and actual agency. They can be trusted to understand a large number of rules and protocols and consistent tasks.
  
  Some people use it as a lil helper for solving small problems within a step. This also has issues as the methods for solving problems arent consistent, and are not properly aware of their context. This leads to a decent probability of imperfect solutions, compounding errors, etc. There is also the massive issue of a creeping reliance. People get addicted to having every little thing solved (even poorly) that they get worse at actually doing the skills. This is mainly an issue as the agents still need so much proofreading and editing that if you start to forget what a good outcome looks like because youve acclimatised to the agent output then you are fucked.
  
  Some people use them as a tool for compiling and analysing and doing high level processing. This is problematic as the tools are deceptive in their intelligence. They can spin a good tale and do pretty consistent and decent sounding surface level analysis but they hallucinate so frequently and struggle with processing many simultaneous concepts that they really don't have the skillset to do deep analysis on anything. They also haven't been trained on many of the areas in which people want to use them. They were mostly trained on Reddit and we all know the quality of content here.
  
  That leads to the final case. Some people use the agents for knowledge. That's the biggest issue going forward IMO. Just because a statement seems more probable based on the data scraped, doesn't make it more true. The LLMs just haven't been trained on the right data to have any reason to know a lot of topics. People are using agents for doing case law in small countries, or getting help with a niche area of research. How is the llm meant to have any knowledge on topics outside of its training data?
  
  Agents are a sick tool but I think people don't really think hard about what they can and can't do and get way too caught up in the hype and propaganda around it. It's annoying because I think if we, as a society were more honest about the whole thing then there would be pressure to steer the development in the right direction. Personally I think the training data is the biggest flaw in the whole thing as it's all being trained to be unprofessional sycophants lacking in any deep knowledge. As a society we have the ability to make them so much more but there are many hurdles.
  
  I'd love for an llm to be trained on all published scientific papers but at the same time I wouldn't trust any of the big players having full access to the databases. I'm sure it's the same for every field of knowledge.
  
  Until then we need to just be considerate of the actual abilities and strengths of the technology. You don't use a calculator to write an essay.

  - **lexseasson**
    This is a thoughtful take, and I agree with most of the diagnosis — especially the part about people not being honest about what these systems can and can’t do.
    
    Where I think things get interesting is that all the failure modes you describe share the same underlying issue: the tools are deployed without clearly defined roles, boundaries, and accountability.
    
    People oscillate between treating agents as workers, helpers, analysts, or sources of knowledge — but in none of those cases is their authority, scope, or failure mode made explicit. That’s why trust breaks down so quickly.
    
    The problem isn’t just that LLMs are inconsistent, hallucinate, or lack deep domain knowledge. Humans do too — but we compensate for that with contracts, procedures, escalation paths, audits, and shared definitions of “done.” We don’t give people responsibility without also defining how their decisions will be inspected later.
    
    With agents, we skip that step.
    
    So we end up with: – chat logs instead of decision records
    – vibes instead of success criteria
    – “it sounded reasonable” instead of defensible outcomes
    
    That’s where the hype becomes dangerous — not because agents are powerful, but because their limitations aren’t externalized. When failures happen, there’s no way to reconstruct why a choice was made, under what assumptions, or whether it was even appropriate given the context at the time.
    
    On training data: I agree it’s a real constraint, especially for niche or regulated domains. But even perfect data wouldn’t solve this on its own. Without explicit governance, better models just produce more confident errors at higher speed.
    
    The way forward, in my experience, isn’t pretending agents are smarter than they are — it’s treating them as decision participants whose actions must be bounded, attributable, and reviewable. Once you do that, their actual strengths become usable without creating silent dependency or institutional skill atrophy.
    
    In short: agents aren’t the problem. Undefined agency is.

- **awizzo**
  This misgovernence is in most parts where the government sticks it's nose

  - **lexseasson**
    That’s a fair reaction — but it’s also a category error.
    
    What usually fails in government isn’t governance itself, it’s opaque governance: rules without feedback, authority without traceability, and enforcement without accountability.
    
    What I’m talking about here is the opposite.
    
    Operational governance is what lets you say: – who made a decision – under which constraints – based on what information – and how it can be revised or revoked
    
    Without that, systems don’t become freer — they just become unaccountable.
    
    The irony is that most of the failures people associate with “too much governance” are actually failures of legibility, not control.

- **lexseasson**
  Governance isn’t about trusting the model. It’s about not trusting it — systematically

- **Born-Bed**
  Versioned outputs help track decision history.

  - **lexseasson**
    Agreed. Versioning outputs turns decisions into history instead of folklore. Without it, you’re just arguing with the past.

