---
coverImage: /images/fallback-post-header.png
date: "2012-07-16T18:59:31.000Z"
tags:
  - flash
  - haxe
  - ios
  - mobile
  - nme
  - project
title: 2-Weeks In.. Mobile Game Progress Report
oldUrl: /games/2-weeks-in-mobile-game-progress-report
---

<object id="test1" width="650" height="400" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="https://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"><param name="src" value="https://www.mikecann.blog/wp-content/uploads/2012/07/Main3.swf" /><param name="pluginspage" value="https://www.adobe.com/go/getflashplayer" /><embed id="test1" width="650" height="400" type="application/x-shockwave-flash" src="/wp-content/uploads/2012/07/Main3.swf" pluginspage="https://www.adobe.com/go/getflashplayer" /></object>

I'm now two weeks into my original 3-week-deadline mobile game project. You can checkout the progress thus far by playing the game above ('up' to jump, 'left' and 'right' to control the player).

<!-- more -->

As you can see there has been some progress since my last update a week ago. I was hoping to have gotten a little further by this point but my personal life has been somewhat hectic the past week reducing the amount of game-development time to a few measly hours. In the few hours we have had, we have managed to get a general story / theme for the game and the rudiments of for the first 'stage'.

So the story is that our furry marsupial protagonist has ambitions of breaking free of his earth-bound cage to become the first hamster in space. The game is about his adventure to realise this dream.

The plan is to break the game levels in into 'stages' like other mobile puzzle games such as cut the rope or angry birds:

[![](https://www.mikecann.blog/wp-content/uploads/2012/07/angry-birds-gets-45-new-levels.jpg "angry birds gets 45 new levels")](https://www.mikecann.blog/wp-content/uploads/2012/07/angry-birds-gets-45-new-levels.jpg)[ ![](https://www.mikecann.blog/wp-content/uploads/2012/07/519464-cut-the-rope-ipad-screenshot-pick-level-set-from-the-boxess.png "519464-cut-the-rope-ipad-screenshot-pick-level-set-from-the-boxess")](https://www.mikecann.blog/wp-content/uploads/2012/07/519464-cut-the-rope-ipad-screenshot-pick-level-set-from-the-boxess.png)

Each stage will have its own theme, giving the player a refreshed experience per stage. The first of these is going to be set within the cage itself so the tileset and background should hopefully represent that.

The bulk of my work this week however has been spent trying to get the game controls working just right. It needs to be fun to play, not too frustrating but not too easy. This is easier said than done. Im not sure its quite there yet, but play the game above and let me know what you think, im keen to hear your opinion.

During the last week I also ran into a few nasty issues with the physics which I thought I had nailed in the previous post. The problem was that the issue only occurs at low frame rates, this was really noticeable in the last post when I tried the game out on my iPhone 3G, the player was extremely jerky and unplayable.

To test the problem quickly (without needing to do an iPhone build every time) I used the handy "fps" attribute in the NME .nmml file. Setting the fps to 60 then having the player jump then setting the fps to 10 and having the player do the same jump there was a noticeable problem. On the 10fps build the player couldn't jump anywhere nearly as high as in the 60fps build.

I knew that the reason for this problem lay somewhere in my update function in my Player class. My usual method of running update loops is to work out the time between two frames (delta) in milliseconds, pass that into the update loop for a game object then have the game modulate its update based on that delta. So as a very simple example:

```

class Player
{
	public var position : Vector2;
	public var velocity : Vector2;

	...

	public function update(delta:Int)
	{
		position.x += velocity.x * delta;
		position.y += velocity.y * delta;
	}

	...

}

```

This is pretty standard stuff and should be familiar to any game programmer. In theory it shouldn't matter what frame rate the game is running at, the player movement should be consistent because the velocity is being modulated by the time between the previous frame and now.

The code for the Player class however is quite abit more complicated than the simple example given above and something in the logic was causing problems. I had my suspicions but no matter what I tweaked or changed I couldn't track it down.

I had however read of a different technique [documented by deWiTTERS](https://www.koonsolo.com/news/dewitters-gameloop/) that involved a different way of writing your game loop that didnt take into account of frame delta but was still able to provide a consistent gameplay at differing framerates.

I wont detail the process here as dewitter explains it very well in his post. The result is a greatly simplified update loop for my Player by removing all the delta time factors. My resulting update loop now looks like:

```

class Game
{
	public static var TICKS_PER_SECOND : Float = 50;
    public static var SKIP_TICKS : Float = 1000 / TICKS_PER_SECOND;
    public static var MAX_FRAMESKIP : Float = 10;

	...

	private function onEnterFrame(e:Event):Void
	{
		var loops : Int = 0;
        while( Lib.getTimer() > nextFrameTime && loops < MAX_FRAMESKIP) {
            update();
            nextFrameTime += SKIP_TICKS;
            loops++;
        }
        render();
	}

	private function update()
	{
		Ctrl.instance.update();
		objects.update();
		camera.update();
		bg.update();
	}

	private function render()
	{
		tiles.render();
	}

	...

}

```

The result of doing this is that the game now runs consistently at 60fps or 10fps. I haven't tried it out on my 3G yet but I have high hopes for the technique.

The moral of that story, if you bang your head against a problem for a while, just take a breath, think outside the box and attack it from a different angle ;)

Well that's about it for this week. The original intention was that is was going to be my last week of working on this game. (Un)fortunately my artist partner has gone on holiday this week so he is unable to work on the game, the result being I have given us an extra week to complete the game, yey! :)

Oh BTW, the title for the game is hidden in the demo above, see if you can work out what it is ;)
