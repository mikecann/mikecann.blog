---
coverImage: /images/fallback-post-header.png
date: "2011-10-13T19:22:42.000Z"
tags: []
title: Game of Life HaXe & NME on iOS
oldUrl: /haxe/game-of-life-haxe-nme-on-ios
openAIMikesBlogFileId: file-jeBf6cqkg8uaR5fKOE1NjWZq
---

For the last few days I have been playing around with trying to get the[ game of life sample from my previous post](/posts/conways-game-of-life-in-haxe-nme-massiveunit/) working on the iPhone using haXe with NME.

<!-- more -->

In theory NME should do all the heavy lifting for you so that it should be as simple as running:

```text

haxelib run nme build nmebuild.nmml ios

```

Unfortunately however when I ran this I was getting rather cryptic errors:

```text

Called from ? line 1
Called from InstallTool.hx line 384
Called from a C function
Called from InstallTool.hx line 70
Called from a C function
Called from installers/InstallerBase.hx line 61
Called from installers/InstallerBase.hx line 668
Called from installers/InstallerBase.hx line 762
Called from haxe/xml/Fast.hx line 59
Uncaught exception - icon is missing attribute name

```

I had read from the [NME documentation page](https://www.haxenme.org/developers/get-started/) that this may have been fixed in the more reccent versions of NME. So I downloaded the beta version (you could checkout from SVN too if you wish) and told haxelib that im going to be working with a development version of NME with the following command:

```text

haxelib dev nme /Users/mikec/Documents/NME_3.1_Beta

```

Now when I try to build for ios I get success!

[![](https://www.mikecann.blog/wp-content/uploads/2011/10/2011-10-12_1149.png "2011-10-12_1149")](https://www.mikecann.blog/wp-content/uploads/2011/10/2011-10-12_1149.png)

From there is a simple matter of opening the generated xcode project, connecting my iphone and hitting run:

<iframe width="853" height="480" src="https://www.youtube.com/embed/ZsILr8vjWL8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"  allowfullscreen></iframe>

I really like how easy the workflow is compared to the Adobe Air packaging system. Generating the xcode project makes things so much faster.

If I can get my hands on an Android phone next I think im going to have to have a go at getting this sample working on there too!
