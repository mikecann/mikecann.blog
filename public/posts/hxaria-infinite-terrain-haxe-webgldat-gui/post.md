---
coverImage: /images/fallback-post-header.png
date: "2011-11-26T14:19:40.000Z"
tags:
  - experiment
  - haxe
  - javascript
  - particles
  - terraria
  - tilemaps
title: "Hxaria, Infinite Terrain [HaXe, WebGL,dat.GUI]"
oldUrl: /glsl/hxaria-infinite-terrain-haxe-webgldat-gui
openAIMikesBlogFileId: file-iI647RpAtVCLLnL53uHRAA3I
---

So I have been working on my "[Terraria like Terrain](/posts/hxaria-terraria-like-terrain-in-haxe-and-webgl/)" project "Hxaria" again.

<!-- more -->

Following on from the last post, I have now made it so that each particle can have its texture changed. This completes the functionality required to render each tile as a point sprite, as talked about in my[ previous post](/posts/hxaria-terraria-like-terrain-in-haxe-and-webgl/).

The way it works is that the entire world is recorded in a 2x2 array Tilemap. This 2x2 array holds a single Tile object for every single tile in the world:

````actionscript3

class Tile
{
public var x : Int;
public var y : Int;
public var type : Int;

    public function new(x:Int, y:Int, type:Int) { this.x = x; this.y = y; this.type = type; }

}

[/code ]

&amp;nbsp;

When the TileRenderer needs to render it asks this Tilemap for a Tile that represents that screen coordinate, the Tilemap then offsets the position due to the camera movement and returns a tile. So it looks something like:

<a href="/wp-content/uploads/2011/11/tm.png"><img class="alignnone size-full wp-image-1795" title="tm" src="/wp-content/uploads/2011/11/tm.png" alt="" width="600" height="357" /></a>

The tile type is then passed to the shader in attribute buffers per point sprite / tile along with all the tiles which are stored on a single texture:

<a href="/wp-content/uploads/2011/11/tilescompressed.png"><img class="alignnone size-full wp-image-1803" title="tilescompressed" src="/wp-content/uploads/2011/11/tilescompressed.png" alt="" width="256" height="352" /></a>

The shader then performs the neccessary calculations to work out what the UV coordinate in the texture. The Vertex Shader:

```glsl

uniform float amplitude;
uniform float tileSize;
uniform float texTilesWide;
uniform float texTilesHigh;
uniform float invTexTilesWide;
uniform float invTexTilesHigh;

attribute float size;
attribute vec3 customColor;
attribute float tileType;

varying vec3 vColor;
varying vec2 vTilePos;

void main()
{
vColor = customColor;

    float t = floor(tileType/texTilesWide);
    vTilePos = vec2(tileType-(t*texTilesWide), t); // +(.5/tileSize)

    gl_PointSize = size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}

[/code ]

&amp;nbsp;

And the Fragment Shader:

```glsl

uniform vec3 color;
uniform sampler2D texture;
uniform float invTexTilesWide;
uniform float invTexTilesHigh;

varying vec3 vColor;
varying vec2 vTilePos;

void main()
{
vec2 uv = vec2( gl_PointCoord.x*invTexTilesWide + invTexTilesWide*vTilePos.x, gl_PointCoord.y*invTexTilesHigh + invTexTilesHigh*vTilePos.y);

    gl_FragColor = texture2D( texture, uv );

}

````

So it works in a way very much like a raster engine. You only have to render as many particles as the screen can contain.

If the screen area moves beyond the extent of the Tilemap then more tiles are randomly generated:

[![](https://www.mikecann.blog/wp-content/uploads/2011/11/22222.png "22222")](https://www.mikecann.blog/wp-content/uploads/2011/11/22222.png)

The new tiles are randomly selected from 4 different types, Dirt, Gold, Diamonds and Rock. I have added some controls to the demo that allow you to tweak these values to demonstrate the random tile generation:

[![](https://www.mikecann.blog/wp-content/uploads/2011/11/Shot_041.png "Shot_04")](https://www.mikecann.blog/wp-content/uploads/2011/11/Shot_041.png)

The UI may look familiar to people that have seen any experiments anyone who has worked with Three.js before, its the very popular [dat.GUI](https://code.google.com/p/dat-gui/). Its a really simple library written in javascript for creating controls that can be used to tweak experiments, perfect for me!

To get dat.GUI to work with haxe, I used the awesome [Extern feature of HaXe](https://www.google.co.uk/url?sa=t&rct=j&q=haxe%20externs&source=web&cd=1&ved=0CBwQFjAA&url=http%3A%2F%2Fhaxe.org%2Fdoc%2Fjs%2Fexterns&ei=Gu_QTvK8IYP4sgbo15TzDA&usg=AFQjCNEQvrXVfGjjQNO-yHhZ6HRTKlcmYw). This means that all I have to do is provide a stub interface to dat.GUI rather than a full implementation in haXe. This is great as it allows me to rapidly begin to use the library but also have the type safety of HaXe. It didnt take long to stub out the bits of the library I needed in an extern:

`actionscript3`

package dat;

/\*\*

- ...
- @author Mike Cann
  \*/

extern class GUI
{

    public function new(options:Dynamic) : Void;
    public function add(options:Dynamic, name:String) : GUI;
    public function name(value:String) : GUI;
    public function min(value:Float) : GUI;
    public function max(value:Float) : GUI;
    public function step(value:Float) : GUI;
    public function onFinishChange(f:Void -> Void) : GUI;
    public function listen() : GUI;

}

[/code ]

Then I used it like:

`actionscript3`

package ;
import dat.GUI;

/\*\*

- ...
- @author
  \*/

class GUIManager
{
public var goldChance : Float;
public var rockChance : Float;
public var diamondsChance : Float;
public var mapWidth : Int;
public var mapHeight : Int;

    private var gui : GUI;
    private var game : Game;

    public function new(game:Game)
    {
    	this.game = game;

    	gui = new GUI( { height : 5 * 32 - 1 } );

    	goldChance = game.tilemap.goldSpawnChance;
    	rockChance = game.tilemap.rockSpawnChance;
    	diamondsChance = game.tilemap.diamondsSpawnChance;
    	game.tilemap.mapResized = onTilemapResized;
    	mapWidth = 0;
    	mapHeight = 0;

    	gui.add(this, 'goldChance').name("Gold").min(0).max(1).step(0.001).onFinishChange(function() { game.tilemap.goldSpawnChance = goldChance; } );
    	gui.add(this, 'rockChance').name("Rock").min(0).max(1).step(0.001).onFinishChange(function() { game.tilemap.rockSpawnChance = rockChance; } );
    	gui.add(this, 'diamondsChance').name("Diamond").min(0).max(1).step(0.001).onFinishChange(function() { game.tilemap.diamondsSpawnChance = diamondsChance; } );
    	gui.add(this, 'mapWidth').listen();
    	gui.add(this, 'mapHeight').listen();
    }

    private function onTilemapResized(mapW:Int, mapH:Int):Void
    {
    	mapWidth = mapW;
    	mapHeight = mapH;
    }

}

[/code ]

Simples!

Anyways you can check the final result out on this page: [/projects/hxaria/02/
](/projects/hxaria/02/)(Click and drag to move the camera about)

I have also uploaded a quick video too:

<iframe width="650" height="471" src="https://www.youtube.com/embed/Hw1bntVoNmU?hd=1" frameborder="0" allowfullscreen></iframe>

I have also uploaded the source again to my github page: [https://github.com/mikecann/Hxaria](https://github.com/mikecann/Hxaria)
(I have also created a tag, incase the source changes in the future)

Next up, lighting!
