---
coverImage: >-
  /posts/unity-ash-a-different-way-of-thinking-about-making-games-in-unity/cover.jpg
date: '2015-10-30T05:45:00.000Z'
tags:
  - architecture
  - c sharp
  - entity
  - framework
  - game
title: Unity Ash - A different way of thinking about making games in Unity
oldUrl: /programming/unity-ash-a-different-way-of-thinking-about-making-games-in-unity
openAIMikesBlogFileId: file-BrE3Cm76gt4lzurksqaM5WQi
---

[Over a year ago](https://www.mikecann.blog/portfolio/projects/unity-ashteroids-ash-framework-in-unity/) I decided to scratch an itch and see if I could get Richard Lord's Ash framework to work in Unity. It actually turned out to be far easier than I had imagined. A few people contacted me as they wanted to use it for production games so I decided to do [a little more work on it a few months later](https://www.mikecann.blog/programming/unity-ash-upgrades/) to fix some of the easily solved issues with my quick port.

<!-- more -->

Unfortunately I lacked any spare time to work on it until now. This week I spent 3 days rewriting the framework from scratch. I improved many things, making it much more Unity-friendly, and generally easier to use. Because of the differences from the AS3 version of Ash I now describe it as "heavily inspired" rather than a port.

<!--more-->

Before I go into too much detail about the differences from [Richard's AS3 version](https://www.ashframework.org/) I should briefly explain Ash and how it differs and extends upon Unity's Enity / Component architecture.

## TL; DR

Checkout the Unity-Ash src: [https://github.com/mikecann/Unity-Ash](https://github.com/mikecann/Unity-Ash) and the example game: [https://github.com/mikecann/UnityAshteroids](https://github.com/mikecann/UnityAshteroids)

## Entity / Components in Unity

Unity is an Entity / Component game engine. This means that instead of having classes for object types such as Spaceship, Asteroid or Player which may extend some other classes you have Entities (Unity calls these GameObject's) which contain components that do the work.

![2015-10-30_09-48-45](https://www.mikecann.blog/wp-content/uploads/2015/10/2015-10-30_09-48-45.png)

This is a much better structure for game design as it favours composition over inheritance which prevents the common pitfall of the "[God Object](https://en.wikipedia.org/wiki/God_object)" when developing a game. By separating the concerns into differnt components you can reuse functionality by attaching components to Entities / GameObjects rather than extending a base class and overriding required functionality.

I won't go on any more about it, you can google the topic and find out plenty more.

## Entity / Components in Ash

Although Ash is an Entity / Component architecture, it differs quite fundamentally from Unity in how data and logic should be structured.

In Unity components typically extend MonoBehaviour and contain the variables and logic for that specific functionality. For example a simple Unity component may look something like:

[code lang="csharp"]
public class Bullet : MonoBehaviour
{
public float maxAge = 3;

    public float age;

    void Awake()
    {
    	age = 0;
    }

    void Update()
    {
    	age += Time.deltaTime;
    	if (age >= maxAge)
    		Destroy(gameObject);
    }

}
[/code]

Imagine that Bullet is a projectile fired from the player spaceship. We can see that the bullet ages over time and when it is equal or greater than the max age then it is removed from the game.

The Ash way of doing things is to separate the component data from its logic. So it may now look something like:

[code lang="csharp"]
public class Bullet : MonoBehaviour
{
public float maxAge = 3;
public float age;
}

public class BulletNode
{
public Entity Entity { get; set; }
public Bullet Bullet { get; set; }
}

public class BulletAgingSystem : ISystem
{
private INodeList<BulletNode> \_nodes;

    public void AddedToEngine(Engine engine)
    {
    	_nodes = engine.GetNodes<BulletNode>();
    }

    public void RemovedFromEngine(Engine engine)
    {
    	engine.ReleaseNodes(_nodes);
    }

    public void Update(float delta)
    {
    	foreach (var node in _nodes)
    	{
    		node.Bullet.age += delta;
    		if (node.Bullet.age >= node.Bullet.maxAge)
    			node.Entity.Destroy();
    	}
    }

}
[/code]

Here we can see that the Bullet's data is now separate from the logic which modifies that data. In Ash components should simple data, they can contain some methods but they should be limited to operating on the state of that instance, they certainty aren't allowed to have any dependencies on other components.

So instead of putting the logic with the data its been moved to a System. The system however may have dependencies on multiple components so it describes its dependencies by defining a structure, a "Node", in this case BulletNode. This class lists all the components an Entity must have before it can be used by the System.

What this means is that whenever an Entity (GameObject) is added or removed from the game the Ash Engine will automatically update the INodeList<BulletNode> with of all the Entities that match the required components specified in BulletNode.

If that all looks a little too verbose for you, one of the improvements I made in this rewrite of Unity-Ash was to provide a short-hand way of writing Systems in the form of the "NodelessSystem", so now the above example could look like:

[code lang="csharp"]
public class Bullet : MonoBehaviour
{
public float maxAge = 3;
public float age;
}

public class BulletAgingSystem : NodelessSystem<Bullet, Entity>
{
public BulletAgeSystem()
{
\_updateCallback = OnUpdate;
}

    private void OnUpdate(float delta, Bullet bullet, Entity entity)
    {
    	bullet.age += delta;
    	if (bullet.age >= bullet.maxAge)
    		entity.Destroy();
    }

}
[/code]

Now you may be thinking that's all well and good but it doesn't really improve things, you are just splitting the Monobehaviour up and adding more classes to the the game, which is true, but there are several benefits to working this way. One of those benefits becomes evident when you think about dependencies between components.

Suppose that we want to handle what happens when the player spaceship collides with an asteroid. We want to respawn the player somewhere but it would be a bit unfair if we respawned the player on top of an asteroid so we need to check that the new spawn location isn't too close to an Asteroid.

How would we go about this in Unity? Well one solution may look something like the following:

[code lang="csharp"]
public class Player : MonoBehaviour
{
private PlayerManager manager;

    void Awake()
    {
    	manager = FindObjectOfType<PlayerManager>();
    }

     void OnCollisionEnter2D(Collision2D coll)
     {
    	 var asteroid = hit.gameObject.GetComponent<Asteroid>();
         if (asteroid != null)
    	 	manager.PlayerHitByAsteroid(this);
     }

}

public class PlayerManager : MonoBehaviour
{
public void PlayerHitByAsteroid(Player player)
{
var asteroids = FindObjectsOfType<Asteroid>();

    	// Find a place to respawn the Player
    	var postion = UnityEngine.Random.insideUnitCircle*1000;
    	while (!IsClearToAddShip(position, asteroids))
    		postion = UnityEngine.Random.insideUnitCircle*1000;

    	player.transform.position.x = postion.x;
    	player.transform.position.y = postion.y;
    }

    private bool IsClearToAddShip(Vector2 newSpaceshipPosition, IEnumberable<Asteroid> asteroids)
    {
    	foreach (var asteroid in asteroids)
    		if (Vector2.Distance(asteroid.transform.position, newSpaceshipPosition) <= 1f)
    			return false;

    	return true;
    }

}
[/code]

Sure there are a few ways this could potentially be done but the point im trying to highlight is the way dependencies are handled in a typical Unity game. Usually we have managers which look after some part of the game and then we use FindObjectsOfType or Tags to get access to the entities in the system.

The ash way of doing it may looks something like:

[code lang="csharp"]
public class Player : MonoBehaviour
{
}

public class Collisions : MonoBehaviour
{
public List<Collision2D> hits = new List<Collision2D>();

    void OnCollisionEnter2D(Collision2D coll)
    {
    	hits.Add(coll);
    }

}

public class PlayerCollisionNode
{
public Player Player { get; set; }
public Collision Collision { get; set; }
public Transform Transform { get; set; }
}

public class AsteroidNode
{
public Asteroid Asteroid { get; set; }
public Transform Transform { get; set; }
}

public class PlayerCollisionSystem : ISystem
{
private INodeList<PlayerCollisionNode> \_players;
private INodeList<AsteroidNode> \_asteroids;

    public void AddedToEngine(Engine engine)
    {
    	_players = engine.GetNodes<PlayerCollisionNode>();
    	_asteroids = engine.GetNodes<AsteroidNode>();
    }

    public void RemovedFromEngine(Engine engine)
    {
    	engine.ReleaseNodes(_players);
    	engine.ReleaseNodes(_asteroids);
    }

    public void Update(float delta)
    {
    	foreach (var playerNode in _players)
    	{
    		foreach (var hit in playerNode.Collision.hits)
            {
    			var asteroid = hit.gameObject.GetComponent<Asteroid>();
                if (asteroid == null)
                    continue;

    			RespawnPlayer(playerNode);
    		}
    		_players.Collision.hits.Clear();
    	}
    }

    private void RespawnPlayer(PlayerCollisionNode node)
    {
    	var postion = UnityEngine.Random.insideUnitCircle*1000;
    	while (!IsClearToAddShip(position, asteroids))
    		postion = UnityEngine.Random.insideUnitCircle*1000;

    	node.Transform.position.x = postion.x;
    	node.Transform.position.y = postion.y;
    }

    private bool IsClearToAddShip(Vector2 newSpaceshipPosition)
    {
    	foreach (var asteroidNode in _asteroids)
    		if (Vector2.Distance(asteroidNode.Transform.position, newSpaceshipPosition) <= 1f)
    			return false;

    	return true;
    }

}
[/code]

Here we can see we have made the Collisions component generic so that it can be used by Asteroids, Bullets or whatever else requires collisions. Then we have a system that is specific to Player Collisions.

The PlayerCollisionSystem then gets references to the players and the asteroids and does the respawning logic.

Its important to realize that in Ash, Systems are not allowed to reference each other. They can only communicate by adding or removing entities / components or changing properties on those components. This may seem like a bit of a restriction at first but its really important to keep things separated and free from complex dependencies, as a side benefit it makes Unit Testing easier (more on that later).

## Single Point of Entry

So the final piece of the puzzle is how do these System's come together? What calls the AddedToEngine, RemovedFromEngine, and Update methods on the Systems?

Well this is another way that Ash differs from the typical Unity Game. Usually in a Unity MonoBehaviour you may add Awake() or Start() handlers which get triggered by Unity when the game starts up. The problem is that it makes it quite hard to know what order things are going to get initiated in. It also makes it really hard for a new coder to come to the project and understand how the project works.

In Ash you have a single entry point. So for example you may have something like:

[code lang="csharp"]
public class GameBoostrapper : MonoBehaviour
{
private EntityCreator creator;
private Engine engine;

    void Awake()
    {
    	creator = new EntityCreator();
    	engine = new Engine();

    	engine.AddSystem(new MenusSystem(), SystemPriorities.PreUpdate);
    	engine.AddSystem(new PlayerRespawningSystem(creator), SystemPriorities.PreUpdate);
    	engine.AddSystem(new LevelingSystem(creator), SystemPriorities.Update);
    	engine.AddSystem(new MotionControlSystem(), SystemPriorities.Update);
    	engine.AddSystem(new SpaceshipCollisionSystem(creator), SystemPriorities.ResolveCollisions);
    	engine.AddSystem(new HudSystem(), SystemPriorities.Animate);
    	engine.AddSystem(new AudioSystem(), SystemPriorities.Render);

    	creator.CreateGame();
    }

    void Update()
    {
    	engine.Update(Time.deltaTime);
    }

}  
[/code]

The Engine is the main control object for Ash. It holds a list of Systems which are updated each tick of the game.

The EntityCreator isn't an Ash specific class and is rather a helper class which is used to abstract out the creation of the entities from the business logic of the various systems (also important for the Unit Testing as we will see later).

There is one more piece I haven't mentioned yet. How is the Engine informed when Entities are added or removed from Unity? Well this is one of those places where Unity-Ash differs from AS3 Ash.

All GameObjects that should be picked up by the Ash Engine require that an "Entity" component be added to the GameObject:

![2015-10-30_11-57-09](https://www.mikecann.blog/wp-content/uploads/2015/10/2015-10-30_11-57-09.png)

The "Entity" represents an Entity in Ash but in Unity is actually a MonoBehaviour. It tells the Engine when the GameObject it is created and destroyed. One difference from my previous work on Ash is that if you want to add or remove components from a GameObject at runtime you should do it via the Entity directly so that it can inform the Engine:

[code lang="csharp"]
public interface IEntity
{
...
T Add<T>() where T : Component;
void Remove(Component component);
...
}
[/code]

This change was required to get around all the [performance problems related to checking for component changes each frame](https://www.mikecann.blog/programming/unity-ash-upgrades/).

## Unit Testing

Well this is another massive benefit to using Ash but this post is already way too long so ill save Unit Testing for the next part, stay tuned!

For now you can checkout Unity-Ash here: [https://github.com/mikecann/Unity-Ash](https://github.com/mikecann/Unity-Ash)

If you want to see an example of its usage you can see here: [https://github.com/mikecann/UnityAshteroids](https://github.com/mikecann/UnityAshteroids)

If you want some more info on Ash then you should check out the official Ash Framework site: [https://www.ashframework.org/](https://www.ashframework.org/)

Note its all still really new so things are probably going to be in flux quite a bit. I am really interested to get peoples opinions on this however. Let me know what you think!
