---
coverImage: /posts/parse-com-type-safe-extensions-for-unity/cover.jpg
date: '2014-05-10T09:24:05.000Z'
tags:
  - extensions
  - github
  - parse.com
  - programming
  - test
  - unity
title: Parse.com Type-Safe Extensions for Unity
oldUrl: /c/parse-com-type-safe-extensions-for-unity
openAIMikesBlogFileId: file-bl3SfE6Ot4zQuIdO8Fy45XRg
---

As mentioned in my [previous post](https://www.mikecann.blog/games/taming-unity/) I have been working on a multiplayer game built in Unity for a little while now. I ummed and ahhed over the technology choice for the backend for a little while before deciding to go with [Parse.com](https://Parse.com)'s library. The reason being that it looked simple to implement (they have a Unity SDK), they take care of all the backend headaches for me and the pricing model looked fair.

<!-- more -->

The Parse Unity library is okay, not as fully fleshed as some of the other languages they support but good enough for what I needed apart from one critical point, the lack of type-safety in the queries such as:

```csharp
new ParseQuery<Armor>().WhereLessThanOrEqualTo("cost", 13);
```

This annoyed me so much that I decided to write some extension methods that take advantage of Lambda functions to provide the type-safety. The above now becomes:

```csharp
new ParseQuery<Armor>().WhereLessThanOrEqualTo(a => a.Cost, 13);
```

The library can also handle chains such as

```csharp
new ParseQuery<Player>().Include(p => p.Stats.Heath.Remaining); // becomes "stats.health.remaining"
```

The library also handles interfaces by introducing a new attribute "ParseFieldType".

```csharp[parseclassname("father")]
public class Father : ParseObject, IFather
{
[ParseFieldName("daughter")][parsefieldtype(typeof(child))]
public IChild Daughter { get; set; }
}

new ParseQuery<Father>().Include(f => f.Daughter.Name); // becomes "daughter.name" and works because ParseFieldType redirects the chain to Child rather than IChild
```

It can even handle lists

```csharp[parseclassname("father")]
public class Father : ParseObject, IFather
{
[ParseFieldName("children")][parsefieldtype(typeof(child))]
public List<IChild> Children { get; set; }
}

new ParseQuery<Father>().Include(f => f.Children[0].Name); // becomes "children.name"
```

To get started go grab the .dll from my Github project for the library: [https://github.com/mikecann/Unity-Parse-Helpers](https://github.com/mikecann/Unity-Parse-Helpers)
