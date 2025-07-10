---
coverImage: /images/fallback-post-header.png
date: '2007-05-09T11:09:35.000Z'
tags: []
title: Docking Nightmares
oldUrl: /c/docking-nightmares
---

![](https://www.mikecann.blog/Work/TDProject/engine04.png)

<!-- more -->

The tool has to be functional, elegant and fun. For that I wanted a special UI for it. I loved what the team had done over at [Blade3D ](https://www.blade3d.com/MediaGallery/tabid/74/Default.aspx)and i wanted something similar. Unfortunately they paid at least \$300 for thiers, and hence this wasnt realy an option for me just yet :P

So for now im stuck with an old 2005 style UI. To spice it up abit I decided to add docking panels. I had worked with docking panels before for my [ChainReaction ](https://www.mikecann.blog/?p=168)project in Java but hadnt done one in C# before. A quick search on sourceforge came up with [DockPanel Suite](https://sourceforge.net/projects/dockpanelsuite/).

It certainly wasn't as easy to pick up as when I did docking panels in Java, but I eventually got it. The toughest part which I still haven't sorted out 100% is rendering a XNA window into a docking panel. As XNA runs using a DirectX graphics device its very picky about loosing its rendering state. So if a user undocks the window and moves it about and then redocks it, it doesnt like it due to the loss of rendering state. For now the XNA window has been fixed so that it cant be undocked.

As you can see in the screenshot above I have added some visual properties to the BlueprintEditor so that you can affect how its rendered, its all working beautifully.

The next step is to get the blueprints being placed on the grid so that you can build the level.
