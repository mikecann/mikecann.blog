---
coverImage: /images/fallback-post-header.png
date: "2010-01-18T13:36:07.000Z"
tags:
  - dropbox
  - utility
title: Rename Dropbox Root Folder Windows
oldUrl: /photos-personal/rename-dropbox-root-folder-windows
---

[![](https://www.mikecann.blog/wp-content/uploads/2010/01/pyDropboxPath.png "pyDropboxPath")](https://www.mikecann.blog/wp-content/uploads/2010/01/pyDropboxPath.png)

Following onÂ today'sÂ handy tips that I haveÂ commonlyÂ had to employ when dealing with fresh PC installs, I present PyDropboxPath.

As Dropbox doesnt let you rename the root folder your files are stored in on windows (Defaulted to "My Dropbox") there are occasions when you want to choose a different name. In particular when you are running Bootcamp on a Macbook Pro with a drive shared between Windows and OSX.

Luckily some clever Python developer on the [Dropbox Forum](https://forums.dropbox.com/topic.php?id=9665&replies=51#post-60253)s came up with a little tool that lets you rename said folder.

Again im just copy / pasting the install instructions directly from the forum (replacing the download link for the file):

Dowload: [PyDropboxPath_082](https://www.mikecann.blog/wp-content/uploads/2010/01/PyDropboxPath_082.zip)

_Tested on Ubuntu Jaunty, Windows XP Pro and Windows7 x64 RC. Others tested on OSX and told me it was OK too :)_

_Feedback welcome._

_IF IN DOUBT, DO NOT USE and ask here first._

_If it breaks up somewhere, please post here._

_The old terminal 0.7.1 version is in a subdirectory, only use it if you do not have wxpython and your system paths have no non-ascii characters._

_The windows (EXE) terminal version needs msvcr71.dll, and the EXE GUI version needs msvcp71.dll - It's on the download list if you don't have it.
If the GUI version generates a error log file telling
_`_EOFError: EOF when reading a line_`_
then you probably are missing the msvcp71.dll._

_WARNING: If you change the dropbox folder name to a root of a drive (Like, from "C:My Dropbox" to "D:") or you will miss key features like sync icon overlays and right-click context menu items - good ones like "share this folder" and "copy public link". If you are okay with this, everything else works fine._

_Note: I initially named the script 'DropboxPath' but there is one .NET app that does the same thing in the wiki with that name. From now on, the name is 'pyDropboxPath'._
