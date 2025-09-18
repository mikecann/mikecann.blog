---
coverImage: /images/fallback-post-header.png
date: "2009-09-03T19:34:07.000Z"
tags:
  - dropbox
  - idea
  - sync
title: File and Folder Syncing
oldUrl: /misc/file-and-folder-syncing
---

For a long while I have been worried about my lack of backups for my machine. I detest the fact that i  [actually lost some of my older work](https://www.mikecann.blog/lieroxna/lieroxna-digging-up-the-past/). Getting[ the Mac](https://www.mikecann.blog/photos-personal/new-laptop-iphone-fun/) has been the final straw and my instigator for change.

<!-- more -->

So at first I started looking at backup tools, these seem to fall into two categories, ones that backup locally to other hard drives and networks and ones that backup to 'the cloud'.

Now the situation is that on the Mac I have to run parallels for WindowsXP as FlashDevelop only runs in windows and the project files must be stored on the 'local windows disk' for the project to work properly in FlashDevelop. So the situation is I have three sepparate 'locations' where I need my files backed up from:

[![2009-09-04_1013](https://www.mikecann.blog/wp-content/uploads/2009/09/2009-09-04_10131.png "2009-09-04_1013")](https://www.mikecann.blog/wp-content/uploads/2009/09/2009-09-04_10131.png)

At first I played around with a few locally backing up solutions that required the machines to be on the same network. The issues with most of these was the fact that they either created temporary 'sync files' that reside permanently in the folder you are backing up ([synctoy](https://www.microsoft.com/downloads/details.aspx?familyid=E0FC1154-C975-4814-9649-CCE41AF06EB7)).

Other factors caused me to quickly look at the alternative method which is syncing your files with the 'cloud' which then means you can sync the cloud with all your devices.

[![2009-09-04_1025](https://www.mikecann.blog/wp-content/uploads/2009/09/2009-09-04_1025.png "2009-09-04_1025")](https://www.mikecann.blog/wp-content/uploads/2009/09/2009-09-04_1025.png)

Now there are several differnt providers out there for doing this. Ill list them in the order I discovered then and then subsequently tested them.

## The Alternatives

**Edit: this is an old post for a more up to date review of SpiderOak check: [https://www.cloudwards.net/review/spideroak/](https://www.cloudwards.net/review/spideroak/)**

[![logo](https://www.mikecann.blog/wp-content/uploads/2009/09/logo.gif "logo")](https://spideroak.com/)

SpiderOak was the first one I came across and the one that initially peaked my interest. It appears to be the new kid on the block when it comes to file and folder syncing. These are some things I liked and disliked about it:

[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) Syncs based on a timer rather than constantly checking your files for updates.
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) Selecting files and folders to backup is hideously slow and results in many frustrated clicking (buggy interface).
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) Buggy uploading and syncing, sometimes you cant tell whats chewing your bandwidth or what is going on behind the scenes.

[![logo](https://www.mikecann.blog/wp-content/uploads/2009/09/logo.png "logo")](https://www.getdropbox.com/home#/)

Ironically I read about Dropbox from the SpiderOak[ press release](https://spideroak.com/press), in which they boast themselves superior to their nearest competitor DropBox. DropBox seemed to me like a much more mature solution than SpiderOak.

[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) Simple to use interface (intergrates directly into the filesystem)
[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) Has a [very clever delta-file change system](https://serverfault.com/questions/52861/how-does-dropbox-version-upload-large-files) that is system-wide.
[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) File version, this is great if you mess-up as you can roll-back to a previous version.
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) Simple to use interface. This is what I like to call the "Apple Effect", it may be easy to use but sometimes you want more options and settings to control how the app functions.
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) Only one "dropbox" so only one root folder can by synced. This is a BIG issue and the one in the end that turned me off DropBox. I know that you can [setup symbolic links](https://wiki.getdropbox.com/TipsAndTricks/SyncOtherFolders) so that you can sync external folders but I found this to be error prone and hacky at best.

[![Live_Mesh_Logo](https://www.mikecann.blog/wp-content/uploads/2009/09/Live_Mesh_Logo-300x84.jpg "Live_Mesh_Logo")](https://www.mesh.com)

Live Mesh is Microsofts offering to file and folder syncing problem. I actually heard about this a few years ago and even used it quite abit, but mostly for simple file sharing and using thier unique VNC remote desktop ability (great for accessing the home PC from work). I recently rediscovered it again while on this crusade and decided to give it another go for my new purposes.

[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) Includes remote desktop (VLC)
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) Is Microsoft and hence dont get on with other platforms. Although there is now a Beta Mac version of LiveMesh im dubious as to how often this version of the software will be updated, and as I am working across Mac and Windows I need it working on both.
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) [No delta-file sync](https://social.microsoft.com/Forums/en-US/LiveMesh/thread/e82757b7-8429-4234-9877-c4e598586e82). This is the killer for live mesh for me. All changes to a file, no matter how small, cause the entire file to be re-uploaded.
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) 5GB limit

[![2009-09-04_1100](https://www.mikecann.blog/wp-content/uploads/2009/09/2009-09-04_1100.png "2009-09-04_1100")](https://www.mikecann.blog/wp-content/uploads/2009/09/2009-09-04_1100.png)

SugarSync is the solution I am currently using although it isnt perfect it seems to fit the bill on most counts so far.

[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) A good payment system (\$5 per month for 30gb)
[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) Intergrates nicely with the OS on Windows and Mac
[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) Nice interface consistent accross platforms.
[![thumb_up](../wp-content/uploads/2009/09/thumb_up.png "thumb_up")](../wp-content/uploads/2009/09/thumb_up.png) Can prioritize which uploads get done first.
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) Cannot sync folders to within other folders.
[![thumb_down](../wp-content/uploads/2009/09/thumb_down.png "thumb_down")](../wp-content/uploads/2009/09/thumb_down.png) Is buggy and sometimes corrupts files. This is my MAJOR gripe with SugarSync right now. There are some[ very obvious bugs that havent been addressed](https://getsatisfaction.com/sharpcast/topics/files_keep_renaming_to_all_caps).

## The Perfect Solution

From my adventures I have learnt alot about the state of play in the syncing arena. Each of the solutions have their positives and negatives. Currently SugarSync is winning for me, but DropBox is a close second, if only they would allow you to sync folders that dont reside within the dropbox folder.

My ideal syncing app would have the following features:

[![add](https://www.mikecann.blog/wp-content/uploads/2009/09/add.png "add")](https://www.mikecann.blog/wp-content/uploads/2009/09/add.png) A structured pricing plan where you only pay for the space and/or bandwith used
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) More control over when files are synced (simmilar to SpiderOak) where you can set how often files are updated to server. This is important as when coding your published file (be it an EXE or SWF or whatever) will change often and hence may need to be uploaded to the server very often and costing alot of bandwith.
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) A method of excluding certain files and folders or file types from syncing. SVN lets you do this, good for excluding those temp files that change alot.
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) A good delta-file-change upload system, see DropBox for an excellent[ example of how to do this right](https://serverfault.com/questions/52861/how-does-dropbox-version-upload-large-files). This method of delta-syncing means that you can potentially sync massive files almost instantly.
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) A method of sharing your syncs with other devices that dont belong to you (your friends computers) or potentially with people who arent even using the syncing software (web-based-access).
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) A good versioning system, including one click file and folder roll-backs.
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) A method for controlling how much bandwith is used when uploading / downloading and the ability to pause syncing.
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) When syncing temp files are created and then the data is filled in. This stops occasions when [one device is uploading and another reports that a folder is fully synced](https://rathercurious.net/archives/109).
[![add](../wp-content/uploads/2009/09/add.png "add")](../wp-content/uploads/2009/09/add.png) OS and File-system integration.

This is certainty not an exhaustive list but merely the main points that I can think of right now. I think there is definitely room for improvement in this area and the current solutions havent fully realized their potential.
