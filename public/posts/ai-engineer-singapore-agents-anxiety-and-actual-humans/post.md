---
coverImage: ./header.webp
date: '2026-05-19T06:31:40.000Z'
tags:
  - ai
  - convex
  - personal
  - conference
status: draft
title: 'AI Engineer Singapore: agents, anxiety, and actual humans'
---

I currently sat on a bus on my way back from AI Engineer Singapore, mostly to run a 90-minute Convex workshop and partly to find out whether I could handle doing that sort of thing without completely falling apart.

AI Engineer is probably the biggest conference right now for software engineers building with AI. Not machine learning researchers, although there were plenty of technical people there, but software engineers, founders, devtools people, agent people, infra people, and everyone else trying to work out what building software looks like now.

I was there because of a slightly funny chain of events. Last year I gave a 15-minute online workshop for a Cursor hackathon. Apparently it went down well enough that Wayne, our head of events at Convex, built a relationship with the organisers, and when they decided to run AI Engineer in Singapore I was invited to give a proper workshop.

A 90-minute workshop. In person. In Singapore.

This was quite a big step up for me. I had messaged Matt Pocock beforehand asking for advice, because I had seen him run a very good workshop at a previous AI Engineer event in Europe. One thing he said was that speaking often gets easier when you can look back and say, "I've done bigger things than this before."

The problem was that I hadn't really done anything bigger than this before.

So I went into the week wanting to prove to myself that I could step up into a bigger room, carry a bigger talk, and have something useful to say. I wanted this to become one of those reference points. Something I could point to next time and say: I have done this before. This is not going to kill me.

# Convex + AI

The workshop was called "Convex + AI: Everything You Need to Know".

The idea was to start from nothing and end with a hosted AI application, while being honest about how people actually build now. I didn't want to stand on stage and pretend everyone is still carefully hand-writing every line of code. People are using Cursor, Claude, agents, copy-paste, vibes, panic, all of it.

So the workshop was about how Convex fits into that world: the fundamentals, the guardrails, and the patterns that make AI-assisted app development less likely to wander into a ditch.

Convex is a good fit for this, I think, because AI-generated apps need more than a call to an LLM API. They need state. They need workflows. They need persistence, auth, background work, realtime updates, and all the boring-but-essential application stuff around the model. Convex gives you a lot of that structure, and the structure matters even more when you are building with AI.

![The AI Engineer Singapore workshop room from the front](./workshop-room.webp)

About fifteen minutes in, the ditch arrived.

The first hands-on step of the workshop was for everyone to create a new Convex project. Very basic. Very reasonable. Exactly the sort of thing you want to work in the first part of a live workshop.

It failed.

Not just for one person. The setup flow was broken.

I was standing in a seminar room with close to 100 people watching me, many of whom had paid hundreds of dollars to be there, and the thing I needed them all to do had stopped working. I was already nervous before the workshop started. There is a specific kind of helplessness that comes from being on stage, needing to debug something in real time, while also being painfully aware that the entire room is watching you think.

It turned out that Convex 1.39 had shipped about seven hours before my talk and included a critical bug that broke the workflow I was trying to teach.

Good timing, really. Very funny. In the way that being attacked by a swan is probably funny to everyone except the person being attacked.

Fortunately, an audience member helped identify that it was a version issue. Even more fortunately, I had rehearsed the workshop several times and had a backup project from before the broken release. I was able to switch over, route around the problem, and keep going.

![Presenting the Convex + AI workshop](./workshop-slides.webp)

I don't know how many people were able to follow along cleanly after that. Some did. Some may have used agents to work around it. Some probably just watched. That part still bothers me a bit, because a workshop is supposed to be something people can do, not just observe.

But the rest of the session went well. Better than I expected, given the start.

The preparation saved me. Not in the sense that preparation prevents things from going wrong. That is obviously nonsense. Things go wrong because computers are cursed and live demos are where the curse likes to stretch its legs. Preparation saved me because when something did go wrong, I had somewhere to stand.

I also built a small questions platform for the workshop, so people could ask questions as we went. That worked really well. The questions were good, and breaking up the prepared content gave both me and the audience a bit of breathing room. A 90-minute workshop is a long time to talk at people. Even if they are interested, concentration is not infinite.

Afterwards, a few people came up to ask more questions and say nice things. That helped.

![The Convex + AI workshop crew after the session](./convex-ai-group.webp)

# The strange reality of content impact

One of the most surprising things during the week was how many people recognised me from the 15-minute Cursor hackathon workshop the year before.

That workshop had felt small to me. Just one of those things you do, hope it is useful, and then move on from.

But people remembered it. They had taken value from it. Some recognised my face during the Convex event on Wednesday. Others mentioned it throughout the week.

This changed how I think about the videos and workshops I make.

When I look at YouTube numbers, a few thousand views can feel small. Five thousand people watching a technical video does not always feel like a lot, especially compared with the scale of the internet and the ridiculous numbers other people seem to pull. But meeting actual humans who watched something, used it, remembered it, and maybe went on to build something with Convex because of it makes the impact feel much more real.

A few hundred or a few thousand of the right people is not nothing.

If the work is useful, it travels further than the number suggests. People build with it. They tell other people. They form an opinion about Convex, and about me, based on whether the thing helped them.

That is both encouraging and slightly terrifying. It means the work matters. It also means it is worth doing properly.

# AI Engineer as a scene

The actual conference started properly on Friday and ran through the weekend. The format was quite different to some other conferences I have been to. Most talks were short, around 10 or 15 minutes, and there were a lot of them.

![The AI Engineer Singapore sponsor wall](./ai-engineer-sign.webp)

I liked not having to move between rooms constantly. There was one main theatre, so you could just sit down and let the conference come to you. The downside was that the topics jumped around a lot. You might get a design talk, then robotics, then coding, then agents, then something else entirely.

Some of the talks were excellent. Some did very little for me. I found myself on my phone or laptop more than I would have liked, which is probably a combination of conference fatigue, uneven talks, and the fact that I was still recovering from the workshop stress.

![A talk in the main AI Engineer Singapore theatre](./main-theatre.webp)

I don't think AI Engineer radically changed my perspective on AI. It did make me feel closer to the centre of the AI application-building world. Less like I was watching from the outside, more like Convex had a legitimate place in the conversation.

That felt good.

There is a lot of genuine energy in the AI devtools scene right now. There is also a lot of theatre. Sometimes those are the same thing.

![Robotics demos on the conference floor](./robot-demo.webp)

The best image of the week might have been Friday night, after the speaker and sponsor dinner, when we ended up in a packed club and I found myself sitting with someone showing off an agent setup on a laptop while music was blasting around us.

Laptops. In a nightclub.

Very normal. Very healthy. Exactly what the founders of nightlife intended but oddly felt natural given the current frenetic state of things.

![The Friday night conference crowd](./club-night.webp)

His setup was impressive tho. He could apparently spin up hundreds of agents and have them work on things together. But when I asked what they were actually working on, the answer seemed a bit more vague. They chose what they wanted to work on.

I found that both fascinating and slightly alarming.

My immediate questions were boring ones: how many tokens does that use, how do you keep the quality high, how do you stop churn, how do you know the work is useful, and how do you keep the product stable when there are that many agents doing things?

That is probably where I am with a lot of agent hype at the moment. I believe there is something real there. I use agents every day. I think they are changing how software gets made. But I am also suspicious of demos where the impressive part is the number of agents rather than the quality of the outcome.

More agents is not automatically better. Sometimes it is just a more expensive way to make a mess.

# The human interface layer

I am not naturally good at conferences.

I can talk about technology. I can talk about Convex. If someone recognises me or has seen my work, the conversation is much easier because there is already a shared starting point. But floating around a room full of people trying to work out when to introduce myself, how much to talk about Convex, whether I am shilling too hard, whether I am being too quiet, whether I should be somewhere else, is exhausting.

Wayne is much better at this than me.

Watching him work during the week gave me an even deeper appreciation for what he does. I already knew he put in a huge amount of effort, but seeing it in person confirmed how much of events is invisible relationship work. Knowing people. Introducing people. Remembering context. Moving between groups. Making sure Convex is present without making everything feel like a pitch.

He also gave me one piece of advice that stuck: you need to know when you have reached your limit.

On Saturday night there was a closing party that started at 10pm and was supposed to go until 3am. The theatre had been converted into a nightclub. After the Friday I had just had, I could have forced myself to go. Part of me felt like I should. Conferences create this weird fear that if you are not at every event, you are missing the one conversation that would have justified the whole trip.

But I was cooked.

So I skipped it and had some Mike time.

When I go to a new city, one of my favourite things to do is just pick somewhere on the map and walk. So I did that. I walked through Singapore listening to audiobooks and podcasts, decompressing after days of noise and people and talks and nerves. I ended up climbing a steep hill to a spot where I could see the cable car moving through the night, then took a Grab back to the hotel and went to bed.

![Cable cars over Singapore at dusk](./cable-car.webp)

It was exactly what I needed.

The next day Wayne told me the party had mostly fizzled out by midnight anyway, which made me feel much better about the decision. Sometimes the responsible choice is also the correct party analysis.

# Actual humans

There were a lot of status-coded rooms during the week.

Speaker dinners. Sponsor events. Rooftop drinks at Marina Bay Sands. A club table with a minimum spend that made me glad I was not personally responsible for the bill. People whose names I recognised from the internet. Founders, CTOs, investors, speakers, organisers.

Those environments are still strange to me. I did not grow up around that sort of thing, and I do not think I will ever be the person who glides through them effortlessly.

But something shifted after the workshop.

At the speaker dinner on Friday night I sat next to the CTO of Daytona and had a genuinely enjoyable conversation about family, entrepreneurship, travel, Silicon Valley, and technology. Normally, talking to someone I perceive as important can make me nervous. I worry about saying something stupid or exposing some gap in what I know.

![The speaker and sponsor dinner](./speaker-dinner.webp)

That night I did not feel that as much.

Maybe it was because I had already had a couple of drinks. Maybe it was because the workshop was finally done and the stress had left my body. But I think a bigger part of it was that I felt like I had earned my place in the room.

Not in some grand, dramatic way. Just quietly. I had done the thing I came to do. It had gone wrong, I had recovered, and people had still found value in it.

That makes it easier to talk to people as people.

And that was another thing the week reinforced. People are just people. Some are generous. Some are impressive. Some are arrogant. Some mostly want to talk and are not that interested in listening. Some are nerds with laptops in clubs. You do not have to be intimidated by all of them, and you do not have to prove yourself to all of them either.

Sometimes it is fine to let someone talk. Sometimes it is fine to listen. Sometimes it is fine to leave and go for a walk.

# Singapore

I liked Singapore.

I did not get to explore it as much as I might have liked, because the week was mostly conference events, side events, dinners, and trying not to collapse. But the parts I did see were beautiful and easy to move through.

The rooftop at Marina Bay Sands was ridiculous in the way famous city viewpoints are supposed to be ridiculous. Free drinks, beautiful views, me dressed slightly too formally and joking that I looked like a VC because I had a shirt on.

![At Marina Bay Sands with the Singapore skyline behind me](./marina-bay-selfie.webp)

The more memorable parts, though, were quieter. Walking through the city on Saturday night. Sitting outside with Wayne and a photographer/media person after an event had failed to be the thing we thought it was. Liz headed off at some point, and we ended up sitting on benches talking until we got kicked out around midnight. Wayne looked the most relaxed I had seen him all week.

That was lovely.

The official things are often not the best things. Sometimes the plan falls apart, and what is left is just a quiet conversation outside in a warm city after a long week.

![Gardens by the Bay after a long conference week](./gardens-by-the-bay.webp)

# Coming home

The next morning I woke up at eight, was out the door by 8:20, and got in a taxi to the airport. Then back to Perth. Then home.

I went to AI Engineer Singapore nervous that I was out of my depth. I came home still not magically transformed into a conference extrovert, but with proof that I can do this.

![Singapore at night from above Marina Bay](./singapore-skyline.webp)

I can step up into a bigger room. I can give a bigger workshop. I can survive the live demo goblins. I can talk to people I would previously have put on a pedestal and realise they are mostly just people with different jobs, different incentives, and occasionally laptops in nightclubs.

That is probably the thing I will carry into the next one. Not that the nerves disappear, but that I now have a bigger reference point.

I have done this before.
