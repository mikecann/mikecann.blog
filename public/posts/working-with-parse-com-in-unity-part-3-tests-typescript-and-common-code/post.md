---
coverImage: >-
  /posts/working-with-parse-com-in-unity-part-3-tests-typescript-and-common-code/cover.jpg
date: '2014-11-11T01:24:38.000Z'
tags:
  - c sharp
  - parse.com
  - testing
  - typescript
  - unity
title: 'Working with Parse.com in Unity - Part 3 - Tests, Typescript and Common Code'
oldUrl: >-
  /programming/working-with-parse-com-in-unity-part-3-tests-typescript-and-common-code
---

> This is part of a three-post series on working with Parse.com in Unity. For more info please see the other posts in the series:
>
> [Part 1 - Intro and App Structure](https://www.mikecann.blog/programming/working-with-parse-com-in-unity-3d-part-1-intro-and-app-structure/)
>
> [Part 2 - Services, Helpers and Looming](https://www.mikecann.blog/programming/working-with-parse-com-in-unity-part-2-services-helpers-and-looming/)
>
> Part 3 - Tests, Typescript and Common Code

<!-- more -->

In the last post I covered how to use Parse.com in Unity itself, in this post I want to talk about to to go about writing backend code.

**Note all the code talked about can be found in the [Parse Unity Sample Project on Github.](https://github.com/mikecann/ParseUnitySampleProject)**

## Environment

I briefly talked about App structure in [my first post](https://www.mikecann.blog/?p=5435). I like to use use Visual Studio with Typescript and C# for my Backend as they all play nicely together an produce a hassle free way of coding up the backend.

I like to have the Parse command line app running in develop mode (parse develop "Parse Unity Sample") at the same time so I can see whats happening on the server when I call it, and it allows for very quick iterations:

[![2014-11-11_08-39-16](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-39-16-1024x268.png)](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-39-16.png)

## Typescript

I have talked a lot in the past about my love for Typescript and so I love to use it whenever I can. Parse lets you run Javascript code on the server so I use Typescript that compiles to Javascript. To get it to work I first create a Typescript project that has been setup with CommonJS as the module system:

![2014-11-11_08-40-46](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-40-46.png)

I then make sure all the code is contained withing the /cloud folder (so that the require() works):

[![2014-11-11_08-45-22](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-45-22-1024x324.png)](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-45-22.png)

It works well, particularly when combined with my (not yet finished) Typescript definition for Parse which provides type safety for as much as possible:

![2014-11-11_08-47-02](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-47-02.png)

For example, the code that is run before a User is saved looks like:

```AS3
// Force this TS file to become a module
export var x = 2;

Parse.Cloud.beforeSave("\_User", (request, response) => {

    // Must have a player name
    if (request.object.get("playerName") == null || request.object.get("playerName") == "")
        return response.error("Must supply a player name when creating a new user");

    // Email and username must equal
    if (request.object.get("email") != request.object.get("username"))
        return response.error("Username and email address must be equal");

    // All done
    response.success();

});
```

## Testing

Because there is no way to run Parse cloud code offline, all tests must run on code that runs on the Parse servers. At first this sounded really nasty to me and almost put me off using Parse all together but once I realised that I could just create another App for testing and structure my test in such a way that I could isolate each test, I grew to like it, I actually really enjoy writing these tests now.

I like to use NUnit with the Parse .NET SDK for the testing because it lets us use some more advanced C# features such as async / await which the Unity SDK hasn't got access too, and more importantly it returns the server error messages (unlike Unity) which we can test against.

To get started just create a Test class in your Typescript project (surprisingly Typescript projects work well C# within them in Visual Studio) and start testing:

```csharp
namespace ParseUnitySampleBackend.Tests
{
[TestFixture]
public class SaveUserTests
{
[SetUp]
public async void Init()
{
TestingHelpers.InitParse();
ParseUser.LogOut();
}

        [Test]
        [ExpectedException(ExpectedMessage = "Must supply a player name when creating a new user")]
        public async void RequiresPlayerName()
        {
            var user = new GameUser()
            {
                Username = TestingHelpers.GetRandomUserEmail(),
                Password = "a"
            };
            await user.SignUpAsync();
        }

    ...

```

I included some simple helpers that I like to use for testing which setup Parse before each test.

If you use Visual Studio's Test Explorer with the parse command line you can get really good feedback on what is happening on the server:

[![2014-11-11_08-59-15](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-59-15-1024x386.png)](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_08-59-15.png)

## Common Code

Because I write my tests in C# and my Unity code is in C# I would like to share my common code between the two projects. Unfortunately simply splitting the project out into a library project then including it as a reference in the testing project doesn't work because Unity requires a different compiler (Unity 3.5 subset on mono) and thus when you try to add that as a reference you get errors related to invalid assemblies:

![2014-11-11_09-03-05](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_09-03-05.png)

The solution I found is to use a little known trick of linking source. To do this select the "Models" folder from the common project and while holding Control and Shift drag it into the Backend project, you should note that the cursor changes to a little shortcut icon and when in the backend project the file icons now have a shortcut icon to indicate they are linked:

![2014-11-11_09-05-26](https://www.mikecann.blog/wp-content/uploads/2014/11/2014-11-11_09-05-26.png)

This means that files are linked to the Common project so they are included in compilation and any changes you make to those files in either the Common project or Backend project will be reflected in the other.

This is perfect as it now lets us compile the same files using a different compiler and version of Parse.

## Conclusion

Well thats it for my three part post on how to get started using Parse in Unity. I hope it helps some people, please do leave me a comment or email me: mike.cann@gmail.com if you have any questions.

Happy coding!
