---
coverImage: /images/fallback-post-header.png
date: "2011-10-09T17:13:29.000Z"
tags:
  - flash
  - haxe
  - html5
  - nme
  - testing
title: "Conway's Game of Life in haXe [NME & MassiveUnit]"
oldUrl: /haxe/conways-game-of-life-in-haxe-nme-massiveunit
---

[![](https://www.mikecann.blog/wp-content/uploads/2011/10/2011-10-09_1257.png "2011-10-09_1257")](https://www.mikecann.blog/wp-content/uploads/2011/10/2011-10-09_1257.png)

The second day of [try{harder}](/posts/try-harder-my-haxe-slides-and-code/) was dedicated to a single topic; test driven development (TDD).

<!-- more -->

The group was split into pairs and given the task of using TDD to write a solver for the game of life in AS3\. After an hour we then threw away everything we had done, swapped partners and repeated the process.

This was extremely valuable for me as I had never written a unit test before. Seeing how different people tackled the same problem was fascinating and informative.

After repeating the process three times Stray asked if I was interested in teaming up with another attendee of the conference [Alec McEachran](https://www.google.co.uk/url?sa=t&source=web&cd=1&sqi=2&ved=0CBsQFjAA&url=http%3A%2F%2Falecmce.com%2F&ei=jZyRTp-fEcmAhQeIwtn0Dw&usg=AFQjCNEKPdue-giHnTp0HZCJwVWz3QeVoQ) to investigate unit testing in haXe. It was a great idea as it meant we both could investigate how unit testing worked in haXe and it would give me another code example for my talk the following day.

After a brief search we decided on Mike Stead's [MassiveUnit](https://github.com/massiveinteractive/MassiveUnit) for testing as the testing syntax looked similar to FlexUnit and it contained a toolchain for running the tests on multiple platforms.

An example of a test we wrote is:

```haxe
package ;
import massive.munit.Assert;
import Grid;

/**
 * ...
 * @author MikeC &amp; Alec McEachran
 */

class GridTest
{
	public var grid : Grid;

	@Before
	public function before():Void
	{
		grid = new Grid(3, 3);
	}

	@After
	public function after():Void
	{
		grid = null;
	}

	@Test
	public function initiallyThereAreNoLiveNeighbors():Void
	{
		var liveNeighbors = grid.getLiveNeighbors(1, 1);
		Assert.isTrue(liveNeighbors == 0);
	}

	@Test
	public function liveNeighborCountIsAccurate():Void
	{
		grid.set(0, 0, true);
		grid.set(1, 0, true);
		grid.set(2, 1, true);

		var liveNeighbors = grid.getLiveNeighbors(1, 1);
		Assert.isTrue(liveNeighbors == 3);
	}

}

```

It should look fairly familiar to anyone who has used FlexUnit before. The metatags @Before @After and @Test perform in exactly the same way as they do in FlexUnit. Another benefit of using munit over the built in testing framework in haXe is that you are given a tool to run tests on all platforms simultaneously:

```haxe
haxelib run munit test test.hxml

```

When executed you get something that looks like the following:

[![](https://www.mikecann.blog/wp-content/uploads/2011/10/ScreenHunter_01-Oct.-09-13.54.jpg "ScreenHunter_01 Oct. 09 13.54")](https://www.mikecann.blog/wp-content/uploads/2011/10/ScreenHunter_01-Oct.-09-13.54.jpg)

Which presents a nice graphical representation of the tests run and which failed (if any).

Once built and tested we decided to give the code a simple visual representation. We wanted to show off the ability for haXe to target multiple platforms. To do this we decided to go with [NME ](https://www.haxenme.org/)which I had been experimenting around with recently.

[NME ](https://www.haxenme.org/)is a library and tool chain for haXe designed to allow the developer to use the flash API on multiple platforms. They achieve this by writing platform targeted version of the flash API. So what this means is code such as the following:

```haxe

package ;
import flash.display.Bitmap;
import flash.display.BitmapData;
import flash.display.MovieClip;
import flash.geom.Rectangle;

/**
 * ...
 * @author MikeC &amp; Alec McEachran
 */

class Render
{

	private var _cellSize : Int;
	private var _renderTarget : BitmapData;
	private var _rect:Rectangle;

	public function new(container:MovieClip, cols:Int, rows:Int, cellSize:Int)
	{
		_cellSize = cellSize;
		_renderTarget = new BitmapData(cols * cellSize, rows * cellSize, false);
		container.addChild(new Bitmap(_renderTarget));

		_rect = new Rectangle(0, 0, _cellSize, _cellSize);
	}

	public inline function lock():Void
	{
		_renderTarget.lock();
		_renderTarget.fillRect(_renderTarget.rect, 0xff0000);
	}

	public inline function renderCell(x:Int, y:Int, isLive:Bool):Void
	{
		if (isLive)
		{
			_rect.x = x * _cellSize;
			_rect.y = y * _cellSize;
			_renderTarget.fillRect(_rect, 0);
		}
	}

	public inline function unlock():Void
	{
		_renderTarget.unlock();
	}

}

```

Will compile down to flash, c++ and Javascript! NME also includes packaging abilities for webos, android and ios. So with a few scripted command lines you can target most app marketplaces:

```

haxelib run nme test YourProject.nmml flash
haxelib run nme update YourProject.nmml ios
haxelib run nme test YourProject.nmml webos
haxelib run nme test YourProject.nmml android
haxelib run nme test YourProject.nmml cpp
haxelib run nme test YourProject.nmml cpp -64

```

What it means for this project is we could very quickly get a view for our game of life running in flash, JS and native desktop.

To show just how easy it is I made the following video:

<iframe width="853" height="480" src="https://www.youtube.com/embed/VNF2gH5o9Zs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"  allowfullscreen></iframe>

You can see the HTML5 build here: [/projects/gameoflife/Export/html5/bin/](/projects/gameoflife/Export/html5/bin/)

And the flash build here: [/projects/gameoflife/Export/flash/bin/MyApplication.swf](/projects/gameoflife/Export/flash/bin/MyApplication.swf)

I have uploaded the source for the project here: [/projects/gameoflife/gameoflife.zip](/projects/gameoflife/gameoflife.zip)
