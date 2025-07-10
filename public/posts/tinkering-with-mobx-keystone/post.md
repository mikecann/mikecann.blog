---
coverImage: ./header.jpg
date: '2020-08-15T08:31:40.000Z'
tags:
  - typescript
  - libraries
title: Tinkering with MobX Keystone
oldUrl: /programming/tinkering-with-mobx-keystone
---

Its no secret that im a fan of MobX and have been using it for many years now. I have even [written a couple of libraries](/projects/mst-libs) for its sister project MobX State Tree. So when I encountered [MobX Keystone](https://mobx-keystone.js.org/) I was intrigued..

<!-- more -->

## MobX State Tree

[MobX State Tree](https://mobx-state-tree.js.org/intro/philosophy) is a fantastic library that I have been using for some time to simplify state management in my various web projects. Its main premise is that all the state for your app should be contained in a single hierarchical "tree".

Although this sounds pretty much exactly like [Redux](https://github.com/reduxjs/redux) there is one major difference from Redux in that the state lives close to the code that modifies it and this state is is modified in a "mutable" manner.

Although you change state by assigning to variables and pushing into arrays you aren't actually mutating data. The underlying state is maintained as an immutable "snapshot" of the entire tree. Actions that modify the state produce new snapshots.

The benefits of having this "layer of indirection" from you and your state is that you can have functionality such as transparent references. References allow one part of the state to reference another part of the state but hide that underlying reference in the API. Its only when a snapshot is created or restored is that reference converted into a serializable "id" reference.

There are many other benefits of this way of working but I wont enumerate them all, the docs do a pretty good job of explaining that: https://mobx-state-tree.js.org/concepts/trees

## MST Problems

MST although awesome is not without its issues. [This](https://medium.com/@xaviergonz/mobx-keystone-an-alternative-to-mobx-state-tree-without-some-of-its-pains-8140767a3aa1) excellent blog post by Javier Gonzalez does a great job at detailing those points but ill summarize here:

1. Typescript in MST is "best effort" ([according to the official MST docs](https://mobx-state-tree.js.org/tips/typescript)). So although it does mostly work there are really frustrating situations where you can loose typing particularly when you have types that reference other types that then reference the first type again (circular references). MST really struggles to handle this case because it relies heavily upon type inference. This inference also leads to rather slow Typescript compile times and large declaration files.

2. Snapshots and Instances can get confusing because they are used interchangeably, this also is another source of problems when using Typescript.

3. "this" and "self" within MST models. You have to choose which one you need depending on the situation. This is again another Typescript issue due to the way that MST types its modular models via type inference.

4. MST's lifecycle hooks are temperamental. MST has a [number of life cycle hooks](https://mobx-state-tree.js.org/overview/hooks) that allow a model to run code when a model is attached or detached from a tree. Unfortunately these dont always function in the way you expect particularly when you throw references into the mix.

## MobX Keystone

[MobX Keystone](https://mobx-keystone.js.org/) is very similar to MST conceptually but it implementation differs in some key ways allowing it to overcome many of the problems encountered in MST.

1. Keystone's [models are classes](https://mobx-keystone.js.org/classModels) rather than modular functional "chunks". Typescript has great support for classes even in recursive or circular scenarios. This is great for building complex interconnected models. It also solves the "this or self" problem listed above as its always just "this".

2. Keystone's [references](https://mobx-keystone.js.org/references) are objects in themselves rather than direct instances of another model. This indirection allows for more flexibility in how models reference each other. This opens up lots more possibilities when you have multiple trees for example.

3. Runtime type checking is optional. In MST you were forced to use the "types" object to enforce types in your model, in Keystone is this optional. This can make things a good deal simpler if you are happy just to rely on the Typescript compiler and don't want the overhead of type-checking at runtime too.

## Keystone Problems

1. Keystone's [snapshots](https://mobx-keystone.js.org/snapshots) contain some "meta" information such as the "type" of the model and the "id" of the instance. I understand the reason for this requirement having worked with generic serialization libraries in C# and other languages before, its necessary that the system know the type of object so it can correctly construct an instance of it.

MST doesn't have this issue because it enforces the runtime types and the precise structure of the tree thus in most (not unions) situations it knows what the type the data represents.

I haven't played with them much but the [functional models](https://mobx-keystone.js.org/functionalModels) that Keystone offers may help if this is a big problem for you.

2. Immutability / Mutability.. This is a tricky one and a problem that both MST and Keystone have and I guess all OO based state management suffer from. When working with MST or Keystone I find that the models tend to pollute my immutable data models. You can construct an object using a property from an MST or Keystone model but you must be very careful because those models by their nature are mutable thus the newly constructed object too becomes mutable. This another with another [issue](https://github.com/xaviergonz/mobx-keystone/issues/170) has bit me in the past so you have to be super careful when mixing immutable and mutable data, always snapshot!
