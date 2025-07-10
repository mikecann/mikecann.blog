---
coverImage: /posts/fixing-unitys-failed-aot-cross-compiler-error/cover.jpg
date: '2015-06-24T00:00:53.000Z'
tags: []
title: Fixing Unity's Failed AOT cross compiler error
oldUrl: /programming/fixing-unitys-failed-aot-cross-compiler-error
---

While working on Mr Nibbles Forever I have encountered many annoying errors with Unity. None has been more annoying than the dreaded AOT errors I was getting when building for iOS.

<!-- more -->

I foolishly had gone a while (a few weeks) without attempting to build for iOS. In that time I had added many third party libraries and made changes to much of the code. I decided one day to do a build for my iPad. I fired up Unity on OSX and tried to build and ran into the following:

> stderr:
>
> at UnityEditor.MonoProcessUtility.RunMonoProcess (System.Diagnostics.Process process, System.String name, System.String resultingFile) [0x00000] in <filename unknown>:0
>
> at UnityEditor.MonoCrossCompile.CrossCompileAOT (BuildTarget target, System.String crossCompilerAbsolutePath, System.String assembliesAbsoluteDirectory, CrossCompileOptions crossCompileOptions, System.String input, System.String output, System.String additionalOptions) [0x00000] in <filename unknown>:0
>
> at UnityEditor.MonoCrossCompile+JobCompileAOT.ThreadPoolCallback (System.Object threadContext) [0x00000] in <filename unknown>:0
>
> UnityEditor.HostView:OnGUI()

Ah jeeze, I thought to myself, I have no idea what could be causing this compile error. Unity gives me no information where or why this error is occurring. I have no idea what these third party libraries are doing behind the scenes. Perhaps one of them is interfering with one of the others? They all work fine on my windows / android build. _sigh_

So I ripped out all the third party libraries and tried to build again and surprise surprise the error was still there. So now I was really confused. What was going on, was it something in one my scenes?

So I created a blank scene and set that as the only scene the in game, built again and the error was still there. Now I was really worried, I had made a bunch of changes since the last build, which of those was it? I had no idea and I really didnt want to go line by line and comment out everything I had done.

It was then that I tried to do something strange. Im not sure why but I noticed this but there is now a new compiler option in Unity:

![upload_2_6_2015_at_07_44_52](https://www.mikecann.blog/wp-content/uploads/2015/06/upload_2_6_2015_at_07_44_52.png)

The IL2CPP is the new Unity compiler. Im still not sure why but I decided to switch this to IL2CPP instead of mono and try to build again. Low and hold I got a different error, one with much more information about where the error was happening:

> stdout;
>
> Fatal error in Mono CIL Linker
>
> System.Exception: Error processing method: 'System.Void Assets.Scripts.Effects.NicerOutline::OnValidate()' in assembly: 'Assembly-CSharp.dll' ---> Mono.Cecil.ResolutionException: Failed to resolve System.Void UnityEngine.UI.BaseVertexEffect::OnValidate()
>
> at Mono.Linker.Steps.MarkStep.MarkMethod (Mono.Cecil.MethodReference reference) [0x00000] in <filename unknown>:0
>
> at Mono.Linker.Steps.MarkStep.MarkInstruction (Mono.Cecil.Cil.Instruction instruction) [0x00000] in <filename unknown>:0
>
> at Mono.Linker.Steps.MarkStep.MarkMethodBody (Mono.Cecil.Cil.MethodBody body) [0x00000] in <filename unknown>:0
>
> at Mono.Linker.Steps.MarkStep.ProcessMethod (Mono.Cecil.MethodDefinition method) [0x00000] in <filename unknown>:0
>
> at Mono.Linker.Steps.MarkStep.ProcessQueue () [0x00000] in <filename unknown>:0

Well look at that! Its dieing at Assets.Scripts.Effects.NicerOutline::OnValidate() thats great! I now could go back into my code and fix the issue.

The lesson is, if you are getting strange AOT errors, try just switching the compiler to IL2CPP and see what you get, hopefully you will get more info about what is causing the problem.
