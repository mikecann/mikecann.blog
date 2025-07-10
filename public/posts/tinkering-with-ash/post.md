---
coverImage: /images/fallback-post-header.png
date: "2013-02-14T18:30:55.000Z"
tags:
  - as3
  - ash
  - code
  - component
  - entity
  - flash
  - framework
title: Tinkering With Ash
oldUrl: /actionscript/tinkering-with-ash
---

[Last October](/posts/try-harder-2012-slides/) I was fortunate enough to attend the excellent [Try Harder](https://www.tryharder.org.uk/) conference for the second time.[ I have spoken before](/posts/try-harder-2012/) about how inspirational the event is where every attendant must give a talk on something they are passionate about. One of the talks was by David Wagner's and was on 'The Value of Tinkering' and it inspired me to[ tinker with TypeScript](/posts/tinkering-with-typescript/) which led to my [Recursive Chrome Extension](/posts/personal-project/recursive/).

<!-- more -->

Before I go anyÂ furtherÂ I should mention that there is a [Try Harder 'Level Up'](https://www.tryharder.org.uk/level-up-2013/) session taking place in April that is open to newÂ attendees, I thoroughlyÂ recommendÂ you check it out!

Following on in the same 'Tinkering' vein I have decided to investigate an AS3 library by another Try Harder attendee [Richard Lord](https://www.richardlord.net/blog):

[![logo](https://www.mikecann.blog/wp-content/uploads/2013/02/logo.png)](/posts/tinkering-with-ash/attachment/logo-4/)

What is Ash? Well direct from the [Ash Website:](https://www.ashframework.org/)

> Ash is a high-performance entity system framework for game development.
>
> An entity system is a way to organise the code for a game that is efficient for both code execution and code management. It uses composition rather than inheritance for sharing features between game objects and uses a data-oriented approach to separate the game state from the game logic. This makes it much easier to manage the code and to manage the game state.
> Im not going to go into the details too much of why composition over inheritance is a good idea as Richard has already done a much better job than I ever could in these two posts:

- [What is an entity system framework for game development?](https://www.richardlord.net/blog/what-is-an-entity-framework)
- [Why use an entity system framework for game development?](https://www.richardlord.net/blog/why-use-an-entity-framework)
  If youÂ haven't got a clue what im talking about when I say Entity or Component I stronglyÂ recommendÂ checking out his posts first.

The reason why Ash has piqued my interest is because for the last three years I have been working with Entity-Component systems for games but in a totally different way. The way I have been using and developing started with the Push Button Engine (PBE) method and later expanded out to include Dependency Injection culminating in the [Swft Framework](/posts/swft-dependency-injection-component-based-game-framework/).

Ill give one example of why am starting to fall in love with Ash:

In PBE and Swft the components contain data and functions. They can also declare dependencies (via [Inject]) which are automatically fulfilled when a component is added to an Entity. The functions in the component are able to act onÂ theirÂ own data, other components andÂ interactÂ with the game as a whole.

One problem with this method is that components are largely tied to their entity and once attachedÂ aren'tÂ really free be removed or added. The reason is because other component may have dependencies that depend on that component being part of the Entity. Removing the component will cause the game to crash. This becomes a problem when you want to enable a certain chunk ofÂ functionalityÂ for a certain time then disable it, what you tend to end up doing is adding the component at Entity creation time then inside of it toggling its behaviour with a boolean.

In Ash components are pure data with the bulk of the functionality being contained within systems. Sure you can have functions in a component but they **only act on their own data**. There are no hard dependencies between components. What this means is that components are much more free to be added and removed from Entities. So how do component function together then? WellÂ that'sÂ where Systems come in.

Systems are classes that contain the logic that makes up your game. When added to the engine they grab one or many lists of Nodes. A Node simply defines a collection of components that must exist on an Entity. In effect it declares the dependencies that this System needs to operate. What's neat about this is that this list of nodes is constantly changing as components are added and removed from entities. The Ash Engine manages this all for you so all the system need do is iterate over the linked list of Nodes each frame and execute its logic.

Systems also must not declare dependencies between each other. This rule means youÂ don'tÂ end up with large dependencyÂ hierarchies between Systems. This frees up systems to be added and removed from the Engine with no side effects! This is rather remarkable as it lets you do crazy things that youÂ couldn'tÂ normally do when there are many dependencies between systems. For example your game could have a Blitting based rendering system, then halfway through a running the game you could swap that out that System and replace it with a Starling based rendering System!

Thus far I have only spent a limited amount of time tinkering with Ash but I am having a whole lot of fun. I have started work on a little game to experiment around with the framework. At the same time I have been exploring [Starling](https://www.google.co.uk/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&ved=0CD8QFjAB&url=http%3A%2F%2Fgamua.com%2Fstarling%2F&ei=yiEdUazkL-uX0QWNz4EI&usg=AFQjCNHKL4BaeidkUlpmw48eBMwyhwG2tw&bvm=bv.42452523,d.d2k), the hardware accelerated 2D rendering framework built on Stage3D. Thus far I have produced this little map editor:

<object width="650" height="650" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="https://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"><param name="wmode" value="direct" /><param name="src" value="/projects/Mash/01/MashWeb.swf" /><param name="quality" value="high" /><param name="pluginspage" value="https://www.macromedia.com/go/getflashplayer" /><embed width="650" height="650" type="application/x-shockwave-flash" src="/projects/Mash/01/MashWeb.swf" wmode="direct" quality="high" pluginspage="https://www.macromedia.com/go/getflashplayer" /></object>
Click to place a block, shift and click to remove, scroll mouse to change block type and hold control and click to zoom in / out.

Its only a tech demo at the moment and as such hasnt got any game play elements. Im not entirely sure what to turn it into but as a platform for tinkering with Ash its been great.

Its too early to share the code at the moment but if you would like to see how some Ash code looks I strongly recommend you check out [Richard's Asteroids example on GitHub](https://github.com/richardlord/Asteroids). I was really quite taken aback by how neat and modular the code is. The example is provided in 4 different flavours, one using RobotLegs one with Starling one with SwiftSuspenders and one with no dependencies at all. The fact that the code still works and looks simple in all the examples really demonstrates theÂ versatilityÂ of the framework :)
