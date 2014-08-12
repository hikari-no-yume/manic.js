What's this?
============

![displaying a partial world and the debug log](https://raw.githubusercontent.com/TazeTSchnitzel/manic.js/master/screenshot4.png)

A Minecraft Classic client written in JavaScript, utilising WebSocket (Classic speaks TCP, so a WebSocket-TCP bridge is needed) with Typed Arrays for communication and map parsing, [three.js](http://threejs.org) for 3D graphics, and [zlib.js](https://github.com/imaya/zlib.js) for map decompression.

How do I use it?
================

Start up a local web server pointed at `/htdocs`. I like using PHP 5.4's built-in webserver:

    $ cd htdocs
    $ php -S localhost:8000

Next, you'll need to run a Minecraft server. I'm using the [official Minecraft Classic server](https://minecraft.net/classic/list) which is long-outdated and can't even send heartbeats these days, but it's a good compatibility test. It is started like so:

    $ java -Xms512M -Xmx512M -cp minecraft-server.jar com.mojang.minecraft.server.MinecraftServer
    
Make sure you disable heartbeats and name protection in `server.properties`:

    public=false
    verify-names=false

Finally, we use a WebSocket-to-TCP bridge. I'm using the, quite frankly, rubbish [ws-tcp-bridge](https://github.com/andrewchambers/ws-tcp-bridge) which has a habit of crashing whenever it loses connection. Still, good enough for local testing. It can used like this to proxy localhost WebSocket traffic on port 25566 (currently the hard-wired server in the client) from the TCP Minecraft Classic server port 25565:

    $ ws-tcp-bridge --lport 25566 --rhost localhost:25565 --method ws2tcp
    
OK, but is it worth using?
==========================

No, not really just now. It'll display at quite poor FPS (limited optimisation) a portion of the Minecraft world, and you can move around it, but it ignores most packets (it doesn't even display players) and your only way to communicate is by the console. But hey, we're getting there!

Why is it called manic.js?!
===========================

It's a reference to [Manic Digger](http://manicdigger.sourceforge.net/), an open-source Minecraft Classic clone, of course. Since Notch objected, the Classic-compatible mode was disabled by default, but it's easy to re-enable by compiling Manic Digger yourself. (Shhh, don't tell Notch!)