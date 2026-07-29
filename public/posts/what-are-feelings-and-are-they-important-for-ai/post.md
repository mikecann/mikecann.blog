---
coverImage: ./header.webp
date: '2026-07-29T07:31:40.000Z'
tags:
  - ai
  - thought
title: What Are Feelings and Are They Important for AI?
---

This is a topic I have been musing on for a long while now, so I thought it was about time that I got the ideas out of my head and down onto "paper".

I have written in the past on the topic of what's missing from AI. In [The Missing Piece of AGI: Why Self-Doubt Matters?](https://mikecann.blog/posts/the-missing-piece-of-AGI-why-self-doubt-matters), I argued that what is currently missing from LLMs is the ability to question their own understanding of a topic to see if they know the answer before they output it.

This is something that we, as humans (you are human, right?), do naturally all the time. For example, if I were to ask you, "What is the speed of light in a vacuum?" you could either say "299,792,458 meters per second," or "Umm, I'm not exactly sure." You have the ability to introspect your own memory to check if you know something. In that blog post, I argued that LLMs can't do this.

LLMs contain signals correlated with uncertainty, but today's models do not reliably surface those signals, understand them as part of a persistent self-model, or allow them to govern whether the model should answer.

Some people countered this by asking, "How can an LLM know that it doesn't know something?" But you could just as easily ask, "How can an LLM even know that it knows something?" The key here is that it doesn't really know that it knows anything. It can output the next token, and that token will have gone through a very complex, high-dimensional representation of that concept to produce an answer, but it cannot reliably introspect that representation to see how it feels about a topic like we can.

![Mike asks a robot whether it knows the speed of light](./01-uncertain-speed-of-light.webp)

So now that I have used the word "feel," let's talk about that.

So we have feelings, but what are they and why do we have them?

I have done zero research on this topic, so apologies upfront if I'm missing a large body of literature. Normally, I do like to research a topic before I talk about it, but I also think sometimes it's important to reason from first principles.

So when I think about *my* feelings, they always seem to exist as a sort of layer on top of or in front of memories. I can have an emotion or feeling (apologies if I use these terms interchangeably here) about something without actually remembering the details.

![Feelings acting as a compressed layer over a collection of memories](./02-feelings-compress-memories.webp)

For example, think about your mother, father, or a significant loved one. Chances are, you have good, happy thoughts and feelings but no exact recollection of exactly why you have those feelings.

Memory is expensive. It takes quite a bit of cognitive brainpower to think back through all the various reasons why you feel that way, stepping through the events and memories that led up to it.

So I think that emotions and feelings are a sort of summary layer that evolved on top of memory to help us quickly respond to stimuli in the world without having to search through memories of what happened last time and respond accordingly. They are, in effect, another way for us to learn from our experiences.

![A feeling produces a fast reaction before memory can catch up](./03-fast-feeling-slow-memory.webp)

That makes sense for things such as love, pain, anger, etc., but how does it tie into feelings around abstract concepts such as knowing the speed of light in a vacuum? Well, it's unlikely that you will have any strong feelings about that particular fact, but I would argue that you can still have feelings about abstract topics like this.

You can have the feeling that you know quite a bit about a topic, or not much about it. You can have a feeling of being pretty sure about something or, conversely, pretty sure that you are not sure about it. In short, you can quickly probe your own understanding of something without going deep and exploring every recollection of it.

![Mike experiences the difference between knowing and not knowing](./04-feeling-of-knowing.webp)

So how does this relate to AI?

Well, "[The Missing Piece of AGI: Why Self-Doubt Matters?](https://mikecann.blog/posts/the-missing-piece-of-AGI-why-self-doubt-matters)" has the word "AGI" in it for a reason. In my mind, the big distinction between AI (LLMs) and AGI is that AGI should feel more "human." It should be able to act and think like humans do. It should be able to have its own goals, opinions, and *feelings* about topics.

I think that, to get there, LLMs need to be able to introspect their own memories and sense of self, and understand their own understanding of a given topic without happily hallucinating an output. Because introspection across trillions of parameters in a deep neural network would likely be very expensive, I argue that we would need some sort of "feelings" layer on top that an LLM could inspect, just like we do, as a quick way to gauge its understanding of a topic.

Now, I want to reiterate that I have done zero intentional research on this topic, so this may well already be a well-understood concept and problem that I am writing about here, but I think it's a fun one to think about regardless.

I don't know where things are going to go. I love reading about the mechanistic interpretability research that Anthropic and others have been doing to try to uncover how LLMs actually work and think. For example, their latest work on J-space is truly fascinating: [https://www.anthropic.com/research/global-workspace](https://www.anthropic.com/research/global-workspace).

![A robot pauses to inspect a small internal signal before answering](./05-ai-self-check.webp)

Maybe we will discover that larger LLMs spontaneously start to have "feelings" about things, or maybe they already do and it's just hidden in the weights?

We really are living in one of the most interesting times in human history.
