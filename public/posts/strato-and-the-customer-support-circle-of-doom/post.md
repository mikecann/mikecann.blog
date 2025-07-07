---
coverImage: /images/fallback-post-header.png
date: "2012-10-16T18:32:26.000Z"
tags:
  - blog
  - hosting
  - rant
  - strato
title: STRATO and the Customer-Support-Circle-of-Doom
oldUrl: /photos-personal/strato-and-the-customer-support-circle-of-doom
openAIMikesBlogFileId: file-iJGLfYVqT1eFNkwArh395E7f
---

[/wp-content/uploads/2012/10/screenshot_021.png](https://www.mikecann.blog/wp-content/uploads/2012/10/screenshot_021.png)

Why is it so hard to find a good web hosting company?

<!-- more -->

About [one year ago I announced](/posts/new-blog-host-face-lift/) that I moved hosting from WebFusion over to STRATO in the hopes for higher reliability. This was indeed the case for almost a year. I had no problems, until...

Three weeks ago my blog started to suffer problems, as is clear from my analytics data on one of the domains:

[/wp-content/uploads/2012/10/screenshot_05.png](https://www.mikecann.blog/wp-content/uploads/2012/10/screenshot_05.png)

The traffic drops off from normal levels down to nothing in the space of about a week. I was away the start of the month (more on this in a later blog post) and thus wasn't checking the domain. Its only when I received an email from someone informing me about the fact my blog was down that I sat up and took notice.

I immediately tried to access the domains in Chrome but I got timeout for each one. I then tried to remote into my VM. Timeout there too. I then tried hard-resetting the machine from the Strato console, no luck there.

With no other options I decided to call my hosting provider STRATO. It turns out however that their call centres aren't open at the weekend _sigh_ so I sent them a mail:

> Hi
>
> A visitor reported that my site was down: [https://www.mikecann.blog/](https://www.mikecann.blog/). I cant access it either. I have tried to remote into my VM but it wont connect. I have logged into the Strato backend and tried to reboot my machine. It says it has rebooted, but I still cant login or access my site.
>
> Can you help please.
>
> Mike
> Two days later I get the following reply:
> Dear Mr. Cann,
>
> Thank you very much for your enquiry to which I am glad to respond.
>
> I can see that the server is up and running , If you are using Plesk please check the domain setting in plesk. If you cannot reach plesk please  work through the following FAQ Article ID: 1360.
>
> Your opinion about our Customer Service is very important to us! Please take some time for our questionnaire - so we can respond even better to your needs in the future. The completion of the form takes only about 3 minutes.
>
> Link to the rating system: [https://www.strato-mailcenter.com/quality?ident=bd391e7c-3c076f-13f18d-47938a-aaafba](https://www.strato-mailcenter.com/quality?ident=bd391e7c-3c076f-13f18d-47938a-aaafba)
>
> With kind regards from Berlin,
>
> xxx xxx
>
> STRATO Customer Care
> Well clearly they hadn't actually read my mail and checked that the domain isn't up (this is the main domain associated with my account) they also haven't tried to login to the box else they would have encountered the same issue.

So after some email jousting back and forth and some experimentation with STRATO's non-functioning recovery console I get the following reply:

> Dear Mr. Cann,
>
> Thank you very much for your enquiry to which I am glad to respond.
>
> I have taken your server out of the recovery mode for you .**You server could also be slow as it is affected my some major maintenance**
>
> **that is also going on at the moment on our windows servers, which could be causing your server to run slow at the moment  , I cannot give you a time frame when this will be completed as i do not have one myself.**
>
> Your opinion about our Customer Service is very important to us! Please take some time for our questionnaire - so we can respond even better to your needs in the future. The completion of the form takes only about 3 minutes.
>
> Link to the rating system: [https://www.strato-mailcenter.com/quality?ident=bd391e7c-39a316-13f846-44189a-8050db](https://www.strato-mailcenter.com/quality?ident=bd391e7c-39a316-13f846-44189a-8050db)
>
> With kind regards from xxxx xxxx
>
> STRATO Customer Care
> (Bold added by me)

Okay... I thought to myself... I have just been led round the houses for two days emailing back and forth when only just now they tell me they are having some major maintenance issues, why not tell me that from the start? In fact, more to the point,  why are you performing maintenance, without telling me, that has taken my box down for a week?

I decide at this point, its a good idea to give them a call and find out what is going on. Eventually I get put through to X. X at first tells me that he cannot give me the reason for the maintenance nor how long it will last. I get pretty insistent at this point that I should be told why the service that im paying for is not working. Eventually he relents and tells me it is to do with their licensing for windows.

X explains to me that when Microsoft license the Windows OS to hosting companies they create a child license from their master license. Strato as one of these hosting companies then creates further child licenses for its customers. Apparently something has gone wrong with the master license at Microsoft which has caused every single other license that has been created from it to become invalid.

X explained to me that every single Windows VM that STRATO hosts is down. Not only that, every single Windows VM in the world is down because of this master license issue. I was understandably dubious at this as I would have heard something in the tech-news or blogosphere. I decided however to give him the benefit of the doubt as he sounded honest and it took some persuading to get this information out of him that it must be true.

Before hanging up I pointed out to X that STRATO should have sent an email to its customers to inform them of the problem. At the very least there should have been a press release or something on their homepage to inform people of the outage. X agreed whole heartedly with this and suggested that I send in a complaint detailing all of what had happened thus far, so I do just that.

I get the following reply a day later:

> Dear Mr. Cann,
>
> Thank you very much for your enquiry to which I am glad to respond.
>
> We're aware of the issue where users are unable to connect to their STRATO Windows Servers. Our technical teams has been notified and we expect this resolved by the end of the week. We have raise a credit amount of £10, and it will be paid to your credit card in the next few days.
>
> I will contact you around noon to answer any questions you may have regarding this issue
>
> We appreciate your patience, and apologize for the inconvenience caused.
>
> Your opinion about our Customer Service is very important to us! Please take some time for our questionnaire - so we can respond even better to your needs in the future. The completion of the form takes only about 3 minutes.
>
> Link to the rating system: [https://www.strato-mailcenter.com/quality?ident=bd391e7c-a2fc8d-13fff2-44cee9-a53fb3](https://www.strato-mailcenter.com/quality?ident=bd391e7c-a2fc8d-13fff2-44cee9-a53fb3)
>
> With kind regards from Berlin,
>
> xxxx xxxx
>
> STRATO Customer Care
> Okay so it will be ready by the end of the week. I decided to hang on and see what happened.

What happened? Exactly nothing, I was obviously a little angry at this point:

> Hello,
>
> So as its now the end of the week. You promised that my VM will be back up again but low and behold its still not up! Also have you decided not to reply to me any more?
>
> I need a snapshot of my data so I can move my hosting from strato. I also would like the email address of your supervisor so I can speak to them about this.
>
> Mike
> Two days later I get the following:
> Good Morning Mr. Cann,
>
> Thank you very much for your enquiry to which I am glad to respond.
>
> After looking at your contract, I have seen that your sever has been up and running since Saturday [13.10.2012](tel:13.10.2012).
>
> If you would still like me to cancel the Server, this is not a problem. I would therefore need to you to confirm this for me in a reply to this e-mail.
>
> If you do wish to keep your server, you will be able to start ordering your domains within the customer service area.
>
> Once again, I would like to apologise in the setup delay that you experienced.
>
> If there is anything else that I can do for you Mr Cann, please feel free to let me know!
>
> I would therefore like to take this opportunity to wish you a pleasant and successful working day!
>
> Your opinion about our Customer Service is very important to us! Please take some time for our questionnaire - so we can respond even better to your needs in the future. The completion of the form takes only about 3 minutes.
>
> Link to the rating system: [https://www.strato-mailcenter.<wbr>com/quality?ident=bd391e7c-c8411a-140d93-40f3ee-9f18a5](https://www.strato-mailcenter.com/quality?ident=bd391e7c-c8411a-140d93-40f3ee-9f18a5)
>
> With kind regards from Berlin,
>
> xxxx xxxx
> WHAT?!??! Setup delay? Im not setting anything up! I have been with STRATO over a year! Its been up since Saturday, no it bloody hasnt! Its clearly not up now! WTF?

I realised that I was trapped in a customer-support-circle-of-doom.

Well that's about the point I decided this company really doesn't care about its customers so im going to move to another hosting provider.

So short of the long, my sites are now being hosted on 1 & 1 and everything seems to be fine and dandy. Sure it costs twice as much but hopefully that money will ensure a better level of service.

Oh one more thing, apparently STRATO have won awards for their customer service:

[/wp-content/uploads/2012/10/screenshot_06.png](https://www.mikecann.blog/wp-content/uploads/2012/10/screenshot_06.png)

_sigh_

/rant
