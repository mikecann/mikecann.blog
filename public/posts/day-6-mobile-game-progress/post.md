---
coverImage: /images/fallback-post-header.png
date: "2012-07-08T12:12:42.000Z"
tags:
  - draw
  - game
  - gpu
  - hamster
  - haxe
  - mobile
  - nme
  - space
  - tile
title: Day 6 - Mobile Game Progress
oldUrl: /mr-nibbles/day-6-mobile-game-progress
openAIMikesBlogFileId: file-KFt7AUQDJgkJ514GY9HLYb3d
---

<object id="test1" width="650" height="400" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="https://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"><param name="src" value="https://www.mikecann.blog/wp-content/uploads/2012/07/Main1.swf" /><param name="pluginspage" value="https://www.adobe.com/go/getflashplayer" /><embed id="test1" width="650" height="400" type="application/x-shockwave-flash" src="/wp-content/uploads/2012/07/Main1.swf" pluginspage="https://www.adobe.com/go/getflashplayer" /></object>

Its been a few more days now and quite a bit of progress has been made so I thought I would update. First, have a go at the game in its current form above (use the keyboard to control).

<!-- more -->

Since last time I have concentrated on the parts I was less technically confident about such as the correct rendering method of animated sprites and how I was going to handle the rotation of the world.

First I tackled rendering. In my previous update the tiles in the world rendered simply by drawing vector squares to Sprite.graphics, then shifting their container to move them. When I tried to run this on an actual mobile device however the performance was extremely poor, less than 1FPS. The reason for this was because drawing vectors on mobile devices doesn't really fit well into their GPU-orientated graphics pipeline. To get decent frame rates on mobile I needed to find a way to take advantage of the mobile GPU.

Fortunately for me those clever guys who wrote NME were way ahead of me and developed the "[Tilesheet.drawTiles()](https://code.google.com/p/nekonme/source/browse/trunk/nme/display/Tilesheet.hx?r=1600)" API:

```

extern class Tilesheet
{
	static var TILE_SCALE:Int;
	static var TILE_ROTATION:Int;
	static var TILE_RGB:Int;
	static var TILE_ALPHA:Int;
	static var TILE_TRANS_2x2:Int;

	static var TILE_BLEND_NORMAL:Int;
	static var TILE_BLEND_ADD:Int;

	function new(inImage:BitmapData):Void;
	function addTileRect(rectangle:Rectangle, centerPoint:Point = null):Void;

	/**
	 * Fast method to draw a batch of tiles using a Tilesheet
	 *
	 * The input array accepts the x, y and tile ID for each tile you wish to draw.
	 * For example, an array of [ 0, 0, 0, 10, 10, 1 ] would draw tile 0 to (0, 0) and
	 * tile 1 to (10, 10)
	 *
	 * You can also set flags for TILE_SCALE, TILE_ROTATION, TILE_RGB and
	 * TILE_ALPHA.
	 *
	 * Depending on which flags are active, this is the full order of the array:
	 *
	 * [ x, y, tile ID, scale, rotation, red, green, blue, alpha, x, y ... ]
	 *
	 * @param	graphics		The nme.display.Graphics object to use for drawing
	 * @param	tileData		An array of all position, ID and optional values for use in drawing
	 * @param	smooth		(Optional) Whether drawn tiles should be smoothed (Default: false)
	 * @param	flags		(Optional) Flags to enable scale, rotation, RGB and/or alpha when drawing (Default: 0)
	 */
	function drawTiles (graphics:Graphics, tileData:Array<Float>, smooth:Bool = false, flags:Int = 0):Void;
}

```

With it you pass an array of tile data with a number of optional properties such as Rotation, Alpha and Scale. It then does the heavy lifting behind the scenes of building a vertex buffer and sending it to the GPU for rendering with your Tilesheet texture. This results in two big wins for performance; 1) you can render a great many sprites on the GPU in the same render, 2) you dont perform any expensive texture switches if all your sprites are on the same texture.

As for the tilesheet itself. At first I was planning on using a manual method of putting the sprites onto the tilesheet such that each sprite was the same size and we arranged in a very simplistic "one row per animation" fashion:

[![](https://www.mikecann.blog/wp-content/uploads/2012/07/t1.jpg "t1")](https://www.mikecann.blog/wp-content/uploads/2012/07/t1.jpg)

The problem with this however was that it was going to be a fairly inefficient way of organising the assets and it was going to be tricky for Moh (the artist) to build these animations frame by frame and put them on there while keeping them looking good.

Fortunately for me this problem has already been encountered by those before me. Philippe Elsass (of Flash Develop fame) has written a library called [TileLayer](https://github.com/elsassph/nme-tilelayer) that solves two problems. Firstly it abstracts out the some of the hard work of using the low-level drawTiles() API into a more friendly parent-child-like syntax which should be very familiar to any flash developer. Secondly it provides a parser for "Sparrow" spritesheets.

[Sparrow](https://gamua.com/sparrow/) is a library for game development in pure Objective-C. Part of that library is a method for loading tightly packed, animated spritesheets. These spritesheets can be generated by a number of tools but the best one I found was [Texture Packer](https://www.codeandweb.com/) (by <del>Lee Brimelow</del> Andreas Löw):

[![](https://www.mikecann.blog/wp-content/uploads/2012/07/t2.jpg "t2")](https://www.mikecann.blog/wp-content/uploads/2012/07/t2.jpg)

Using the tool you can take a number of input's such as SWFs or other images and output a compact spritesheet and an XML document containing the data NME will use to render the sprites on the screen.

One problem I encountered with using Texture Packer with SWFs however was that for it to work you must do all your animating on the timeline, it wasn't smart enough to populate named sprites from the library. Another thing to remember is that you must arrange your animations from the top left of the stage. If you put the animation in the middle of the stage it will be offset when it is rendered in the game. Not big problems but it did cause some head-scratching for a while before I realised what was going on.

With my sprites now loading and animating correctly in flash I decided to have a go at getting the game to run on mobile devices. Thanks to the way NME works it was a pretty simple process to generate a template project "nme update application.nmml ios" then run the generated xcode project file. And it runs! The only problems was that the frame rate was around 15FPS on my iPhone 4, which was far lower than I was hoping for.

So I started thinking about what could be causing a slow down. In flash when you try to render objects that are off-screen, flash automatically works out if it needs to be rendered and if not then it skips the render and hence improves the performance. I had a suspicion that Tilelayer / NME couldnt perform this operation so all the tiles that weren't on the screen were being unnecessarily drawn to an off-screen buffer and hence lowering the performance.

Because in this game the player is always in the centre of the screen I knew that a crude way to calculate whether a tile was on screen was to simply check the distance of the tile from the player, if it was greater than the width + height of the screen (because the world rotates) then I knew it would be off-screen and thus didn't need to be rendered:

[![](https://www.mikecann.blog/wp-content/uploads/2012/07/t3.jpg "t3")](https://www.mikecann.blog/wp-content/uploads/2012/07/t3.jpg)

As suspected this had a marked improvement in FPS, the game was now running on my iPhone at about 30FPS. An improvement but still short of what I was hoping for.

After some more experimentation I discovered another problem. In the code for checking whether to render a tile or not I was doing the following:

```

public function update(delta:Int) : Void
{
	var dx = x - game.player.x;
	var dy = y - game.player.y;
	visible = animated = (dx * dx) + (dy * dy) < game.root.stage.stageWidth * game.root.stage.stageHeight;
}

```

The problem is that apparently the call to "stage.stageWidth" and "stage.stageHeight" is very expensive. I presume behind the scenes NME is making an expensive call to the device for width and height information.

Once I took out those calls (cacheing them in the game object instead) and tested it again on the device the FPS was now up to more what I was hoping for at 60FPS :)

The final technical hurdle was to rotate the world. I was worried about this one as I was contemplating all the mathematical calculations that would be needed to work out the rotation for each tile in the game. Fortunately however there was a better solution. Because NME is based on the flash API I was able to put the world within a container Sprite, then offset the container by the player's position - screenH/2 and screenW/2 then rotate the container thus giving the illusion of the world rotating.

To my relief this idea actually worked and even more incredibly it didn't seem to affect the frame rate! See the video below of it running one my iPhone 4, iPad 3 and my old iPhone 3G.

<iframe src="https://www.youtube.com/embed/B22hShTZicY" frameborder="0" width="650" height="366"></iframe>

The 3G will need some more work to make it run at acceptable framerates, but im impressed it even runs on that thing, you cant do this with Adobe's Stage3D!

Well that enough of me talking about this for now, I need to get on with making the damn thing! Next up is some more game-play elements and perhaps some menu structure.
