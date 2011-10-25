[Integralist](http://www.integralist.co.uk/) - MVC Start-up Kit
================================

Description
-----------

Basic JavaScript implementation of the classic MVC design pattern.

I found that full scale frameworks such as JavaScriptMVC, Backbone and Spine are great in the sense that they give you a lot of functionality, but I personally found them to be:

* really confusing (especially if you're trying to learn about MVC on the client-side)
* force you to use a particular architecture that you're not used (and 'for me' the majority of the time feels very alien)

So in typical programmer fashion, I decided to 'roll my own' (once I have this in a more stable state then I'll write up an article about it all).

Goals
-----

* Very simple/logical folder structure (I don't like complicated set-ups)
* Modular (via the use of RequireJs and the AMD proposal - if you're new to AMD or RequireJs then this will help: http://integralist.co.uk/post/11705798780/beginners-guide-to-amd-and-requirejs)
* Easy to understand (I heavily comment my code, knowing full well comments can be stripped at 'deployment' via a build script - again see RequireJs optimiser in above article link)
* Try to wrap certain implementations features so it becomes easier to swap out the implementation for your own or another library

TODO
----

I've only just started working on it so there is LOTS to do still...

* Add timed Array to updateView method (and use Deferred/Promises to handle asynchronous processing)
* Work on basic template engine
* I need to look into using Observer design pattern as a way for the Model to publish events and for the Views to subscribe to these.
* +many other things I've not yet considered that will come back and bite me in the ass!