---
coverImage: ./header.jpg
date: '2020-06-01T08:31:40.000Z'
tags:
  - typescript
  - mobxstatetree
  - mobx
  - mst
  - opensource
  - github
title: MobX State Tree Libraries
oldUrl: /projects/mst-libs
openAIMikesBlogFileId: file-6WhyQTytVQjCcP1AAJv0c5rE
---

I have generally steered away from building open-source libraries mainly for selfish reasons (I didn't want to spend the time maintaining them) but I decided that the current work I was doing would benefit from input and improvement from others and so I decided to release two things as libraries and im really happy with how things went.

<!-- more -->

Both libraries are for MobX State Tree (MST) [which I have been using for quite some time](/posts/markd-2-total-re-write-using-react-mobx-state-tree-and-parse-server/) now. Its a fantastic library for managing your state in a clear and concise way tho there are some gotchas with parts of it. These libraries try to help with some of those gotchas and thus increase reliability when using MST.

# MST Flow Pipe

https://github.com/mikecann/mst-flow-pipe

This is a helper library for writing type-safe async code in MobX State Tree.

I wont go into all the details of how this one works, you can click the link above to read the readme. Briefly tho I felt that MST's async story was a little lacking when combined with Typescript so set out to improve it with this library.

I first talked about it on [this issue](https://github.com/mobxjs/mobx-state-tree/issues/1516) which prompted me to release the lib.

My first version had some corner cases that didn't work quite right but thankfully [@lorefnon](https://github.com/lorefnon) picked up from where I left off and submitted [a PR](https://github.com/mikecann/mst-flow-pipe/pull/1) which greatly improved the library. Now it works fantastically, is infinitely expandable and handles errors in an elegant way.

Im really happy with the state of the library and I think the concepts could be borrowed and used in other libraries that use JS-generators instead of JS-promises such as [redux-saga](https://redux-saga.js.org/).

# MST Log

![](./mst-log-screenshot01.png)

A console logging middleware for MobX State Tree

This one came about after some work with Redux and [redux-logger](https://github.com/LogRocket/redux-logger) which beautifully shows actions and state changes as groups in the console window. I thought this was really cool and couldn't find anything comparable in the MobX State Tree world so [I posted on the Spectrum group](https://spectrum.chat/mobx-state-tree/general/a-good-logger~206ccd36-527b-4f09-b7f0-fcbef90b407d) about it to see if anyone else was interested in it.

MST has some conceptual differences from Redux so some of the choices I made around nesting and grouping async calls may not be 100% correct. Im hoping that others will point out issues and help contribute to make it better. So far tho I am using it on our [BattleTabs](http://battletabs.com/) project to great effect.
