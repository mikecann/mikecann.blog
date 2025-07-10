---
coverImage: /images/fallback-post-header.png
date: '2007-11-09T11:22:10.000Z'
tags: []
title: Coder Tidbit 01
oldUrl: /misc/coder-tidbit-01
---

Keep coming across things like this at work that make me stop and think for a while so i thought they would be interesting to post up here for others to think about too.

<!-- more -->

Heres one i came accross today that was causing a strange error in the game:

```java
boolean a = true;
if(a){ System.out.println("HERE1"); } { System.out.println("HERE2"); }
```

Which one is printed? HERE1 or HERE2 or both?

If a = false which is printed?
