---
coverImage: /images/fallback-post-header.png
date: '2007-05-06T20:41:25.000Z'
tags: []
title: TDProject BlueprintStore and BlueprintEditor
oldUrl: /c/tdproject-blueprintstore-and-blueprinteditor
---

![](https://www.mikecann.blog/Work/TDProject/engine03.png)

Today I added the BlueprintStore and the BlueprintEditor.

<!-- more -->

Firstly the BlueprintStore has two halfs to it. On the left hand side you have a list of "library blueprints" these are loaded from an XML document. Library blueprints can then be dragged over to the second half which is where all the blueprints that are used in the map are stored.

If you select a blueprint you can then click a button to open the BlueprintEditor. The editor is a separate window with a rotating view of the current model for the blueprint and on the right is a property grid that lets the user edit any number of properties a blueprint has.

So you can see that when a user creates a map they are going to require blueprints. Blueprints can be anything from creeps, towers, trees, houses, anything. Blueprints are the actual objects that that you place in the world and interact with.

Tomorrow will be more work on the blueprint editor me thinks :D

Mike
