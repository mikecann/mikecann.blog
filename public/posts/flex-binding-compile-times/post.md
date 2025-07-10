---
coverImage: /images/fallback-post-header.png
date: "2011-02-17T19:30:02.000Z"
tags:
  - binding
  - compiler
  - flex
  - mxmlc
  - spark
  - speed
title: Flex Binding & Compile Times
oldUrl: /actionscript/flex-binding-compile-times
---

[![](https://www.mikecann.blog/wp-content/uploads/2011/02/commandlin01.jpg "commandlin01")](https://www.mikecann.blog/wp-content/uploads/2011/02/commandlin01.jpg)

Binding in flex has been playing on my mind for a little while now, so I have decided to finally sit down and try to resolve the issue.

<!-- more -->

The worry has been that on large projects that make heave use of the flex automatic binding, compile times could be dramatically increased. This is because behind the scenes the flex compiler must convert those syntax sugar ([Bindable] and {}) intoÂ actualÂ AS3 code. The exact way this is done I wont go into, but IÂ recommendÂ you google it, its a fascinating topic.

I really like the ease of use of automatic binding but at the same time I was worried about how much slower compile times are because of them. So I decided I would try to run some tests and see.

To compare the compile time performance of binding I ran three tests. The first, a control to define how long compilation takes with an empty Flex Application. The second tests how long non-binding takes and is comprised of a single group with 4000 labels that are assigned values. The third test is for binding and is 4000 labels that are bound to 4000 [Bindable] public variables.

For testing metrics I used the -benchmark=true compile flag along with -incremental=false to stop any sort of compile-caching. The full command line compile looks like:

> "E:Program FilesAdobeAdobe Flash Builder 4sdksflex_sdk_4.5.0binmxmlc.exe" -load-config+=MainConfig.xml -debug=true -incremental=false -static-link-runtime-shared-libraries=true +configname=air -benchmark=true
> I ran each test three times and took the average of each. I then ran the entire thing again but with -debug=false to see if that would make any difference.

I recorded all the results in this google doc: [https://spreadsheets.google.com/ccc?key=0AoHeesrTENc9dEFqamdCc2ZldHcyZkJmQkZsaDBOT0E&amp;hl=en&amp;authkey=CLP8r-MF](https://spreadsheets.google.com/ccc?key=0AoHeesrTENc9dEFqamdCc2ZldHcyZkJmQkZsaDBOT0E&hl=en&authkey=CLP8r-MF)

The general gist is that it seems binding adds about 20% onto compile times both- debug=true and -debug=false. This isnt as bad as I was fearing but still a 20% increase on a 30 second compile time can be annoying.

Im not sure if the tests I did were fair so I would love to hear feedback from others.

I have bundled the project up incase anyone wanted to test itÂ themselves: [/wp-content/uploads/2011/02/CompileTestGen.zip](https://www.mikecann.blog/wp-content/uploads/2011/02/CompileTestGen.zip)
