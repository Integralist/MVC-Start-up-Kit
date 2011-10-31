[Integralist](http://www.integralist.co.uk/) - MVC Start-up Kit
================================

Description
-----------

Basic JavaScript implementation of the classic MVC design pattern.

I found that full scale frameworks such as JavaScriptMVC, Backbone and Spine are great in the sense that they give you a lot of functionality, but I personally found them to be:

* really confusing (especially if you're trying to learn about MVC on the client-side)
* force you to use a particular architecture that you're not used (and 'for me' the majority of the time feels very alien)

So in typical programmer fashion, I decided to 'roll my own' (once I have this in a more stable state then I'll write up an article about it all).

I find this start-up kit gets me up and running very quickly utilising the MVC paradigm without loads of extra cruft I'm never going to use.

Goals/Features
--------------

* Very simple/logical folder structure (I don't like complicated set-ups)
* Modular (built to comply with the AMD specification and uses RequireJs - if you're new to AMD or RequireJs then this post will help explain: http://integralist.co.uk/post/11705798780/beginners-guide-to-amd-and-requirejs)
* Basic template engine.
* Publisher/Subscriber event system.
* Utilises Deferred/Promises for asynchronous tasks.
* Easy to understand (I heavily comment my code, with the understanding that comments will be stripped at deployment via a 'build script'. See the RequireJs optimiser information in the above article link)
* Tried to wrap certain implementations features so it becomes easier to swap out the implementation for your own or another library
* Tried to keep a balance between static features/methods/properties (i.e. those that appear on all instances of a Controller) and instance specific features/methods/properties (this was so to help automate as much of the standard set-up as possible).
* Two versions - one jQuery (as it makes this repo more appealing - I'm guessing - to jQuery users) and one which is library agnostic (I'm only using jQuery for: Simple PubSub + Deferred/Promises + basic event handling so is simple to swap out)

TODO
----

There is still bits and pieces I need to work on...

* Make a library agnostic version (e.g. no jQuery) - this wont take long I just need to find the time.