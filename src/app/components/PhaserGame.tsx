"use client";
import React, { useEffect, useState } from "react";
import Phaser, { AUTO } from "phaser";
import { motion } from "framer-motion";
import { set } from "zod";
//::TODO:: Add the ability to shoot projectiles
//::TODO:: Add a power boost item that allows the player to jump higher or fly for a short period of time
//::TODO:: Add archievments for the player to collect
//::TODO:: let the shroom buff expire after a certain amount of time

const PhaserGame = () => {
  const [gameOver, setGameOver] = useState(false);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [switchPosition, setSwitchPosition] = useState(0);

  useEffect(() => {
    let gameInstance;

    const sceneConfig = {
      preload: function () {
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
      create: function () {
        // Setup keyboard inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.R,
        );
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
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.cursors.space;

        // add collision between player and weapon
        this.physics.add.collider(this.player, this.weapon, () => {
          this.weapon.destroy();
          this.weaponHold.setVisible(true);
          this.weaponHold.setScale(0.1);
          this.weaponHold.setPosition(this.player.x, this.player.y);
        });

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
          (laser, cactus) => {
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
        } else {
          if (this.laser.visible) {
            this.laser.setVisible(false);
            this.laser.setVelocityX(0);
          }
        }

        // Stop player movement if no key is pressed
        this.player.setVelocityX(0);

        // Horizontal movement for player
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-150);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(150);
        }

        // Spacebar jump
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          if (this.howManyJumps < this.maxJumps) {
            this.player.setVelocityY(-300);
            this.howManyJumps++;
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

        if (gameOver) {
          // Optional: Game over conditions and restart button visibility
          if (this.restartButton) {
            this.restartButton.setVisible(true);

            this.scene.restart();
          }
        } else {
          if (this.restartButton) {
            this.restartButton.setVisible(false);
          }
        }
      },
    };

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-game-container",
      scene: sceneConfig,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 500 },
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
    };
  }, [gameOver]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="mb-6 text-3xl font-bold md:text-4xl">
        Game made for fun! Collect 35 coins to get to the next level.
      </h1>
      <h2>get a mushroon to get huge and suck in coins</h2>

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
        </div>
      )}
    </div>
  );
};

export default PhaserGame;
