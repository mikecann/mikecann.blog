---
coverImage: /posts/taming-unity/cover.jpg
date: '2014-04-26T00:42:52.000Z'
tags:
  - games
  - mvc
  - robotlegs
  - strangeioc
  - unit testing
title: Taming Unity
oldUrl: /c/taming-unity
openAIMikesBlogFileId: file-WeNWwEfR9A0QQMyeHMursrsg
---

![logo](https://www.mikecann.blog/wp-content/uploads/2014/04/logo.png)

For the last couple of months I have been working on a few different things including many new releases of [Post To Tumblr](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah?hl=en). Most of my time however has been spent working on an unnamed (as of yet) game in Unity.

<!-- more -->

Its my first time using Unity, having come from a predominantly Flash games background I was excited to have the power of C# with a WYSIWYG editor for rapid iterations, and indeed I did make rapid progress. I soon had a working gameplay prototype up and running and everything and everything was hunky dory. It worked but the code was far from pretty with dependencies between my components all over the place not to mention the headaches when I tried to introduce Unit Testing into the mix.

The game I am developing is a turn based strategy with some complex gameplay rules, perfectly suited to unit testing I thought. Unfortunately however the power of Unity's rapid development is also its downfall. It allows you to do some pretty nasty things. It also uses a vast number of statics and singletons making testing rather tricky. I managed to muddle my way through things using Unity's recently released [Unit Testing Tools](https://blogs.unity3d.com/2013/12/18/unity-test-tools-released/) however things were far from ideal.

The main issues were dependency hell and Managers. Unity seems to recommend "Managers" as a way to look after various parts of game logic. You create an empty game object then attach a manager component to it then reference that manager from anywhere. Seems okay (though there are numerous problems with this particularly when it comes to changing scenes) however the big problem is how to reference that manager from your components?

The method I was using was in the Awake() I would use GameObject.FindObjectOfType(); then cache the result and use it. Fair enough but this still means I have a dependency in this component on the Manager. It also makes Unit Testing very hard because there is no way to pass in a mock Manager. A stopgap solution was to use constructors to pass in the manager:

[code lang="csharp"]
private MyManager \_manager;
public MyClass(MyManager <span class="hiddenGrammarError" pre="">manager)
{
\_manager</span> = manager;
}

void Awake()
{
if(\_manager==null) \_manager = GameObject.FindObjectOfType();
}
[/code]

Still we have the dependency there however and my code was starting to get more and more complex. Plus Unity doesn't really like you instantiating MonoBehaviours using constructors so I would continually get warnings in my tests. Far from ideal, so I decided to go looking for an alternative.

In the past I have worked a great deal with the Robotlegs framework and knew it was designed specifically to help with clear separation of use and help with managing dependencies for easy unit testing. So I wondered if anyone had ported Robotlegs to Unity. Well I was very happy to discover someone had and had done a good job of it in the form of [Strange IoC](https://strangeioc.github.io/strangeioc/).

Strange is an MVCS framework very similar to Robotlegs so if you know Robotlegs you should be swimming. I wont go into the details of MVCS, checkout the [documentation](https://strangeioc.github.io/strangeioc/TheBigStrangeHowTo.html) or the Robotlegs documentation if you want to know more.

Using Strange I was able to replace the dependencies in my components by converting most my components into "Views" which respond by displaying data and then dispatching signals which the rest of the application picks up in Commands and and updates the Models or uses Services to communicate with the database. It immediately made my code much more testable by removing many of the dependencies between my components. At the same time I was able to convert many of my Models and other "Manager" like classes to implement Interfaces which made my code much more portable should I choose to change parts or reuse bits in future projects.

A disclaimer is that I have only used it for my menu systems and multiplayer services so far as thats what MVCS is ideally suited for and haven't converted my spaghetti game logic over to it yet so cant comment on it just yet. My main worry is that it may slow down the enjoyment of rapid iteration and development. I will have to think carefully about that as I go forward.
