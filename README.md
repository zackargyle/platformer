platformer
==========

Framework for a platformer style javascript game


Current usage:

1. Set up sprite 
```
Platformer.setupSprite(x, y, width, height, "images/dude-left.png", "images/dude-right.png", "images/dude-jumping.png");
```

2. Register canvas and class used to identify collision objects
```
Platformer.setupCanvas(canvasId, collisionId);
```

3. Start game

```
Platformer.start();
```

Any html element with the collisionId can be interacted with by the sprite.
If you add the attribute 'move' to any element, it will move back and forth horizontally.

see www.zackargyle.com for an example.

FUTURE ADDITIONS:
 - Shifting background with movement
 - Enemies
 - Parallax scrolling
