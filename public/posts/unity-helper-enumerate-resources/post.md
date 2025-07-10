---
coverImage: /posts/unity-helper-enumerate-resources/cover.jpg
date: '2014-06-04T01:48:28.000Z'
tags:
  - editor
  - open-source
  - resources
  - unity
  - util
title: Unity Helper - Enumerate Resources
oldUrl: /c/unity-helper-enumerate-resources
---

Following on from [yesterdays post](https://www.mikecann.blog/programming/unity-helpers-utilities-and-extensions-for-unity/) on my [Unity-Helpers](https://github.com/mikecann/Unity-Helpers) I have added another utility to the library.

<!-- more -->

**Enumerate Resources**

Enumerate Resources is a handy util for creating type-safe resource references. Traditionally you have to manually create constant strings to load resources at runtime:

```csharp
Resources.Load("Prefabs/Cars/Porsche");
```

This is fragile. If the asset is moved you wont know about the crash until you run the game, this line of code may not be executed often and hence introduces a bug that may only present itself at a later date.

Enumerate Resources scans a resources directory and generates a type-safe alternative:

```csharp
Resources.Load(GameResources.Prefabs.Cars.Porsche);
```

Now if you move the resource and run the enumerator you will get a compile error.

For added sugar there is a method to add the loaded resource as a child of a game object (handy for prefabs):

```csharp
obj.LoadChild(GameResources.Prefabs.Icons.IndicatorArror);
```

You can grab the project, source and tests over at Github: [https://github.com/mikecann/Unity-Helpers](https://github.com/mikecann/Unity-Helpers)
