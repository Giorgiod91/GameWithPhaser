"use client";
import React, { useEffect, useState } from "react";
import Phaser, { AUTO } from "phaser";

import { ImArrowLeft, ImArrowRight, ImArrowUp } from "react-icons/im";
import { object, set } from "zod";

//::TODO:: Add archievments for the player to collect
//::TODO:: add scene 1 and scene 2 in a separate file and import them here
//::TODO:: add arrows instead of left right and jump button

const PhaserGame = () => {
  const [gameOver, setGameOver] = useState(false);
  const [coins, setCoins] = useState(0);

  const [switchPosition, setSwitchPosition] = useState(0);
  const [leftIsClicked, setLeftIsClicked] = useState(false);
  const [rightIsClicked, setRightIsClicked] = useState(false);
  const [jumpIsClicked, setJumpIsClicked] = useState(false);
  const [levelOneStyling, setLevelOneStyling] = useState(false);

  const lvl2Text = "Collect a Star to get super boost!";
  const lvl1Text = "Collect a Weapon to shoot cactus!";

  useEffect(() => {
    let gameInstance;

    // state management for the buttons to change color when clicked and to be able to use the state in the game with an event listener

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setLeftIsClicked(false);
      }
      if (event.key === "ArrowRight") {
        setRightIsClicked(false);
      }
      if (event.key === " ") {
        setJumpIsClicked(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setLeftIsClicked(true);
      }
      if (event.key === "ArrowRight") {
        setRightIsClicked(true);
      }
      if (event.key === " ") {
        setJumpIsClicked(true);
      }
    };

    const level1: Phaser.Types.Scenes.SettingsConfig = {
      preload: function (this: Phaser.Scene) {
        this.load.image("sky", "/assets/mapbg/bg.png");
        this.load.image("player", "/assets/p3_stand.png");
        this.load.image("cloud1", "/assets/items/cloud1.png");
        this.load.image("cactus", "/assets/items/cactus.png");
        this.load.image("box", "/assets/mapImages/box.png");
        this.load.image("coin", "/assets/items/coinGold.png");
        this.load.image("switch", "/assets/items/switchLeft.png");
        this.load.image("mushroom", "/assets/items/mushroomRed.png");
        this.load.image("floor", "/assets/mapImages/grassHalfMid.png");
        this.load.image("springUp", "/assets/items/springboardUp.png");
        this.load.image("springPlayer", "/assets/p3_jump.png");
        this.load.image("weapon", "/assets/weapons/3.png");
        this.load.image("laser", "/assets/weapons/red_laser.png");
      },
      create: function (this: any) {
        // check if 35 coins are collected to go to the next level

        // Setup keyboard inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.R,
        );

        // adding event listeners for the buttons to later use the state for color change
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // defining the size of LVL1 map

        const lvl1Width = 4500;
        const lvl1Height = 600;
        const floorHeight = 40;
        // Create a movable background
        this.background = this.add.tileSprite(
          0,
          0,
          lvl1Width,
          lvl1Height,
          "sky",
        );
        this.background.setOrigin(0, 0);
        this.background.setScrollFactor(0);

        this.background.setDisplaySize(
          this.sys.game.config.width,
          this.sys.game.config.height,
        );
        // creating the laser projetile
        this.laser = this.physics.add.image(0, 0, "laser");
        this.laser.setScale(0.1);
        this.laser.setCollideWorldBounds(true);
        this.laser.body.allowGravity = false;
        this.laser.setVisible(false);

        //creating the weapon
        var x = Phaser.Math.Between(50, lvl1Width);
        this.weapon = this.physics.add.image(x - 100, 500, "weapon");
        this.weapon.setScale(0.1);
        this.weapon.setCollideWorldBounds(true);
        this.weapon.body.allowGravity = false;
        this.weapon.setInteractive();

        // creating the floor
        this.floor = this.physics.add.staticGroup();
        const floorLVL1 = this.floor
          .create(0, lvl1Height - floorHeight, "floor")
          .setOrigin(0, 0);
        floorLVL1.setScale(lvl1Width / floorLVL1.width, 1).refreshBody();
        // creating the springboard
        this.springboard = this.physics.add.image(50, 500, "springUp");
        this.springboard.setScale(0.5);
        this.springboard.setCollideWorldBounds(true);
        this.springboard.body.allowGravity = false;

        // creating the mushroom
        var x = Phaser.Math.Between(50, lvl1Width);
        var y = Phaser.Math.Between(50, lvl1Height - 50);
        this.mushroom = this.physics.add.image(x / 2, y, "mushroom");
        this.mushroom.body.allowGravity = false;
        this.mushroom.setCollideWorldBounds(true);
        this.shroomedForHowLong = 0;
        // Create the coins and set the physics
        this.manyCoins = [];
        for (let i = 0; i < 55; i++) {
          const x = Phaser.Math.Between(50, lvl1Width);
          const y = Phaser.Math.Between(50, lvl1Height - 50);
          const coin = this.physics.add.image(x, y, "coin");
          coin.setScale(0.5);
          coin.setCollideWorldBounds(true);
          coin.body.allowGravity = false;
          coin.body.immovable = true;
          coin.collected = false;
          coin.tencollected = false;
          this.manyCoins.push(coin);
        }
        //::TODO:: make the switch to change position of the boxes
        // Create the switch
        this.switch = this.physics.add.image(50, 550, "switch");
        this.switch.setScale(0.5);
        this.switch.setCollideWorldBounds(true);
        this.switch.body.allowGravity = false;
        this.switchActivated = false;

        // Set camera bounds to the size of the world
        this.cameras.main.setBounds(0, 0, lvl1Width, lvl1Height);
        this.physics.world.setBounds(0, 0, lvl1Width, lvl1Height);

        // Create the cactus objects with dynamic physics
        this.manyCactus = [];
        const usedXPositions = new Set();

        // Function to generate unique x positions for cactus
        const generateUniqueX = () => {
          let x;
          do {
            x = Phaser.Math.Between(600, lvl1Width);
          } while (usedXPositions.has(x));
          usedXPositions.add(x);
          return x;
        };

        for (let i = 0; i < 25; i++) {
          const x = generateUniqueX();
          const cactus = this.physics.add.image(x, 400, "cactus");
          cactus.setScale(0.5);
          cactus.setCollideWorldBounds(true);
          this.manyCactus.push(cactus);
        }

        // Create the box objects
        this.manyBox = [];
        for (let i = 0; i < 30; i++) {
          const x = Phaser.Math.Between(50, lvl1Width);
          const y = Phaser.Math.Between(50, lvl1Height - 50);
          const box = this.physics.add.image(x, y, "box");
          box.setScale(0.5);
          box.setCollideWorldBounds(true);
          box.body.allowGravity = false;
          box.body.immovable = true;
          this.manyBox.push(box);
        }

        // Create the clouds in the background
        this.add.image(200, 100, "cloud1");
        this.add.image(400, 90, "cloud1");
        this.add.image(600, 80, "cloud1");

        // Create the player
        this.player = this.physics.add.image(400, 500 - 19, "player");
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        // letting the player hold the weapon
        this.weaponHold = this.add.sprite(
          this.player.x,
          this.player.y,
          "weapon",
        );
        this.weaponHold.setVisible(false);
        //creating state to check if player is jumping wiht the pad also set original texture to player
        this.isJumping = false;
        this.originalTexture = "player";

        // Create player boost
        this.boost = 0;
        this.howManyJumps = 0;
        this.maxJumps = 2;

        // Enable gravity for the player
        this.player.body.allowGravity = true;

        // Set initial velocity to zero
        this.player.setVelocity(0, 0);

        // Add keyboard inputs for movement
        this.cursors = this.input?.keyboard.createCursorKeys();
        this.spaceKey = this.cursors.space;

        // add collision between player and weapon
        this.physics.add.collider(this.player, this.weapon, () => {
          this.weapon.destroy();
          this.weaponHold.setVisible(true);
          this.weaponHold.setScale(0.1);
          this.weaponHold.setPosition(this.player.x, this.player.y);
        });

        this.localCoins = 0;

        // add collision between player and springboard
        this.physics.add.collider(this.player, this.springboard, () => {
          this.player.setVelocityY(-500);
          this.player.setTexture("springPlayer");
          this.isJumping = true;

          // set player texture back to original after 500ms codesnippet i took
          this.time.delayedCall(500, () => {
            if (this.isJumping) {
              this.player.setTexture(this.originalTexture);
              this.isJumping = false;
            }
          });
        });

        // add collision between laser and cactus
        // check for collision between laser and cactus
        this.physics.add.collider(
          this.laser,
          this.manyCactus,
          (laser: any, cactus: any) => {
            cactus.destroy();
            laser.setVisible(false);
            laser.setVelocityX(0);
          },
        );
        // Add collision between player and cactus
        this.physics.add.collider(this.player, this.manyCactus, () => {
          setGameOver(true); // Game over when player collides with any cactus
        });

        // Add collision between player and boxes
        this.physics.add.collider(this.player, this.manyBox);

        // Add collision between player and floor
        this.physics.add.collider(this.player, this.floor);

        // Add collision between cactus and floor
        this.physics.add.collider(this.manyCactus, this.floor);

        // Create button to restart
      },
      update: function (lvl1Width: number, lvl1Height: number) {
        // Move each cactus to the left
        this.manyCactus = this.manyCactus.filter((cactus) => {
          if (cactus && cactus.active) {
            cactus.setVelocityX(-100);

            // Reset cactus position
            if (cactus.x < 50) {
              cactus.x = 800;
            }
            return true;
          }
          return false;
        });
        // weaopon hold part
        if (this.weaponHold.visible) {
          this.weaponHold.setPosition(this.player.x, this.player.y - 5);
        }

        // if player collides with jump pad, player image changes to the jump image
        // Reset player texture if not jumping
        if (
          !this.isJumping &&
          this.player.texture.key !== this.originalTexture
        ) {
          this.player.setTexture(this.originalTexture);
        }

        // if mushroom is touched by player, player gets a boost and increased size
        if (this.physics.overlap(this.player, this.mushroom)) {
          this.boost = 100;
          this.shroomed = true;

          this.player.setScale(1.2);
        }
        // adding a timer to the mushroom buff to expire after 15 seconds
        this.time.delayedCall(15000, () => {
          this.shroomed = false;
          this.player.setScale(0.5);
        });
        if (this.shroomed && this.shroomedForHowLong < 10) {
          this.manyCoins.forEach((coin) => {
            const distance = Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              coin.x,
              coin.y,
            );

            if (distance < 150 && !coin.collected) {
              // Check if the coin is not collected
              coin.collected = true;

              setCoins((prevCoins) => prevCoins + 1);
              coin.destroy();
              this.shroomedForHowLong += 1;
            }
          });
        }
        // if shroomed, player can destroy boxes and cactus
        if (this.shroomed) {
          this.physics.add.collider(this.player, this.manyBox, () => {
            this.manyBox.forEach((box) => {
              box.destroy();
            });
          });
          this.physics.add.collider(this.player, this.manyCactus, () => {
            this.manyCactus.forEach((cactus) => {
              cactus.destroy();
            });
          });
        }

        // Scroll the background based on the camera's scroll position
        this.background.tilePositionX = this.cameras.main.scrollX;

        // Check for duplicate x positions and remove duplicates
        const seenXPositions = new Set();
        this.manyCactus.forEach((cactus) => {
          if (seenXPositions.has(cactus.x)) {
            cactus.destroy(); // Remove cactus with duplicate x position
          } else {
            seenXPositions.add(cactus.x);
          }
        });
        // Check for player collision with switch then switch stuff around
        if (
          this.physics.overlap(this.player, this.switch) &&
          !this.switchActivated
        ) {
          //  give the boxes new random positions

          this.manyBox.forEach((box) => {
            box.x = Phaser.Math.Between(50, lvl1Width);
            this.switchActivated = true;
          });
        }

        // Create player boost
        if (this.boost > 0) {
          this.player.setVelocityY(-100);
          this.boost -= 1;
        }
        // let the projectiles move out of the weapon
        if (this.weaponHold.visible && this.rKey.isDown) {
          this.laser.setPosition(this.weaponHold.x, this.weaponHold.y);
          this.laser.setVelocityX(100);
          this.laser.setVisible(true);
        }
        if (this.laser.visible && this.laser.body.velocity.x === 0) {
          this.laser.setVelocityX(300);
        }

        // Stop player movement if no key is pressed
        this.player.setVelocityX(0);

        // Horizontal movement for player
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-150);
          setLeftIsClicked(true);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(150);
          setRightIsClicked(true);
        }

        // Spacebar jump
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          if (this.howManyJumps < this.maxJumps) {
            this.player.setVelocityY(-300);
            this.howManyJumps++;
            setJumpIsClicked(true);
          }
        }

        // Reset jump count when player touches the ground
        if (this.player.body.blocked.down) {
          this.howManyJumps = 0;
        }

        // Check for player collision with coins and remove coins
        if (this.manyCoins) {
          this.manyCoins.forEach((coin) => {
            if (this.physics.overlap(this.player, coin)) {
              setCoins((prevCoins) => prevCoins + 1);

              coin.destroy();
            }
          });
        }
        // check if player has collected 3 coins and if so start level 2 scene
        if (this.coins === 3) {
          this.scene.start("Level2");
        }

        if (gameOver) {
          // Optional: Game over conditions and restart button visibility
          if (this.restartButton) {
            this.restartButton.setVisible(true);
          }
          this.scene.pause();
        } else {
          if (this.restartButton) {
            this.restartButton.setVisible(false);
          }
        }
      },
    } as Phaser.Types.Scenes.SettingsConfig;
    class Level2 extends Phaser.Scene {
      private background!: Phaser.GameObjects.TileSprite;
      private star!: Phaser.GameObjects.Image;
      private manyCoins!: Phaser.GameObjects.Image[];
      private floor!: Phaser.Physics.Arcade.StaticGroup;
      private randomFloors!: Phaser.Physics.Arcade.StaticGroup;
      private flag!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private spaceKey!: any;
      private howManyJumps!: number;
      private maxJumps!: number;
      private fallinItems!: Phaser.Physics.Arcade.Group;

      constructor() {
        super({ key: "Level2" });
      }

      preload() {
        this.load.image("sky1", "/assets/mapbg/bg_castle.png");
        this.load.image("player", "/assets/p3_stand.png");
        this.load.image("floor", "/assets/mapImages/sandMid.png");
        this.load.image("cactus", "/assets/items/cactus.png");
        this.load.image("flag", "/assets/items/flagGreen.png");
        this.load.image("itemOne", "/assets/items/itemOne.png");
        this.load.image("sky2", "/assets/mapbg/skyy.png");
        this.load.image("coin", "/assets/items/coinGold.png");
        this.load.image("star", "/assets/items/star.png");
        this.load.image("playerBoost", "/assets/p3_jump.png");
      }

      create() {
        this.add.text(100, 100, "Level 2", { fill: "#0f0" });

        const lvl2Width = 650;
        const lvl2Height = 4500;

        const floorLvl2Height = 40;

        // adding event listeners for the buttons to later use the state for color change
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        //creating fallin items
        // Initialize the falling items group
        this.fallinItems = this.physics.add.group({
          key: "itemOne",
          repeat: 9, // Number of items
          setXY: { x: 50, y: 0, stepX: 70 },
        });

        // Configure each falling item
        this.fallinItems.children.iterate(
          (item: Phaser.Physics.Arcade.Image) => {
            item.setScale(0.5);
            item.setCollideWorldBounds(true);
            item.body.maxVelocity.y = 200;
          },
        );

        // Create a movable background
        this.background = this.add.tileSprite(
          0,
          0,
          lvl2Width,
          lvl2Height,
          "sky1",
        );

        this.background.setScrollFactor(0);
        this.background.setOrigin(0, 0);
        this.background.setDepth(-1);

        // star
        this.star = this.physics.add.image(500, 4400, "star");
        (this.star.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        const starBody = this.star.body as Phaser.Physics.Arcade.Body;
        starBody.allowGravity = false;

        //coins
        this.manyCoins = [];
        for (let i = 0; i < 55; i++) {
          const x = Phaser.Math.Between(50, lvl2Width);
          const y = Phaser.Math.Between(50, lvl2Height - 50);
          const coin = this.physics.add.image(x, y, "coin");
          coin.setScale(0.5);
          coin.setCollideWorldBounds(true);
          coin.body.allowGravity = false;
          coin.body.immovable = true;
          coin.collected = false;
          coin.tencollected = false;
          this.manyCoins.push(coin);
        }

        // Set camera bounds to the size of the world
        this.cameras.main.setBounds(0, 0, lvl2Width, lvl2Height);
        this.physics.world.setBounds(0, 0, lvl2Width, lvl2Height);

        // Initialize the floor as a StaticGroup
        this.floor = this.physics.add.staticGroup();

        // Create the ground floor
        const groundFloor = this.floor
          .create(0, lvl2Height - floorLvl2Height, "floor")
          .setOrigin(0, 0);
        groundFloor.setScale(lvl2Width / groundFloor.width, 1).refreshBody();

        // Create random floating floors
        this.randomFloors = this.physics.add.staticGroup();
        for (let i = 0; i < 55; i++) {
          const x = Phaser.Math.Between(50, lvl2Width);
          const y = Phaser.Math.Between(50, lvl2Height - 50);
          const floor = this.randomFloors.create(x, y, "floor");
          floor.setScale(0.4).refreshBody();
        }

        // Create flag at the goal line on top in the middle and slightly behind the top
        this.flag = this.physics.add.sprite(
          lvl2Width / 2,
          lvl2Height - 20,
          "flag",
        );

        // Create the player at the starting position
        this.player = this.physics.add.sprite(
          lvl2Width / 2,
          lvl2Height - floorLvl2Height - 50,
          "player",
        );
        this.player.setScale(0.5);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Follow the player with the camera
        this.cameras.main.startFollow(this.player);

        // Enable gravity for the player
        this.player.body.allowGravity = true;

        // Add keyboard inputs for movement
        if (this.input) {
          if (this.input && this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
          }
        }
        this.spaceKey = this.cursors.space;

        // Add colliders between the player and the floors
        this.physics.add.collider(this.player, this.floor); // Collide with the ground floor
        this.physics.add.collider(this.player, this.randomFloors); // Collide with the floating floors

        //// Add collider between player and star after some seconds it gets removed
        this.physics.add.collider(this.player, this.star, () => {
          this.player.body.allowGravity = false;
          this.player.setTexture("playerBoost");
          this.time.delayedCall(5000, () => {
            this.player.body.allowGravity = true;
            this.player.setTexture("player");
          });
        });

        // Add collider between player and falling items
        this.physics.add.collider(
          this.player,
          this.fallinItems,
          (player, fallinItems) => {
            setGameOver(true);
          },
        );

        // Initialize jump properties
        this.howManyJumps = 0;
        this.maxJumps = 2;
      }
      fallinItems(player: any, fallinItems: any, arg2: () => void) {
        throw new Error("Method not implemented.");
      }

      update(time, delta) {
        this.player.setVelocityX(0);

        // creating the star bonus

        if (this.physics.overlap(this.player, this.star)) {
          //lets the palyer fly up
        }

        // check collide  between player and falling items and if so gameover

        // Check for player collision with coins and remove coins
        if (this.manyCoins) {
          this.manyCoins.forEach((coin) => {
            if (this.physics.overlap(this.player, coin)) {
              setCoins((prevCoins) => prevCoins + 1);

              coin.destroy();
            }
          });
        }

        // Player movement
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-150);
          setLeftIsClicked(true);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(150);
          setRightIsClicked(true);
        }

        // Jump
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          if (this.howManyJumps < this.maxJumps) {
            this.player.setVelocityY(-400); // Adjust this value if necessary
            this.howManyJumps++;
            setJumpIsClicked(true);
          }
        }

        // Reset jump count when player touches the ground
        if (this.player.body.blocked.down) {
          this.howManyJumps = 0;
        }

        // Scroll the background based on the camera's scroll position
        this.background.tilePositionY = this.cameras.main.scrollY;
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-game-container",

      scene: [Level2],

      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 500, x: 0 },
          width: 1600,
          height: 600,
        },
      },
    };

    gameInstance = new Phaser.Game(config);

    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);

        setCoins(0);
      }
      // start lv 2 if 10 coins are collected

      // Remove event listeners when the game is destroyed
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="mb-6 text-3xl font-bold md:text-4xl">
        Game made for fun! Collect 35 coins to get to the next level.
      </h1>
      <h2>Get a mushroom to get huge and suck in coins</h2>

      <div id="phaser-game-container" className="relative mb-6">
        <h1 className="mb-2 text-3xl font-bold text-yellow-400 md:text-4xl">
          Coins: {coins}
        </h1>
      </div>

      {gameOver ? (
        <div className="flex flex-col items-center">
          <h1 className="mb-4 text-4xl font-bold text-red-500">Game Over</h1>
          <button
            onClick={() => setGameOver(false)}
            className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow-md transition duration-300 hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-medium text-gray-300">
            Game is Running
          </h1>

          <div className="mt-4 flex flex-col items-center">
            <div className="flex flex-row space-x-5 p-4">
              <button
                className={`rounded-lg px-6 py-2 font-semibold text-white shadow-md transition duration-300 ${
                  leftIsClicked
                    ? "bg-green-500"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <ImArrowLeft />
              </button>
              <button
                className={`rounded-lg px-6 py-2 font-semibold text-white shadow-md transition duration-300 ${
                  rightIsClicked
                    ? "bg-green-500"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <ImArrowRight />
              </button>
            </div>
            <button
              className={`rounded-lg px-6 py-2 font-semibold text-white shadow-md transition duration-300 ${
                jumpIsClicked ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <ImArrowUp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaserGame;
