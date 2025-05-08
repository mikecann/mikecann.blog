---
coverImage: /posts/unity-ashteroids-ash-framework-in-unity/cover.jpg
date: '2014-07-08T10:49:01.000Z'
tags:
  - ash
  - asteroids
  - framwork
  - game
  - programming
  - unity
title: Unity Ashteroids - Ash Game Framework in Unity
oldUrl: /unityasteroids/unity-ashteroids-ash-framework-in-unity
openAIMikesBlogFileId: file-NK5pS5718CdmJZi0VXDWy4wg
---

I decided to take a break from the [game development](https://www.mikecann.blog/myprojects/mr-nibbles-3d/mr-nibbles-3d-menus-obscuring/) today to scratch an itch I had had for a while.

<!-- more -->

Its no secret that im a fan of Entity-Component systems having used various flavours of them for years. My particular favourite however is found in [Richard Lord's Ash Framework](https://www.ashframework.org/). I have used it on numerous projects including my [3-game prototype challenge](/posts/the-three-game-challenge/).

<!--more-->

Ash Framework however is written for the Flash platform. Though there are ports for other platforms, no one has yet done one for Unity. It gets talked about on the [Ash mailing list](https://groups.google.com/group/ash-framework?hl=en) every now and then but often dismissed as either impossible or pointless as Unity already has an Entity framework built into it.

Well after a [recent discussion](https://groups.google.com/forum/?hl=en#!topic/ash-framework/NrC5dQyBRkY) I decided I wanted to have a go at it anyway. It turns out its actually not that hard to implement.

Starting off with [David Arno's .Net port of Ash](https://github.com/DavidArno/Ash.NET) I wrote two small classes that wrap the [Ash Engine](https://github.com/mikecann/UnityAshteroids/blob/master/Assets/Ash/Unity/AshGame.cs) and [Ash Entity](https://github.com/mikecann/UnityAshteroids/blob/master/Assets/Ash/Unity/AshEntity.cs).

Ash Entity is the key piece to the puzzle. You add it as a component to your game object:

![screenshot_003](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_003.png)

It then checks to see which Unity components have been added or removed each frame and updates the Ash Entity reference. Its simple but it works! It even includes the default Unity Components so that means you don't need a base "AshComponent".

The AshEngine serves as the root of the hierarchy. So long as you place entities below it they will be able to find the engine. This makes it really easy and convenient to create scenes at design time and have them work when you hit play:

![screenshot_005](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_005.png)

From that simple foundation I decided to have a go at porting the entire of Richard's Asteroids example over to Unity. I was surprised at how little issues I ran into. You can give it a play here:

[/projects/UnityAshteroids/UnityAshteroids.html](/projects/UnityAshteroids/UnityAshteroids.html)
**Use arrow keys to move and space to shoot.**

It all works surprisingly well. [The code](https://github.com/mikecann/UnityAshteroids) is really clean and very simmilar to the original.

The only changes I needed to make from the .Net port was to change some "internals" to "public" and changed the type of the update variable from double to float as Unity uses floats for everything not doubles.

Instead of manually defining the components in "EntityCreator" I use Unity's prefab system which makes it really nice and easy to edit properties in the inspector in the editor:

[![screenshot_004](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_004-1024x685.png)](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_004.png)

Then load them the usual Unity way using Resources.Load().

Systems are just pure code and added to the Engine as usual:

[code lang="csharp"]
public class Asteroids : AshGame
{
private EntityCreator creator;
private GameConfig config;

    void Awake()
    {
    	creator = new EntityCreator(this);
    	config = new GameConfig();

    	var size = Camera.main.ScreenToWorldPoint(new Vector2(Screen.width, Screen.height));
    	config.Bounds = new Bounds(Vector3.zero, new Vector3(size.x*2, size.y*2));

    	Engine.AddSystem(new WaitForStartSystem(creator), SystemPriorities.PreUpdate);
    	Engine.AddSystem(new GameManagerSystem(creator, config), SystemPriorities.PreUpdate);
    	Engine.AddSystem(new MotionControlSystem(), SystemPriorities.Update);
    	Engine.AddSystem(new GunControlSystem(creator), SystemPriorities.Update);
    	Engine.AddSystem(new BulletAgeSystem(creator), SystemPriorities.Update);
    	Engine.AddSystem(new DeathThroesSystem(creator), SystemPriorities.Update);
    	Engine.AddSystem(new MovementSystem(config), SystemPriorities.Move);
    	Engine.AddSystem(new CollisionSystem(creator), SystemPriorities.ResolveCollisions);
    	Engine.AddSystem(new HudSystem(), SystemPriorities.Animate);
    	Engine.AddSystem(new AudioSystem(), SystemPriorities.Render);

    	creator.CreateWaitForClick();
    	creator.CreateGame();
    }

}  
[/code]

The changes to the Asteroids code in general are minimal. I use Unity's components wherever possible, so things like Position and Movement become Transform and Rigidbody2D. Rendering is taken care of by Unity so I didn't need any RenderingSystem or Display component.

The code is available on GitHub for your perusal: [https://github.com/mikecann/UnityAshteroids](https://github.com/mikecann/UnityAshteroids)

I was actually surprised I was able to get this all working without any problems. There are improvements that could be made:

## Performance of AshEntity

AshEntity is the core to the whole thing and unfortunately it probably isn't the most performant. For each entity in the game it checks every frame to see if any components were added or removed. It doesn't do this in the best possible way so there is definitely room to improve this.

## Sugar

There is plenty of room for syntax sugar thanks to the superior C# language over Actionscript 3\. NodeList could be made generic and a generic ListIteratingSystem could be developed and perhaps even a way of eliminating nodes altogether. Also retrieving components from Ash Entity could be made simpler by removing the need to pass in the type param when calling Entity.Get<>().

## Finite State Machines

As the .Net port does not include Richard's FSM code I worked around the problem by destroying and creating new prefabs. This works quite well as it allows you to use the inspector to visually design the prefabs however a nice addition would be some editor tools and code for FSMs in Unity.

## Unit Tests

I copied over the .Net tests from David's port and got them running in unity using Unity Test tools without any problems however my Ash Unity code isn't tested. There isn't much of it but it probably should be covered.
