---
coverImage: >-
  /posts/working-with-parse-com-in-unity-3d-part-1-intro-and-app-structure/cover.jpg
date: '2014-11-11T01:24:26.000Z'
tags:
  - polymer
  - unity
title: Working with Parse.com in Unity 3D - Part 1 - Intro and App Structure
oldUrl: /programming/working-with-parse-com-in-unity-3d-part-1-intro-and-app-structure
openAIMikesBlogFileId: file-CI9Tx2Rg3PCAEt9xnJtuSKg3
---

> This is part of a three-post series on working with Parse.com in Unity. For more info please see the other posts in the series:
>
> Part 1 - Intro and App Structure
>
> [Part 2 - Services, Helpers and Looming](https://www.mikecann.blog/programming/working-with-parse-com-in-unity-part-2-services-helpers-and-looming/)
>
> [Part 3 - Tests, Typescript and Common Code](https://www.mikecann.blog/programming/working-with-parse-com-in-unity-part-3-tests-typescript-and-common-code/)

<!-- more -->

For a while it has been my intention to follow up [my work with Parse.com in Unity](https://www.mikecann.blog/programming/fixing-unitys-internal-compiler-error/), but other things have always gotten in the way and thus I have only just managed to get round to it.

Over the past 9 months of working with Parse I have encountered some pretty nasty issues which I decided to solidify by putting together this guide and [sample project](https://github.com/mikecann/ParseUnitySampleProject) which I hope will help others out there!

But first..

## What is Parse.com?

Parse.com is a backend as a service (BaaS). This means they take care of managing servers, operating systems, load balancing and all of that leaving you with a simple API that you can use to get what you need done.

I have been using Parse for most of my projects of late for a few reasons, mainly its ease of use (more of that later) and incredibly generous pricing:

![2014-11-10_15-58-19](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_15-58-19.png)
(thats about 77 million free API requests per month, per app!)

In comparison to the competition its much cheaper, Microsoft's Azure based Mobile Services for example:

![2014-11-10_16-00-33](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_16-00-33.png)

Parse.com features a simple way to store..

[code lang="csharp"]
var shield = new Armor
{
DisplayName = "Wooden Shield",
IsFireproof = false,
Rupees = 50
};

shield.SaveAsync();
[/code]

.. and retrieve data:

[code lang="csharp"]
var query = new ParseQuery<Armor>()
.WhereLessThanOrEqualTo("rupees", ((Player)ParseUser.CurrentUser).Rupees);
query.FindAsync().ContinueWith(t =>
{
IEnumerable<Armor> result = t.Result;
});
[/code]

You can also have routines run on the server written using Javascript:

[code lang="javascript"]
Parse.Cloud.define("averageStars", function(request, response) {
var query = new Parse.Query("Review");
query.equalTo("movie", request.params.movie);
query.find({
success: function(results) {
var sum = 0;
for (var i = 0; i < results.length; ++i) {
sum += results[i].get("stars");
}
response.success(sum / results.length);
},
error: function() {
response.error("movie lookup failed");
}
});
});
[/code]

I wont go into the API any more here but their docs are pretty good and will explain things much better than me: [https://www.parse.com/docs/unity_guide](https://www.parse.com/docs/unity_guide)

# Parse Unity Sample Project

I have provided a simple Sample Project that hopefully should help with explaining how things work:

[embed]https://www.youtube.com/watch?v=nJBf-PccP3E[/embed]

The source code for which can be found on [github here](https://github.com/mikecann/ParseUnitySampleProject).

## Application Structure

Although Parse.com has a Unity SDK that looks very simmilar to the .Net API, there are some pretty important differences which ill get into later.

Firstly, everyone's project structure is different and only experience and time will lead you to your own personal preference. For me, I like to setup my project folder like this:

![2014-11-10_16-15-46](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_16-15-46.png)

One folder for the Unity project, one for the Backend and one Common library that is shared between the two.

If you use Visual studio this can all be set into one solution:

![2014-11-10_16-17-54](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_16-17-54.png)

### Frontend (ParseUnitySampleProject)

This is the Unity project, you can structure this how you like but I have provided a simple login / signup / logged in menus demo to show how I organise the libraries and code within it:

![2014-11-10_16-51-47](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_16-51-47.png)

### Common

The common project contains code that is common to the frontend and backend. This is usually just models that represent the database, in this case its just a simple class GameUser:

[code lang="csharp"][parseclassname("_user")]
public class GameUser : ParseUser
{  
 [ParseFieldName("playerName")]
public string PlayerName
{
get { return GetProperty<string>("PlayerName"); }
set { SetProperty<string>(value, "PlayerName"); }
}

    public bool IsPlayerNameSet { get { return !String.IsNullOrEmpty(PlayerName); } }

}
[/code]

Every time you build the common project the DLL that gets created is automatically copied into the game thanks to the build task:

![2014-11-10_16-22-42](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_16-22-42.png)

### Backend

The backend contains the code that will run on Parse.com and the associated tests:

![2014-11-10_16-53-18](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_16-53-18.png)

I like to use Typescript for my Parse.com backend and so the project is a Typescript project mixed with C# for unit testing. I have provided my unfinished Typescript definition file for parse.com with the project:

![2014-11-10_16-54-54](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-10_16-54-54.png)

## To be continued..

In the [next part](/programming/working-with-parse-com-in-unity-part-2-services-helpers-and-looming/) of this post ill talk more about the specifics of how to interact with the Parse.com API in Unity and some special helpers that I have developed to aid with that.
