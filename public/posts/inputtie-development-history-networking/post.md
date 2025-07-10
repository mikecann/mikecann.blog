---
coverImage: /images/fallback-post-header.png
date: "2010-10-23T19:44:51.000Z"
tags:
  - as3
  - broadcast
  - c sharp
  - flash
  - java
  - jgroup
  - jmdns
  - networking
  - zero conf
title: Inputtie Development History - Networking
oldUrl: /inputtie/inputtie-development-history-networking
---

<!-- p.p1 {margin: 0.0px 0.0px 13.0px 0.0px; line-height: 19.0px; font: 13.0px Georgia} p.p2 {margin: 0.0px 0.0px 16.0px 0.0px; line-height: 19.0px; font: 20.0px Georgia} p.p3 {margin: 0.0px 0.0px 0.0px 0.0px; line-height: 19.0px; font: 13.0px Georgia; color: #0101ee; min-height: 15.0px} p.p4 {margin: 0.0px 0.0px 13.0px 0.0px; line-height: 19.0px; font: 13.0px Georgia; min-height: 15.0px} span.s1 {text-decoration: underline ; color: #0101ee} span.s2 {color: #0101ee} -->This is part two in my series of posts on the development history of [Inputtie](https://www.inputtie.com/).

In this post I talk about the challenge of device discovery and networking in the Inputtie app.

<!-- more -->

**[![](https://www.mikecann.blog/wp-content/uploads/2010/10/ScreenHunter_03-Oct.-09-13.59.jpg "ScreenHunter_03 Oct. 09 13.59")](https://www.mikecann.blog/wp-content/uploads/2010/10/ScreenHunter_03-Oct.-09-13.59.jpg)Zero Configure Networking**

I knew I wanted Inputtie to be as simple to get running as simply starting it up. For this to happen Inputtie would need to discover all other devices on the network also running Inputtie. So how to do this?

[](https://www.mikecann.blog/wp-content/uploads/2010/10/ScreenHunter_03-Oct.-09-13.59.jpg)

Well, as it happened I had been reading at the time aboutÂ [Apple's Bonjour](https://www.apple.com/support/bonjour/) which was designed to do just what I needed. It is a combination of a multi-cast and DNS lookup service that allows it to detect other Bonjour capable devices on the network. Sounds perfect.

So I got to work on implementingÂ theirÂ Java API. After many trials and tribulations I eventually had it working.. kinda. It was detecting other devices sure, but every now and then it would sporadically disconnect from the network. I couldn't for the life of me work out why. I posted on forums and even tried to read the reams of source to see what was going on but alas to no avail.

After much deliberation I decided to look for another solution to the problem of Zero Conf. networking. Next up were a whole host of other attempts. I triedÂ [JmDNS ](https://jmdns.sourceforge.net/)which is wasÂ supposedly very similar to Bonjour. I also experimented withÂ [JGroups](https://www.jgroups.org/). I had limited success with all of them and in the end only really succeeded in wasting several months worth of development time.

**The Solution**

In the end the solution (and the one currently employed in Inputtie) was the simplest. After months of messing around with theseÂ librariesÂ I had learnt quite abit about how they performedÂ theirÂ magic. At the heart of it they either used multi-cast or broadcasting to announce a device on a network. Broadcasting can be thought of as a sort of sonar pulse. The broadcasting computer sends a message on a specific IP address then another device listens for the message and proceeds to open a Socket for a more private form of communication. FromÂ [Wikipedia](https://en.wikipedia.org/wiki/Broadcast_address):

> A broadcast address is a logical address at which all devices connected to a multiple-access communications network are enabled to receive datagrams. A message sent to a broadcast address is typically received by all network-attached hosts, rather than by a specific host.
> I decided that if theseÂ librariesÂ could use broadcasting for discovery then so could I and if I wrote it myself I could keep it simple. So I set to work coding an example in Java. In no timeÂ at allÂ I had it running andÂ surprisinglyÂ it worked! Sure it wasnt as robust as the establishedÂ libraries, itÂ didn'tÂ handle devices disconnecting from the network, different network subnets or IPv6 but it was simple and at least it worked!

**Broadcasting in Adobe AIR**

As I mentioned in [a previous post](/posts/inputtie-history-the-beginning/) Inputtie went through many re-writes during development from its original form in Java through C++, C Sharp and finally Adobe AIR. With the latest (it was still in beta when I started development) version of Adobe AIR 2.0 several new APIs were made available for use, one of them being new classes designed specifically for peer to peer (P2P) networking. With these new APIs I believed I should be able to implement network broadcasting much in the same was I was doing in Java. Unfortunately however it seemed that Adobe was restricting the use of broadcast to [their new P2P service Cirrus.](https://labs.adobe.com/technologies/cirrus/)

There was however another crucial API released with AIR 2.0; the NativeProcess API. With this a developer is able to easily execute and communicate with a program written in another language. What this meant for Inputtie was that I could write the user interface in AIR and then use NativeProcess to call Java code that would perform actions not available in AIR, such as Broadcasting. (incidentallyÂ it also is a great way to do multi-threading in Air ;))

So the current solution in Inputtie is to use NativeProcess from AIR to communicate with a small headless (no user-interface) Java process that does the broadcasting and listening for broadcasts. Once the Java process detects an incoming broadcast it passes the information back to AIR.

**EDIT:** If anyone is interested in seeing the source to my previous (failed)Â attemptÂ just drop me a comment or an email and I would be happy to share.
