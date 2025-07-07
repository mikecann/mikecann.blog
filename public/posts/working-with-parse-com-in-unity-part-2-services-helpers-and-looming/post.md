---
coverImage: >-
  /posts/working-with-parse-com-in-unity-part-2-services-helpers-and-looming/cover.jpg
date: '2014-11-11T01:24:32.000Z'
tags:
  - c sharp
  - github
  - helpers
  - library
  - parse.com
  - unity
title: 'Working with Parse.com in Unity - Part 2 - Services, Helpers and Looming'
oldUrl: >-
  /programming/working-with-parse-com-in-unity-part-2-services-helpers-and-looming
openAIMikesBlogFileId: file-vGdJoHhUfcfsrgovcbrZFXMv
---

> This is part of a three-post series on working with Parse.com in Unity. For more info please see the other posts in the series:
>
> [Part 1 - Intro and App Structure](https://www.mikecann.blog/programming/working-with-parse-com-in-unity-3d-part-1-intro-and-app-structure/)
>
> Part 2 - Services, Helpers and Looming
>
> [Part 3 - Tests, Typescript and Common Code](https://www.mikecann.blog/programming/working-with-parse-com-in-unity-part-3-tests-typescript-and-common-code/)

<!-- more -->

In the last post I covered the basic app structure, in this post I want to cover some of the specifics of the front end, the Unity part.

**Note all the code talked about can be found in the [Parse Unity Sample Project on Github.](https://github.com/mikecann/ParseUnitySampleProject)**

## Services

I like to split my code up so that all the work that involves dealing with remote services are contained within "Service" classes. The service classes are responsible for taking game data and turning it into a form that the remote service can deal with, then translating the result and passing it back to the game.

In the sample project I have just one service, the UserService, which is responsible for logging a user in or signing them up or logging them out, basically all functionality that that concerns the "GameUser" class.

### Tasks

Lets take a look at the Login method in the UserService class:

```csharp
public Task<GameUser> Login(string email, string password)
{
Debug.Log("Logging in..");

    return ParseUser.LogInAsync(email, password)
    	.OnMainThread()
    	.Then(t => Task.FromResult((GameUser)t.Result));

}
```

We can see that it takes in an email and password then logs in for us and returns a Task<GameUser>.

Parse uses Tasks throughout its Unity SDK as a way of handling asynchronicity. You will probably familiar with Tasks if you have done any work with aync / await in C# 5 or greater.

Unity runs on an old version of C# it doesn't have any concept of Tasks baked in so Parse includes the System.Threading.Tasks namespace. Although Unity does not have any support for async / await you can still use the Tasks API in a [Javascript-like Promise way](https://www.html5rocks.com/en/tutorials/es6/promises/).

Tasks allow us to provide a callback method that will be called when the Task returns, which allows the game to continue on running while we wait for the server to respond. For example, this is how we call Login:

```csharp
private void Login()
{
isLoading = true;
userService.Login(usernameInp.text, passwordInp.text)
.Then(OnLoggedIn, OnLoginError);  
}

private void OnLoginError(Exception e)
{
isLoading = false;
menus.ErrorPopup.Open("Error logging in!");
}

private void OnLoggedIn(GameUser user)
{
isLoading = false;  
 menus.States.SetState("Logged In State");
}
```

The Then function after login is being called on the Task<GameUser> and is the first of my helper libraries that I have included in the sample project which imports my [Unity Parse Helpers](https://github.com/mikecann/Unity-Parse-Helpers) library.

In that library I have included a number of extension methods for Task that allow you to chain functions together for example from the SignupState:

```csharp
private void Signup()
{
isLoading = true;

    // Signup
    userService.Signup(usernameInp.text, passwordInp.text, playernameInp.text)

    	// Then Login
    	.Then(t => userService.Login(usernameInp.text, passwordInp.text))

    	// Then we are done
    	.Then(OnLoggedIn, OnError);

}
```

This makes chaining asynchronous logic together in Unity a breeze and you don't ever have to deal with the headache of using yeild!

## Threading

The first major headache I came across when using Parse in Unity is to do with threading. Note from my earlier example of Login in UserService:

```csharp
public Task<GameUser> Login(string email, string password)
{
Debug.Log("Logging in..");

    return ParseUser.LogInAsync(email, password)
    	.OnMainThread()
    	.Then(t => Task.FromResult((GameUser)t.Result));

}
```

The function "OnMainThread" is a helper extension I wrote to deal with the threading issue. If we were to remove that function then when we try to login Unity would throw an error something like:

![2014-11-11_08-07-43](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-07-43.png)

This is because below the covers Parse is making web calls on a separate thread and when it returns the result is passed back to us without returning to be main thread and pretty much everything in Unity needs to happen on the main thread so when we try to access a variable that lives on the main thread Unity crashes.

There are a few ways around this issue, Parse documents that you can [use coroutines](https://www.parse.com/docs/unity_guide#tasks-coroutines) to deal with this, but I would really rather not have to use coroutines so instead I used another common solution, a "Loomer".

A Loomer basically just takes a function and waits until the game is running on the main thread before executing the function. So behind the scenes my "OnMainThread" extension function is calling the loomer which ensures that any Tasks that follow it will execute on the main thread:

```csharp
public static Task<T> OnMainThread<T>(this Task<T> task)
{
var tcs = new TaskCompletionSource<T>();
var loom = Loom.Instance;

    Action<Task<T>> a = t =>
    {
    	loom.QueueOnMainThread(() =>
    	{
    		if (t.IsFaulted) tcs.SetException(t.Exception);
    		else if (t.IsCanceled) tcs.SetCanceled();
    		else { tcs.SetResult(t.Result); }
    	});
    };

    task.ContinueWith(a);
    return tcs.Task;

}
```

So whenever you call Parse functions in your services just make sure you call "OnMainThread()" and you should be good to go!

On a separate note, I have already [previously mentioned](https://www.mikecann.blog/programming/fixing-unitys-internal-compiler-error/) that if you are going to write extension methods for Tasks you must make sure that you sepparate your action from the ContinueWith() else you will get an internal compiler error in Unity!

## Errors

Unfortunately there is an issue in Unity with Parse that means that we cannot get proper error messages back from the server. For example if a user mistypes their email address when logging in all we get is a HTTP error code like "404 - Not found", this is obviously not particularly helpful. Parse does actually return a better error than which can be seen if you use the Rest or .Net API but whatever reason in Unity that error message gets lost.

This is probably the single biggest drawback with using Parse.com with Unity but it is apparently a [fundemental issue with Unity](https://www.parse.com/questions/unity-sdk-handling-errors). I have [started a thread on the Parse Google Group](https://groups.google.com/forum/#!topic/parse-developers/s4tw8iiSpAA) to see if we can get an update on this but im not holding any hope. I did hear a rumor that the new version of the Unity compiler (shipping in Unity 5+) will finally include improvements to network stack.

Generally you can work around it as you can guess what the issue is if an error occurs and handle it in your business logic. Its still really annoying however particularly when it comes to debugging and testing, hence why I have devoted another post to that very subject..

## To Be Continued...

And thats basically it for dealing with Parse.com in Unity, I strongly reccomend [checking out the source](https://github.com/mikecann/ParseUnitySampleProject) if you need more information on anything I have covered, hopefully it makes more sense.

In the [next part](https://www.mikecann.blog/programming/working-with-parse-com-in-unity-part-3-tests-typescript-and-common-code/) ill talk about how to structure your backend so that you can easily test your cloud code.
