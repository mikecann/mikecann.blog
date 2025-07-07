---
coverImage: /posts/tinkering-with-entitias-entitiasteroids/cover.jpg
date: '2015-11-09T01:50:07.000Z'
tags:
  - c sharp
  - games
  - programming
  - unity
title: Tinkering With Entitias - Entitiasteroids
oldUrl: /entitiasteroids/tinkering-with-entitias-entitiasteroids
openAIMikesBlogFileId: file-WYMFn9xokRpElNvH0GRQBqoY
---

**EDIT: Check the comments for an excellent reply from Simon, creator of Entitias.**

Last week I wrote a couple of blog posts about my work on Unity Ash:

<!-- more -->

[https://www.mikecann.blog/programming/unity-ash-a-different-way-of-thinking-about-making-games-in-unity/](https://www.mikecann.blog/programming/unity-ash-a-different-way-of-thinking-about-making-games-in-unity/)
[https://www.mikecann.blog/myprojects/unityasteroids/unit-testing-with-unity-ash-and-unity-test-tools/](https://www.mikecann.blog/myprojects/unityasteroids/unit-testing-with-unity-ash-and-unity-test-tools/)

After publishing those I was contacted by a friend about another Unity Entity / System architecture called [Entitas](https://github.com/sschmid/Entitas-CSharp).

After giving it a read and watching the [Unity Europe 2015 video](https://www.youtube.com/watch?v=1wvMXur19M4&utm_content=buffer601fb&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer) I knew that I had to tinker with it.

<!--more-->

Entitias is similar to Ash in that it is an Entity / System architecture that works in Unity but it differs in its approach.

Compared to Ash, Entitias favours a much more pure, immutability focused approach where components are added, removed and replaced instead of having their state changed. Systems react to changes by watching when matching groups of components are added or removed from a pool.

On paper it looks like a better approach to Entity / Systems in Unity than Ash as it means that Components are pure objects with no dependencies upon the Unity engine at all (Ash components extend MonoBehaviour). No dependencies on Unity means that the same code can be run on the client and server.

To dig a little deeper into Entitias I decided to port the [Ashteroids example I did for Unity-Ash](https://github.com/mikecann/UnityAshteroids) to Entitias, I called it Entitiasteroids:

[https://github.com/mikecann/Entitasteroids](https://github.com/mikecann/Entitasteroids)

![2015-11-09_09-22-56](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-09_09-22-56.gif)

So what did I learn in the process?

## Code Generation

Is mostly awesome. I really love the easy to read fluent interface it lets you construct, I mean just take a look at how beautiful and expressive this is:

```csharp
public static Entity CreatePlayer(this Pool pool, bool controllable)
{
return pool.CreateEntity()
.IsPlayer(true)
.AddPosition(0, 0)
.AddSpaceship(0.5f, 0.02f)
.AddCollisionRadius(1)
.IsControllable(controllable)
.IsWrappedAroundGameBounds(true)
.AddForce(new List<Vector2>(), 0)
.AddResource("Prefabs/Spaceship");
}
```

My only complaint is that the code generation can sometime be annoying to work with because it requires that the app is in a compilable state to run. You can quite easily get into catch 22 situation where you need a component to make a System compile but to make the component you need to generate code, which requires that the app compiles.

I mentioned this issue to Simon Schmid, the author of the project, and he agreed. The reason it requires a compiling application is because the code generator currently works via reflection. There is a Roslyn compiler for Entitias which may solve the issue but its still quite experimental.

## Prefabs

I miss prefabs. Look at the code example above, notice those hard-coded values there. After working with Unity's method of inspector based configuration objects it just feels wrong to go and put magic numbers back into the code, forcing a recompile each time you want to tweak a value. Using this method with teams could be quite troublesome too as the coder will be required for each minor value tweak.

I think [Unity-Ash](https://github.com/mikecann/Unity-Ash) excels here as you just create prefabs as normal with components as normal, the only difference is how those components are handled at runtime.

## Interop With Unity Components

Retrieving data from Unity components such as Rigidbody2D and Transform can be quite painful. Perhaps I wasn't doing it right and it may well be a totally necessary side effect of removing the Unity dependency from components but the copying of data from Unity components to Entitas components then "rendering" Entitas component values back to Unity components just felt cumbersome and confusing at times.

## Cryptic Error Messages

During development you would continually run into errors such as:

![2015-11-09_08-26-05](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-09_08-26-05.png)

Its quite difficult to read and follow whats happening here. Named components would help instead of index's but even with that it can be tough to understand whats going on. Unity-Ash doesnt have this problem really as you rarely ever interact with an Entity directly, you always go via a Node so you can be almost guaranteed that the components exist upon the entity.

Im not exactly sure why but sometimes adding IEnsureComponent to a system fixes some of the errors but I wasn't really sure what it does.

## Minor Annoyances

- It would be nice if there was a utility to automatically add systems to the Systems object. Often you spend a lot of time wondering why your code isnt working, often its because you forgot to add the newly created system to the Systems object.

- To keep things immutable, whenever you want to change a value in a component you must use ReplaceX() methods. This is a bit of a gotcha at first but once you get used to it its okay. The only problem is that the ReplaceX methods require that you supply the entire list of properties for a component. This can be quite annoying and verbose if you want to change a single property or simply increment or decrement the existing value;

- Reactive systems are one of the best things about Entitias but 99% of the time you end up writing something like:

```csharp
public void Execute(List<Entity> entities)
{
foreach (var entity in entities)
{
}
}
```

It would be nice if that list was looped for you so Execute just supplied a single Entity.

- Example projects listed on the Entitias github seems to use different versions of the library, so it can be quite confusing when looking for examples for how to do something when the examples all look different.

- Some of the callbacks in Entitias start with a lowercased letter such "trigger" "ensureComponents", this is strangely inconsistent with Unity and C# in general.

```csharp
public TriggerOnEvent trigger
{
get { return Matcher.AllOf(Matcher.Force, Matcher.Rigidbody).OnEntityAdded(); }
}
```

## Conclusion

Despite the above bitching I think Entitas is really nice. I am really impressed at how clever it is and the refreshing take on Entity / Systems architecture. The Code Generation is really nice and the immutability model for the framework is really powerful.

I do however think that it would be more difficult for people coming from Unity to pick up than Unity-Ash due to the pure-code nature of the entities / components (instead of Prefabs), the hoops you have to jump through to use existing Unity components and the difficult to debug errors.

I think that there is much that could be applied to Unity-Ash to improve it and perhaps bring some of the cool features from Entitias, but thats a tinking for another day :)
