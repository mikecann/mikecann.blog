---
coverImage: /posts/my-third-coding-epiphany/cover.jpg
date: '2016-07-28T05:12:29.000Z'
tags:
  - architecture
  - code
title: My Third Coding Epiphany
oldUrl: /misc/my-third-coding-epiphany
openAIMikesBlogFileId: file-T0estEI1dDIuGGcb84C9n5tu
---

I have been meaning to write this post for a while now and since I have spent most of this month back in the UK visiting friends and family I don't have all that much to share technically so I thought it was about time I got this post done.

Over the course of my 23 years of coding I have had a number of what I call "Code Epiphanies". These are moments in my coding career where fundamental changes in how I code have taken place.

<!-- more -->

Like most, I started my coding career writing simple scripts, for me it was the odd bit of HTML, JS, PHP and AS. It was simple imperative code, usually all contained in one file. "When this is clicked do this, then do this" etc.

This way of coding served me well. It took me all the way to University at which point I encountered Java and I started to write larger and larger programs. I now started to struggle as I noticed that I had many more classes and objects but no way to easily tie them together.

For a simple (contrived) example, suppose I have a "Player" object that wanted to let the "PlayerManger" object know when the player had died. I would do something like the following:

```java
public class Player
{
public PlayerManager manager;

    ...

    private void Die()
    {
        manager.OnPlayerDie();
    }

}
```

The "manager" variable would be set from the outside by whoever created the Player. It looks simple but I found as I had more objects and managers I was getting horribly bogged down as I had to keep hold of references to PlayerManager in parts of the code which werent even remotely related. It was causing my code to become complex and hard to manage.

Thats when I had my first Code Epiphany, I discovered the Singleton. I no longer needed to pass my unrelated objects around, I could just access them directly within the player:

```java
public class Player
{
...

    private void Die()
    {
        PlayerManger.GetInstance().OnPlayerDie();
    }

}
```

This was an incredible revelation to me as it opened my eyes to how important good architecture is as your program gets larger.

As the years went by however I started to notice issues with my Singleton based architecture. Although it was okay for quick projects that weren't meant to last very long I noticed that as a program got bigger and bigger Singletons were becoming more and more of an issue. For example I found that I couldn't easily swap out the PlayerManager for a different sort of PlayerManager without breaking a whole bunch of code, for example I couldn't do the following:

```java
public class Player
{
...

    private void Die()
    {
        IPlayerManger.GetInstance().OnPlayerDie();
    }

}
```

Singletons I also found were making my code very rigid. I was finding it hard to abstract parts of my code out into separate reusable libraries that I could use in future projects. With Singleton references all over the place it was becoming a bit of a spaghetti nightmare.

It was around this time that Flash was starting to become really big and I found myself doing more and more AS code. It was also around this time that frameworks were starting to explode in the Flash world. I remember experimenting with a whole bunch of them: PureMVC, Cairngorn, Swiz etc, before I came across Robotlegs.

Robotlegs was (and still is) a great MVCS framework. It creates clear separation between the different layers of your application; Models, Views, Controllers and Services. One of the most important things for me was how it did this, by using a new concept (to me at least), Automatic Dependency Injection.

Automatic Dependency Injection (DI) was my second Coding Epiphany, it did away with my hard-coded Singletons and replaced them with neat little "Inject" tags. First you would define your dependency tree such as:

```java
public class Context
{
private void setup()
{
injector.mapSingleton(IPlayerManger, PlayerManager);
}
}
```

You could then just write your Player like:

```java
public class Player
{
[Inject]
public IPlayerManger playerManager;

    private void Die()
    {
    	playerManager.OnPlayerDie();
    }

}
```

Then when you create a player using the injector, the IPlayerManager instance will be filled with a PlayerManager instance.

```java
injector.createInstance(Player);
```

This was a revelation to me as it now meant I could create better isolation between may various classes. Player doesn't care where PlayerManager comes from and it doesn't even care what the implementation of it is, it just wants to have the OnPlayerDie() method.

This general concept was great. It applied to everything I did, be it Actionscript games, C# apps or Java backend code, it created nice separation of concerns for me but I was missing one major benefit of DI which led me to my third Code Epiphany.

About 12 months ago I joined The Broth here in Perth Australia. I joined as an Actionscript developer onto a team that had been working on a Facebook and Mobile game for over 3 years. This was my first time joining a team on a project that had already been in development for years and it was a real revelation to me.

Over the years the code had grown and evolved. It had in fact grown to the point where it was starting to get really hard to maintain. I was really afraid to make any changes as I didn't have the years of experience to know what systems affected each other, whether deleting something over here would cause something over there to break.

So I did some googling and decided to invest in [Michael Feather's book Working Effectively with Legacy Code](https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052) and [Uncle Bob's Clean Code videos](https://cleancoders.com/videos).

![51H6SHy6g2L._SX374_BO1,204,203,200_](https://www.mikecann.blog/wp-content/uploads/2016/07/51H6SHy6g2L._SX374_BO1204203200_.jpg)

Both Michael Feathers and Uncle Bob both based most of their discussions around automated testing. Infact Michael Feathers defined legacy code as any code that doesn't have test coverage. I had heard about Unit Testing and knew that it was something I should be doing but never actually tried it.

Working on this 3 year old project was the perfect opportunity to get to grips with unit tests. As Michael Feathers describes in his book, once you have your code under test, that is you can be sure that its doing what it should be doing, you are then free to refactor the code so long as it passes the tests.

One thing I learnt very quick was that to make your code testable you have to be very careful how you structure your code. Your tests can get hard to write and maintain if your classes get too big or take on too many dependencies.

This to me was my third Code Epiphany. By keeping my classes small with minimal dependencies it made things easier to test. A side benefit was that it made the code much easier to read and reason about.

Going back to my contrived example. I would now structure my Player like:

```java
public class Player
{
private IPlayerManger \_playerManager;

    public Player(IPlayerManager playerManager)
    {
    	_playerManager = playerManager;
    }

    public void Die()
    {
    	_playerManager.OnPlayerDie();
    }

}
```

I have removed the need for the [Inject] tag as now all my dependencies are just passed in the constructor.

I could then easily test like:

```java
public class PlayerTests
{
[Test]
public void WhenPlayerDies_PlayerManagerInformed()
{
var mock = new MockPlayerManager();
var player = new Player(mock);
player.Die();
Assert.IsTrue(mock.OnPlayerDieWasCalled();
}
}
```

Unit Testing has forced me to write better, simpler to read code purely by the fact it would be hard to test if it wasn't the case. As Martin Fowler says:

> Any fool can write code that a computer can understand. Good programmers write code that humans can understand.

Well thats where im at these days. Trying to write easy to understand and testable code. I don't know what my fourth Epiphany could possibly be but im excited to keep learning and improving.
