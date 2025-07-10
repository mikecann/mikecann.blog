---
coverImage: /posts/fixing-unitys-internal-compiler-error/cover.jpg
date: '2014-05-13T05:25:14.000Z'
tags: []
title: Fixing Unity's Internal Compiler Error
oldUrl: /c/fixing-unitys-internal-compiler-error
---

As mentioned in my [last post](https://www.mikecann.blog/personal-project/parse-com-type-safe-extensions-for-unity/), I am working on a Unity game that takes advantage of [Parse](https://parse.com) for Asyncronous multiplayer. Well one nice feature of parse is that it uses Tasks to handle its asynchronicity.

<!-- more -->

[Tasks](https://www.parse.com/docs/unity_guide#tasks) are very much like JS promises (except they are type-safe) and return when the operation has completed. For example:

```csharp
obj.SaveAsync().ContinueWith(task =>
{
if (task.IsCanceled)
{
// the save was cancelled.
}
else if (task.IsFaulted)
{
AggregateException exception = task.Exception;
}
else
{
// the object was saved successfully.
}
});
```

You can chain tasks together like so:

```csharp
var query = new ParseQuery<ParseObject>("Student")
.OrderByDescending("gpa");

query.FindAsync().ContinueWith(t =>
{
var students = t.Result;
IEnumerator<ParseObject> enumerator = students.GetEnumerator();
enumerator.MoveNext();
var student = enumerator.Current;
student["valedictorian"] = true;
return student.SaveAsync();
}).Unwrap().ContinueWith(t =>
{
return query.FindAsync();
}).Unwrap().ContinueWith(t =>
{
var students = t.Result;
IEnumerator<ParseObject> enumerator = students.GetEnumerator();
enumerator.MoveNext();
enumerator.MoveNext();
var student = enumerator.Current;
student["salutatorian"] = true;
return student.SaveAsync();
}).Unwrap().ContinueWith(t =>
{
// Everything is done!
});
```

The problem is that if you want to catch errors you must manually check the task return for errors inside each handler. This seemed wasteful to me as all I wanted was a global error handler for that particular task chain, such as can be achieved with [Javascript Promises](https://www.parse.com/docs/js_guide#promises-errors).

Fortunately someone else also had noticed this problem and [solved it](https://www.rizalalmashoor.com/blog/exception-handling-wrappers-for-taskcontinuewith/):

```csharp
Task.Factory.StartNew(StartBusyIndicator)
.Then(task => GetWebResponseAsync(url))
.Then(task => Console.WriteLine(task.Result.Headers))
.Finally(ExceptionHandler, StopBusyIndicator);
```

The only problem is that when I tried to implement his C# library Unity started throwing the dreaded Internal Compiler Error:

> **Internal compiler error. See the console log for more information. output was:**
>
> ** Unhandled Exception: System.ArgumentNullException: Argument cannot be null.**

It took me a while to work out what was going on. I managed to simplify the entire problem down to this simple example:

```csharp
public static class TaskHelpers
{
public static void Then<TIn>(this Task<TIn> task, Action<Task<TIn>> next)
{
task.ContinueWith(t =>
{
});  
 }
}
```

I posted about this on the [Unity forum](https://forum.unity3d.com/threads/242919-Internal-compiler-error) on Parse's Forum and even on Parse's bug tracking system but no one was interested, Parse even told me its not a Parse issue.

It took me quite a while to work out what was going on, but I eventually worked out that if I separated the handler from the Continue With call it would work:

```csharp
public static class TaskHelpers
{
public static void Continue<TIn>(this Task<TIn> task, Action<Task<TIn>> next)
{
Action<Task> a = t => { };
task.ContinueWith(a);  
 }
}
```

Huzzah! It compiles. So I guess this is a lesson learnt. With the Unity Mono compiler, if you are getting Internal Compiler errors then perhaps try separating out the lambdas into variables.
