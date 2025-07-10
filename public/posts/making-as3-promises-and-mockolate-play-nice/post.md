---
coverImage: /posts/making-as3-promises-and-mockolate-play-nice/cover.jpg
date: '2015-10-13T00:23:55.000Z'
tags:
  - as3
  - async
  - mockolate
  - promises
  - testing
title: Making AS3 Promises and Mockolate Play Nice
oldUrl: /actionscript/making-as3-promises-and-mockolate-play-nice
---

For the [past 5 months](https://www.mikecann.blog/uncategorized/started-work-at-thebroth-in-perth/) my day job has been an AS3 developer with the awesome folks over at The Broth in Perth. Having worked with AS3 for most of my professional career it was a good fit for my coding skills.

<!-- more -->

I hadn't worked in AS3 for about 2 years before joining but there wasn't much to catch up on regarding the language or platform (sadly things arent moving very fast in the Flash world these days) but there was much to catch up with regards to my new interest in Unit Testing and TDD. I made it my mission to become the testing, clean code and best practices guy here and as such have been learning and writing many tests.

As anyone that has done unit testing will know, mocking is a big part of unit testing. In AS3 one of the main mocking libraries is called [Mockolate](https://mockolate.org/). Its an excellent library but unfortunately it hasnt been updated for over 3 years, so when I ran into an issue with it in conjunction with another AS3 library [promise-as3](https://github.com/CodeCatalyst/promise-as3) (not updated for 1+ years) it lead to weeks of frustration.

The issue, as documented on their issue tracker [here](https://github.com/CodeCatalyst/promise-as3/issues/27), is that when you try to use a Promise as return of a function call then it results in strange errors:

```csharp
D:\libs\adobe\flex\sdk\4.6\bin\adl.exe -profile extendedDesktop D:\testApp\out\test\desktop_flexunit-descriptor.xml D:\testApp\out\test\desktop
Player connected; session starting.
[Fault] exception, information=VerifyError: Error #1053: Illegal override of TestInterface600C55060B003CF6CD88EB5CFE69DFE741318F03 in mockolate.generated.TestInterface600C55060B003CF6CD88EB5CFE69DFE741318F03
```

The same goes for if you try to use Promises in interfaces.

Well after many hours of trail and error I found the problem. It looks as if there was a circular dependency within the Promises library so within the constructor of the Promise and Resolver classes depended upon each other. This meant that Mockolates subsystem (Floxy) couldnt generate proxy classes for them and thus they couldnt be mocked.

I fixed the issue, forked and committed:

[https://github.com/mikecann/promise-as3](https://github.com/mikecann/promise-as3)

I also submitted a pull request here:

[https://github.com/CodeCatalyst/promise-as3/pull/49](https://github.com/CodeCatalyst/promise-as3/pull/49)

But I don't have much hope that it will ever get accepted due to the dead nature of the library (and the ecosystem as a whole) but I hope it helps any other lost AS3 sheep in the future!
