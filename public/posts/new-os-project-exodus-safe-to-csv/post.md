---
coverImage: ./header.jpg
date: '2018-04-22T14:51:40.000Z'
tags:
  - open source
  - programming
  - typescript
  - cryptocurrency
  - bitcoin
  - exodus
title: New OS Project - exodus-safe-to-csv
oldUrl: /programming/new-os-project-exodus-safe-to-csv
---

Just a quick one today, I thought I would share a little tool I wrote to help with converting data exported from Exodus to be used in CoinTracking.com.

<!-- more -->

For a while I have been dabbling in Crypto currency trading. To manage all my trades and currencies I like to use [CoinTracking.com](https://cointracking.info).

CoinTracking has a wide range of data import options including one to import from my favourite crypto wallet [Exodus](https://www.exodus.io/). Unfortunately the process is rather laborious as you first must export each coin individually from Exodus then import each one individually.

I noticed today that Exodus has an option to export a "SAFE" report. This is a zip file that contains a bunch of info dumped from Exodus and is supposed to be used by Exodus support to debug issues in the wallet.

I cracked open the zip and noticed that all the transaction histories for all the coins were included, great, that will save me a bunch of work when importing back into CoinTracking. Unfortunately the exported transactions are in JSON format but CoinTracking expects CSV.

So I decided to crack open VS code and cook up a quick npm library to help me convert from the JSON to CSV for CoinTracking.

So here it is: https://github.com/mikecann/exodus-safe-to-csv

A nice and neat simple tool to convert from Exodus' SAFE report to a bunch of CSV documents for consumption in CoinTracking.
