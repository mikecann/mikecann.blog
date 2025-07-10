---
coverImage: /images/fallback-post-header.png
date: '2010-08-02T08:25:14.000Z'
tags:
  - behaviour
  - code
  - expected
  - flex4
  - group
  - programming
  - rollover
  - spark
  - video
title: Flex 4 Spark & Rollover Group Containing Rect
oldUrl: /actionscript/flex-4-spark-rollover-group-containing-rect
---

Was working on my top-secret Flex-based project over the weekend when I discovered something IÂ hadn'tÂ comeÂ acrossÂ before.

<!-- more -->

The issue is that when you have a Spark Rect GraphicsElement within a Spark Group it seems that the rollover event of the group is triggered even though the mouseÂ doesn'tÂ roll over the Rect.

Here is a video I made to explain my issue on Twitter:

<iframe width="100%" height="400" src="https://www.youtube.com/embed/9Ku4xY7vfyw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The code in the video is as follows:

```

<s:WindowedApplication xmlns:fx="https://ns.adobe.com/mxml/2009"
xmlns:s="library://ns.adobe.com/flex/spark"
xmlns:mx="library://ns.adobe.com/flex/mx">

    <s:Group rollOver="trace('ya')">
    	<s:Rect x="100" y="100" width="20" height="20">
    		<s:fill>
    			<s:SolidColor color="0x00ff00" />
    		</s:fill>
    	</s:Rect>
    </s:Group>

</s:WindowedApplication>

```

It turns out (after [posting the issue on the Adobe Forums](https://forums.adobe.com/message/3017631#3017631)) that I was simply missing the "mouseEnabledWhereTransparent" property on the Group. Setting it to false causes the mouse to perform a hit-test rather than a simple bounds check. Thank you Mr Shongrunden for pointing this out to me :)

So this now works:

```

<s:WindowedApplication xmlns:fx="https://ns.adobe.com/mxml/2009"
   xmlns:s="library://ns.adobe.com/flex/spark"
   xmlns:mx="library://ns.adobe.com/flex/mx">

	<s:Group rollOver="trace('ya')" mouseEnabledWhereTransparent="false">
		<s:Rect x="100" y="100" width="20" height="20">
			<s:fill>
				<s:SolidColor color="0x00ff00" />
			</s:fill>
		</s:Rect>
	</s:Group>

</s:WindowedApplication>

```

I hope this helps someone else out!
