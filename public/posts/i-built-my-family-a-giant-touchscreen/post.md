---
coverImage: ./header.jpg
date: "2026-08-06T07:31:40.000Z"
tags:
  - cannvas
  - hardware
  - raspberry pi
  - convex
  - video
title: I built my family a giant touchscreen
---

For the past few weeks I have been tinkering with a replacement for my old [Smart Mirror](/posts/mikes-mirror-overview). As these things tend to do, it got a little out of hand.

The result is Cannvas: a 40-inch portrait touchscreen that acts as a home hub for our family.

<!-- more -->

Rather than turn this into a monster post, I made a video about the whole thing. It covers the hardware, the mistakes I made along the way and the custom software now running our whiteboard, calendar, chores, todos and other family bits and pieces.

<iframe width="853" height="480" src="https://www.youtube.com/embed/ubRYvl4gfGE" title="I built my family a giant touchscreen" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## A few build notes

- The touchscreen is just an infrared frame attached to the front of a normal TV. It connects over USB and works as a standard multitouch device in Linux.
- The display runs a React, TypeScript and Vite app inside Chromium's kiosk mode on a Raspberry Pi 5.
- I used the 8GB Pi because I already owned it, not because Cannvas needs that much memory.
- The acrylic protects the TV from enthusiastic little fingers, but if I built it again I would look more closely at using glass or perhaps no protective layer at all.

## Bill of materials

These are the prices I paid, or replacement estimates for parts I already owned, in Australian dollars:

| Part                                                                                                         | Cost         |
| ------------------------------------------------------------------------------------------------------------ | ------------ |
| [FFALCON FF40S55 40-inch TV](https://www.thegoodguys.com.au/ffalcon-40-inches-full-hd-smart-tv-2025-ff40s55) | A$279.00     |
| TaiTouch 40-inch IR touch frame, delivered                                                                   | A$147.06     |
| [Bunnings acrylic sheet](https://www.bunnings.com.au/search/products?q=acrylic%20sheet)                      | A$89.43      |
| [LINDEN tilt wall mount](https://www.thegoodguys.com.au/linden-tilt-wall-mount-medium-ltwmm24)               | A$69.00      |
| [Raspberry Pi 5 8GB setup](https://core-electronics.com.au/raspberry-pi-5-model-b-8gb.html)                  | A$322.52     |
| USB and power cables and adaptors                                                                            | A$32.93      |
| **Total value of parts used**                                                                                | **A$939.94** |

I also spent A$109.90 on a gas-assisted wall mount that turned out to be unsuitable, bringing the all-in project total shown in the video to A$1,049.84. Because I already owned the Pi setup, the actual extra cost excluding that mistake was A$617.42.
