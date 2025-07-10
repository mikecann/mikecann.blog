---
coverImage: /posts/mk-bridges/cover.jpg
date: '2014-10-06T23:53:48.000Z'
tags:
  - .net
  - asp
  - c sharp
  - typescript
title: MK Bridges
oldUrl: /mk-bridges/mk-bridges
---

MK Bridges is an ongoing freelance project I worked on for Martin-Kaye Solicitors.

<!-- more -->

The firm works with a number of suppliers that provide them clients. Those suppliers need information about the progress of a case such as when certain milestones have been met. Unfortunately MK's current system doesn't easily allow for this reporting to third parties and thus they were logging into each supplier's website and manually entering the data whenever the case updated. As this can happen many times a day for each case the extra workload was high.

MK Bridges is a solution to that problem. It uses daily snapshots of the MK database to work out which milestones have been completed and then sends API calls to the relevant supplier thus saving a great deal of manual labour.

It was developed using ASP.NET 5 with Entity Framework 6 with some sprinkling of Typescript for the client side.

[![screenshot_016 Oct. 06 16.11](https://www.mikecann.blog/wp-content/uploads/2014/10/screenshot_016-Oct.-06-16.11-1024x568.png)](https://www.mikecann.blog/wp-content/uploads/2014/10/screenshot_016-Oct.-06-16.11.png)

Although the project sounds deceptively simple it was actually quite complex and required quite a bit of back and forth with suppliers and hosting providers to link it all up correctly. There is an internal error handling system that uses Mandril to report on errors, a message request and response logging system and a moderately complex system for filtering information to send and display in the user interface.
