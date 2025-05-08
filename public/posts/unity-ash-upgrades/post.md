---
coverImage: /posts/unity-ash-upgrades/cover.jpg
date: '2014-12-10T11:25:41.000Z'
tags:
  - ash
  - asteroids
  - components
  - entity
title: Unity-Ash Upgrades
oldUrl: /c/unity-ash-upgrades
openAIMikesBlogFileId: file-5vjkMni5zWq9SFcbZe68zb6p
---

[A while back](https://www.mikecann.blog/portfolio/projects/unity-ashteroids-ash-framework-in-unity/) I decided to scratch an itch and see if [Richard Lord's Ash Entity Framework](https://www.ashframework.org/) could be ported to Unity. Well I was pleasantly surprised that it did port quite easily (with some help from David Arno's .NET port) and worked well enough that I could also port [Richard's Asteroids game over to Unity](https://github.com/mikecann/UnityAshteroids) too.

<!-- more -->

Since then I have had a few people contact me interested in using the port for their own projects so I decided to give it a little more love and polish.

## Part 1 - Separation

First things first was to split the Ash library from the Asteroids example project so you dont have to include the entire Asteroids port in every single one of your games (madness). So now the Unity Ash project can be found here:

[https://github.com/mikecann/Unity-Ash](https://github.com/mikecann/Unity-Ash)

..and the Asteroids project (which uses the Untity-Ash project) lives here:

[https://github.com/mikecann/UnityAshteroids](https://github.com/mikecann/UnityAshteroids)

Now all that you need to do to is to clone (or include as submodule) Unity-Ash into your game's Assets folder and you should be good to go, simples!

## Part 2 - GetComponents

Next up was performance. I knew that the performance of Unity-Ash was the biggest stumbling block and unfortunately it seemed like a fairly fundamental one thanks to some holes in the Unity API (more on that later). However, I knew there were a few low-hanging-performance-fruits I could pick that should speed up things a bit.

To experiment with things I setup a separate Unity project for the performance tests and included [Unity-Ash from GitHub](https://github.com/mikecann/Unity-Ash).

[![2014-12-10_09-30-51](https://www.mikecann.blog/wp-content/uploads/2014/12/2014-12-10_09-30-51-1024x618.png)](https://www.mikecann.blog/wp-content/uploads/2014/12/2014-12-10_09-30-51.png)

The key performance bottleneck in Unity-Ash is the way the code checks for component additions and removals. Dynamic component addition and removal is key to how Ash functions and in AS3 because it was all custom code we could just fire an event when a component is added or removed from an Entity. Because Unity-Ash tries to piggyback on top of Unity's existing Entity (GameObject) / Component architecture we dont actually have access to the GameObject source and thus cant trigger events when a component is added or removed.

The solution I came up with is to add a component to each GameObject which acts like the Entity. It is responsible for checking to see if components have been added or removed, to do this it gets a list of all the components in the GameObject each frame and compares against its internal cache to see if any have been added or removed. This solution works well, however you can probably see the performance hit involved with getting a list of components from Unity for each GameObject, each frame will likely be quite high.

Because this listing of components was so crucial to performance I decided to write some tests to see what is the fastest way of doing that:

```
public class GetComponentTests : MonoBehaviour
{
	public int iterations = 10000000;
	public int repeats = 3;

	public GameObject noComponents;
	public GameObject manyComponents;
	public List<Component> components;

	public void TestAll()
	{
		components = new List<Component>();
		TestHelpers.Execute(iterations, repeats, "Empty Function", TestEmpty);
		TestHelpers.Execute(iterations, repeats, "Get Components With No Components", NoComponentsGetComponents);
		TestHelpers.Execute(iterations, repeats, "Get Components With Many Components", ManyComponentsGetComponents);
		TestHelpers.Execute(iterations, repeats, "Get Components With No Components List", NoComponentsGetComponentsList);
		TestHelpers.Execute(iterations, repeats, "Get Components With Many Components List", ManyComponentsGetComponentsList);

		Debug.Log("components " + components.Count);
	}

	public void TestEmpty()
	{
	}

	public void NoComponentsGetComponents()
	{
		noComponents.GetComponents<Component>();
	}

	public void ManyComponentsGetComponents()
	{
		manyComponents.GetComponents<Component>();
	}

	public void NoComponentsGetComponentsList()
	{
		noComponents.GetComponents<Component>(components);
	}

	public void ManyComponentsGetComponentsList()
	{
		manyComponents.GetComponents<Component>(components);
	}
}
```

I run each of these 10 million times then repeat 3 times and average:

1. "TestEmpty" is my control test test to get a sense of the cost of simply calling an empty function. That averaged to 0ms elapsed
2. "NoComponentsGetComponents" I test getting a list of components when the GameObject is empty (other than Transform), that averaged to 22ms.
3. "ManyComponentsGetComponents" I test getting a list of components when there are 20 components (plus Transform) to see what the cost of getting additional components would be, that averaged to 35ms.
4. "NoComponentsGetComponentsList" is the same as 2) except I avoid an internal memory allocation my passing in a List to populate the return with, that averaged to 5ms.
5. "ManyComponentsGetComponentsList" is the same as 3) except I pass in the List again, that averaged to 15ms.

So in summary, I learned its much faster if I pass in a list to GetComponents, which makes sense as I avoid the memory allocation associated with returning a new array each time. As a result I folded this performance improvement into Unity-Ash.

## Part 3 - Unity vs Ash

These tests are all well and good but 10 million iterations of GetComponents in standalone is probably an unlikely use case in the standard game so in addition I wanted to test what the actual performance hit you would get if you used Unity-Ash in a game instead of the standard Unity way.

To test this I set up another scene that creates and updates 5,000 asteroids on the screen.

![upout](https://www.mikecann.blog/wp-content/uploads/2014/12/upout.jpg)

I time how long they create then I count how many frames I get in 10 seconds of updating them. Each asteroid has a 2D rigid body and a very simple controller script that wraps the Asteroids position on the screen:

![2014-12-10_10-15-54](https://www.mikecann.blog/wp-content/uploads/2014/12/2014-12-10_10-15-54.png)

```
public class AsteroidController : MonoBehaviour
{
	private Bounds bounds;

	void Awake()
	{
		var size = Camera.main.ScreenToWorldPoint(new Vector2(Screen.width, Screen.height));
		bounds = new Bounds(Vector3.zero, new Vector3(size.x * 2, size.y * 2));
	}

	void Update()
	{
		if (transform.position.x < bounds.min.x)
		{
			transform.position = new Vector3(transform.position.x + bounds.size.x, transform.position.y, transform.position.z);
		}
		if (transform.position.x > bounds.max.x)
		{
			transform.position = new Vector3(transform.position.x - bounds.size.x, transform.position.y, transform.position.z);
		}
		if (transform.position.y < bounds.min.y)
		{
			transform.position = new Vector3(transform.position.x, transform.position.y + bounds.size.y, transform.position.z);
		}
		if (transform.position.y > bounds.max.y)
		{
			transform.position = new Vector3(transform.position.x, transform.position.y - bounds.size.y, transform.position.z);
		}
	}
}
```

This was the base test and it took about 440ms to create 5000 asteroids and processed 83 frames over 10 seconds (8.3FPS).

Now I had my base I decided to setup the same scenario but using Unity-Ash to drive the updates. So now the Asteroid looks like this:

![2014-12-10_10-19-42](https://www.mikecann.blog/wp-content/uploads/2014/12/2014-12-10_10-19-42.png)

Notice that there is no controller for the Asteroid, now all the update logic happens in a system:

```
public class MovementSystem : SystemBase
{
	private Bounds bounds;
	private NodeList nodes;

	public MovementSystem()
	{
		var size = Camera.main.ScreenToWorldPoint(new Vector2(Screen.width, Screen.height));
		bounds = new Bounds(Vector3.zero, new Vector3(size.x * 2, size.y * 2));
	}

	override public void AddToGame(IGame game)
	{
		nodes = game.GetNodeList<MovementNode>();
	}

	override public void Update(float time)
	{
		var cam = Camera.main;
		for (var node = (MovementNode)nodes.Head; node != null; node = (MovementNode)node.Next)
		{
			var transform = node.Transform;
			var rigidbody = node.Rigidbody;

			if (transform.position.x < bounds.min.x)
			{
				transform.position = new Vector3(transform.position.x + bounds.size.x, transform.position.y, transform.position.z);
			}
			if (transform.position.x > bounds.max.x)
			{
				transform.position = new Vector3(transform.position.x - bounds.size.x, transform.position.y, transform.position.z);
			}
			if (transform.position.y < bounds.min.y)
			{
				transform.position = new Vector3(transform.position.x, transform.position.y + bounds.size.y, transform.position.z);
			}
			if (transform.position.y > bounds.max.y)
			{
				transform.position = new Vector3(transform.position.x, transform.position.y - bounds.size.y, transform.position.z);
			}
		}
	}

	override public void RemoveFromGame(IGame game)
	{
		nodes = null;
	}
}
```

The update logic is functionally exactly the same as the AsteroidController except its now contained within a system.

This time it took 595ms to create the Asteroids and we processed 33 frames over 10 seconds (3.3FPS).

So immediately you can see there is a large performance hit in using Ash-Unity over regular Unity (8.3FPS compared to 3.3FPS). To confirm that it was the extra overhead of checking for new components on each asteroid rather than the internal updating mechanism of the Systems in Ash I decided to turn off checking for component updates..

![2014-12-10_10-40-02](https://www.mikecann.blog/wp-content/uploads/2014/12/2014-12-10_10-40-02.png)

Sure enough the frame rate went back up (in fact higher!) than the Unity update rate of 8.3FPS to 8.6FPS.

So with this in mind I decided to add an option to the Entity component that lets you choose how often it checks for new components:

![2014-12-10_10-42-02](https://www.mikecann.blog/wp-content/uploads/2014/12/2014-12-10_10-42-02.png)

The reasoning is that its actually quite rare that you change the components after the initial creation of the object (at least that's what I found) and thus by reducing the number of times the Entity component checks for updates we should be able to increase the performance.

Sure enough, when set to "Every Other Frame" the framerate goes up to 4.5FPS then set to "Every 10 Frames" it goes up to 7.4 FPS. The final setting "If Component Count Changes" attempts to skip the iteration of the components by comparing the number of components against the previous frame, this results in 7.5 FPS.

So the short of the long is that you can get the same as or higher FPS using Unity-Ash so long as you know beforehand how often you are going to be added or removing components. If you have entities that is likely never to have components added or removed then set it to update "Never" and enjoy great FPS with the power of using Ash.

Just as an addendum to this, I have submitted a feature request to Unity to add in events to GameObject that we can listen to that are fired when components are added or removed, this would obviously remove 99.9% of these performance issues from Unity Ash so I would love your votes:

[https://feedback.unity3d.com/suggestions/componentadded-slash-removed-events-on-gameobject](https://feedback.unity3d.com/suggestions/componentadded-slash-removed-events-on-gameobject)

As a final step in the upgrade process I looked at what more radical changes we could make to the framework by taking advantage of Generics and some other features that C# gives us that were lacking in AS3, you can check those out towards the bottom of the readme: [https://github.com/mikecann/Unity-Ash](https://github.com/mikecann/Unity-Ash)

Well that's it for now, I hope you enjoy the improvements, please to let me know if you think its worth carrying on development, I would love to work on it some more but I have games to write!
