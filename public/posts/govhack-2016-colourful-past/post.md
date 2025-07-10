---
coverImage: /posts/govhack-2016-colourful-past/cover.jpg
date: '2016-08-01T07:22:09.000Z'
tags:
  - ai
  - data
  - govhack
  - hackathon
  - machine learning
title: Govhack 2016 - Colourful Past
oldUrl: /colourful-past/govhack-2016-colourful-past
---

Wow, I cant believe its been one whole year since [the last Govhack](https://www.mikecann.blog/portfolio/projects/govhack-2015-should-i-drive/), the hackathon where groups of people use government data to hack together a project over the course of a weekend.

<!-- more -->

I had a great time last year on the "[Should I Drive?](https://www.mikecann.blog/portfolio/projects/govhack-2015-should-i-drive)" team. We used WA Main Roads and other data sources to try to answer the question "should I drive to my destination or take some other form of transport?".

This year I set myself a goal. I wanted to do something to do with Machine Learning / AI. Its a field of computing thats really hot right now and im really interested in getting involved and learning more.

So as with [last year](https://www.mikecann.blog/portfolio/projects/govhack-2015-should-i-drive), after a brief welcome presentation by the organizers, competitors were invited to take the microphone and pitch ideas. Off-stage the pitchers then threw together a quick poster with their main ideas.

[![2016-07-29 18.52.00](https://www.mikecann.blog/wp-content/uploads/2016/08/2016-07-29-18.52.00-1024x768.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/2016-07-29-18.52.00.jpg)

There were a coupple of interesting ones but the one that really caught my attention was from a guy who wanted to apply Machine Learning to old historic photographs. After a brief discussion with him around his poster I immediately signed up. 20 minutes later we had a team and were heading off upstairs to find a quiet area of the (awesome) [Flux co-working space](https://www.fluxperth.com/) where Govhack was being held this year.

In total we had 8 members, 3 technical and 5 non-technical. That first evening was mostly spent planning who was going to do what and what the priorities were. The three of us technical people sketched out our plan and divvied up the work so that we were all working efficiently.

[![3tech](https://www.mikecann.blog/wp-content/uploads/2016/08/3tech-1024x683.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/3tech.jpg)

I took the front-end website and backend node host / API while Dominic took the Python code which would interface with the various data sets and Houraan did the code which would apply the Machine Learning to the images returned from the data sets.

[![theplan](https://www.mikecann.blog/wp-content/uploads/2016/08/theplan-1024x683.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/theplan.jpg)

With the plan sorted I knew I had a bunch of work to get done before the non-technical people could get their hands on something to use and experiment with. With that in mind I decided to get up really early (4am) on Saturday morning and start work on the site. Im glad I did as it took me most of the morning to get the shell of an app up and running using ReactJS with Typescript and a NodeJS backend hosted on Heroku (such is the way with modern Javascript).

[![chrome_2016-08-01_12-54-14](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_12-54-14-1024x830.png)](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_12-54-14.png)

When I arrived at Flux later that morning, I demoed my progress and we discussed the scope of the project. The original idea was to produce videos from several photos in a sort of slideshow but after some discussion we decided to narrow the scope so that we were more likely to finish it in time. We decided that if we could just take old photos and apply ML to "Colourise" them then would be a cool way to explore the past using a modern technique.

With the scope of the project resolved, our next task was to come up with a name for it. One of our non-technicals Karl came up with "Colourful Past", we all agreed that it fit the scope and described the project perfectly.

The rest of the day was spent furiously hacking away on various facets of the project.

We setup a [Trello Board](https://trello.com/b/en3HeDLx/colourful-past) to manage tasks and a place to store links and other information about the project.

[![chrome_2016-08-01_13-04-34](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_13-04-34-1024x804.png)](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_13-04-34.png)

We used [Slack](https://slack.com/) for general communications and link sharing when we couldnt just shout across the table.

[![slack_2016-08-01_13-48-55](https://www.mikecann.blog/wp-content/uploads/2016/08/slack_2016-08-01_13-48-55-1024x718.png)](https://www.mikecann.blog/wp-content/uploads/2016/08/slack_2016-08-01_13-48-55.png)

Source code was uploaded to our github org [https://github.com/colourful-past](https://github.com/colourful-past):

![chrome_2016-08-01_15-40-43](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_15-40-43.png)

In general things went really smoothly. The technical side worked really well, we were able to work efficiently independently then combine the results towards the end. On the non-technical side there few a few issues managing tasks, keeping everyone working all the time but in general we were able to work effectively together.

By the end of the first day we had a basic but working product. You could type in a search term such as "Anzac Day", the client would then send an API request to the NodeJS server which would then in parallel call a number of Python scripts to query various datasets, the results were then aggregated and returned to the client.

![chrome_2016-08-01_14-28-58](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_14-28-58.png)

The user could then click a button to "Colourise" the black and white image. This makes another call to NodeJS which calls another Python script which uses a Machine Learning model developed by UC Berkeley and trained on 1.3 million black and white images to generate a coloured version of our historic photograph. The resulting image is stored in S3 and the URL returned to the client.

![chrome_2016-08-01_14-35-48](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_14-35-48.png)
(above image is just a placeholder and was not generated by the AI)

After I left on the Saturday evening, to get some needed sleep, Houraan soldiered on and gave the site some much needed design love. When I woke in the morning the site looked much improved, Houraan had done a phenomenal job.

![chrome_2016-08-01_14-41-27](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_14-41-27.png)

![chrome_2016-08-01_14-42-59](https://www.mikecann.blog/wp-content/uploads/2016/08/chrome_2016-08-01_14-42-59.png)

Sunday was our final day and we spent the first half adding the last bit of polish to the site, such as a really cool subtle gradient effect on the text:

![2016-08-01_14-48-13](https://www.mikecann.blog/wp-content/uploads/2016/08/2016-08-01_14-48-13.gif)

Then we concentrated on the presentation and video which the judges will be using later that day. Molly did a great job putting together our video which was uploaded to Youtube at the very last minute:

<iframe width="853" height="480" src="https://www.youtube.com/embed/kuNnUWMXwXs" frameborder="0" allowfullscreen></iframe>

The presentation worked a little different from last year. Instead of everyone getting up on a stage and doing a slideshow in front of the judges, the judges came round to each team's desk where we did a demo and a short talk before being asked a number of questions. Houraan, Karoline and Bruce nailed it for us while the rest of us watched and gave moral support.

[![2016-07-31 15.33.01](https://www.mikecann.blog/wp-content/uploads/2016/08/2016-07-31-15.33.01-1024x862.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/2016-07-31-15.33.01.jpg)
(We had a little spare time so we thought we would play on the "Colourful" aspect of our product a little by blowing up some balloons, producing a poster and dressing in bright colours)

All in all it went really well and im very happy with the result. The judges seemed to think so too as we came away with a 1st prize in the "West Australian Community Prize" category.

[![2016-07-31 19.33.43](https://www.mikecann.blog/wp-content/uploads/2016/08/2016-07-31-19.33.43-1024x768.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/2016-07-31-19.33.43.jpg)

Well thats just about it. If you want to have a look at what we produced you can try it out at [https://colourfulpast.org/](https://colourfulpast.org/). We dont know how long we are going to be able to keep the expensive AWS GPU instances going for so if you are viewing this post some time from now it might not work for you.

I just want to say a massive thanks to all my team-mates for making it an awesome weekend of fun hacking, thanks guys, I hope you see you all next year!

[![IMG_0389](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0389-300x200.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0389.jpg)[![IMG_0455](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0455-300x200.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0455.jpg)[![IMG_0436](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0436-300x200.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0436.jpg)[![IMG_0395](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0395-300x200.jpg)](https://www.mikecann.blog/wp-content/uploads/2016/08/IMG_0395.jpg)

(P.S. Big thanks to Karl for taking all the pictures!)
