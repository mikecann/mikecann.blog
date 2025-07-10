---
coverImage: /images/fallback-post-header.png
date: "2010-02-22T00:06:58.000Z"
tags:
  - air
  - component
  - flash
  - mxml
  - projects
  - resize
  - source
title: Resizeable Chromeless Window AIR
oldUrl: /mxml/resizeable-chromeless-window-air
---

Thought I would share this little ditty. Been working in AIRÂ recentlyÂ and decided to make the window "chromeless" which means there are no controls so no resizing.

Thankfully however adobe provide the tools to allow for resizing the native window. So I produced this little mxml component to let you resize the window:

<!-- more -->

[![](https://www.mikecann.blog/wp-content/uploads/2010/02/ScreenHunter_02-Feb.-21-21.40.gif "ScreenHunter_02 Feb. 21 21.40")](https://www.mikecann.blog/wp-content/uploads/2010/02/ScreenHunter_02-Feb.-21-21.40.gif)

TheÂ colouredÂ edges indicate where the application is draggable, including the white corner areas.

The component that lets you do this is pretty simple:

```

<?xml version="1.0" encoding="utf-8"?>
<s:Group xmlns:fx="https://ns.adobe.com/mxml/2009"
xmlns:s="library://ns.adobe.com/flex/spark"
xmlns:mx="library://ns.adobe.com/flex/halo">

<fx:Script>
<![CDATA[
import flash.display.NativeWindowResize;
import flash.events.MouseEvent;

import mx.managers.CursorManager;
public static const RESIZE_AREA : int = 10;

protected function onRollOver(event:MouseEvent):void
{
}

protected function onRollOut(event:MouseEvent):void
{
}

protected function onMouseDown(event:MouseEvent):void
{
var grp : Group = event.target as Group;
var resizeFrom:String = "";

if (grp==topSide){ resizeFrom=NativeWindowResize.TOP; }
else if (grp==rightSide) { resizeFrom=NativeWindowResize.RIGHT; }
else if (grp==bottomSide) { resizeFrom=NativeWindowResize.BOTTOM; }
else if (grp==leftSide) { resizeFrom=NativeWindowResize.LEFT; }
else if (grp==topLeft) { resizeFrom=NativeWindowResize.TOP_LEFT; }
else if (grp==topRight) { resizeFrom=NativeWindowResize.TOP_RIGHT; }
else if (grp==bottomRight) { resizeFrom=NativeWindowResize.BOTTOM_RIGHT; }
else if (grp==bottomLeft) { resizeFrom=NativeWindowResize.BOTTOM_LEFT; }
else { return; }

stage.nativeWindow.startResize(resizeFrom);
}

]]>
</fx:Script>

<s:Group id="topSide" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="0" y="0" width="{width}" height="{RESIZE_AREA}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0xFF0000" />
</s:fill>
</s:Rect>
</s:Group>

<s:Group id="rightSide" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="{width-RESIZE_AREA}" y="0" width="{RESIZE_AREA}" height="{height}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0x00FF00" />
</s:fill>
</s:Rect>
</s:Group>

<s:Group id="bottomSide" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="0" y="{height-RESIZE_AREA}" width="{width}" height="{RESIZE_AREA}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0x0000FF" />
</s:fill>
</s:Rect>
</s:Group>

<s:Group id="leftSide" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="0" y="0" width="{RESIZE_AREA}" height="{height}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0x000000" />
</s:fill>
</s:Rect>
</s:Group>

<s:Group id="topLeft" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="0" y="0" width="{RESIZE_AREA}" height="{RESIZE_AREA}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0xffffff" />
</s:fill>
</s:Rect>
</s:Group>

<s:Group id="topRight" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="{width-RESIZE_AREA}" y="0" width="{RESIZE_AREA}" height="{RESIZE_AREA}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0xffffff" />
</s:fill>
</s:Rect>
</s:Group>

<s:Group id="bottomRight" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="{width-RESIZE_AREA}" y="{height-RESIZE_AREA}" width="{RESIZE_AREA}" height="{RESIZE_AREA}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0xffffff" />
</s:fill>
</s:Rect>
</s:Group>

<s:Group id="bottomLeft" rollOver="onRollOver(event)" rollOut="onRollOut(event)" mouseDown="onMouseDown(event)"
x="0" y="{height-RESIZE_AREA}" width="{RESIZE_AREA}" height="{RESIZE_AREA}">
<s:Rect width="100%" height="100%">
<s:fill>
<s:SolidColor color="0xffffff" />
</s:fill>
</s:Rect>
</s:Group>

</s:Group>

```

To use it in your app just add the component into your existing view somewhere:

```

<?xml version="1.0" encoding="utf-8"?>
<s:SkinnableContainer xmlns:fx="https://ns.adobe.com/mxml/2009" xmlns:s="library://ns.adobe.com/flex/spark" xmlns:mx="library://ns.adobe.com/flex/halo">

<components:WindowResizer width="{width}" height="{height}" alpha="0" buttonMode="true" />

</s:SkinnableContainer>

```

Setting the alpha to zero will obviously hide the coloured areas at the side of the window.

Grab the mxml here: [WindowResizer.mxml](https://www.mikecann.blog/Files/WindowResizer.mxml)
