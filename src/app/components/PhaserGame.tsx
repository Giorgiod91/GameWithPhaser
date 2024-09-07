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

    interface CustomCoin extends Phaser.Physics.Arcade.Image {
      collected?: boolean;
    }
    interface Level1Scene extends Phaser.Scene {
      manyCactus: Phaser.Physics.Arcade.Image[];
      mushroom: Phaser.Physics.Arcade.Image;
      background: Phaser.GameObjects.TileSprite;
      laser: Phaser.Physics.Arcade.Image;
      cursors: Phaser.Types.Input.Keyboard.CursorKeys;
      rKey: Phaser.Input.Keyboard.Key;
      weapon: Phaser.Physics.Arcade.Image;
      floor: Phaser.Physics.Arcade.StaticGroup;
      springboard: Phaser.Physics.Arcade.Image;
      shroomedForHowLong: number;
      manyCoins: Phaser.Physics.Arcade.Image[];
      switch: Phaser.Physics.Arcade.Image;
      switchActivated: boolean;
      player: Phaser.Physics.Arcade.Image;
      boost: number;
      howManyJumps: number;
      maxJumps: number;
      playerHold: Phaser.GameObjects.Sprite;
      isJumping: boolean;
      originalTexture: string;
      coins: number;
      gameOver: boolean;
      restartButton?: Phaser.GameObjects.Text;
      localCoins: number;
      manyBox: Phaser.Physics.Arcade.Image[];
      collected: boolean;

      weaponHold: Phaser.GameObjects.Sprite;
      spaceKey: Phaser.Input.Keyboard.Key;
      shroomed: boolean;
    }

    const level1: Phaser.Types.Scenes.SettingsConfig = {
      preload: function (this: Level1Scene) {
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
      create: function (this: Level1Scene) {
        // Setup keyboard inputs

        const text = this.add.text(
          Number(this.sys.game.config.width) / 2,
          Number(this.sys.game.config.height) / 2,
          "Restart",
          {
            fontSize: "32px",
            backgroundColor: "#000",
            padding: { x: 20, y: 10 },
          },
        );

        text.setOrigin(0.5);
        text.setVisible(false);
        text.setInteractive();
        this.restartButton = text;

        this.restartButton.on("pointerdown", () => {
          this.scene.restart(); // Restart the current scene
        });
        // Setup keyboard inputs
        this.input?.keyboard
          ? (this.cursors = this.input.keyboard.createCursorKeys())
          : null;
        this.spaceKey = this.cursors.space;
        if (this.input.keyboard) {
          this.rKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.R,
          );
        }

        // Event listeners
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Map size
        const lvl1Width = 4500;
        const lvl1Height = 600;
        const floorHeight = 40;

        // Background
        this.background = this.add.tileSprite(
          0,
          0,
          lvl1Width,
          lvl1Height,
          "sky",
        );
        this.background?.setOrigin(0, 0);
        this.background?.setScrollFactor(0);
        this.background?.setDisplaySize(
          Number(this.sys.game.config.width),
          Number(this.sys.game.config.height),
        );

        // Laser projectile
        this.laser = this.physics.add.image(0, 0, "laser");
        this.laser.setScale(0.1);
        this.laser.setCollideWorldBounds(true);
        if (!(this.laser.body instanceof Phaser.Physics.Arcade.StaticBody)) {
          this.laser.body?.setAllowGravity(false);
        }

        this.laser.setVisible(false);

        // Weapon
        const weaponX = Phaser.Math.Between(50, lvl1Width);
        this.weapon = this.physics.add.image(weaponX - 100, 500, "weapon");
        this.weapon.setScale(0.1);
        this.weapon.setCollideWorldBounds(true);
        const laserBody = this.laser.body as Phaser.Physics.Arcade.Body;
        if (
          laserBody &&
          !(laserBody instanceof Phaser.Physics.Arcade.StaticBody)
        ) {
          laserBody.allowGravity = false;
        }
        this.weapon.setInteractive();

        // Floor
        this.floor = this.physics.add.staticGroup();
        const floorLVL1 = this.floor
          .create(0, lvl1Height - floorHeight, "floor")
          .setOrigin(0, 0);
        floorLVL1.setScale(lvl1Width / floorLVL1.width, 1);
        floorLVL1.refreshBody();

        // Springboard
        this.springboard = this.physics.add.image(
          50,
          500,
          "springUp",
        ) as Phaser.Physics.Arcade.Image;
        this.springboard.setScale(0.5);
        this.springboard.setCollideWorldBounds(true);
        if (
          this.springboard.body &&
          !(this.springboard.body instanceof Phaser.Physics.Arcade.StaticBody)
        ) {
          this.springboard.body.allowGravity = false;
        }
        // Mushroom
        const mushroomX = Phaser.Math.Between(50, lvl1Width);
        const mushroomY = Phaser.Math.Between(50, lvl1Height - 50);
        this.mushroom = this.physics.add.image(
          mushroomX / 2,
          mushroomY,
          "mushroom",
        );

        if (
          this.mushroom.body &&
          !(this.mushroom.body instanceof Phaser.Physics.Arcade.StaticBody)
        ) {
          this.mushroom.body.allowGravity = false;
        }

        this.mushroom.setCollideWorldBounds(true);
        this.shroomedForHowLong = 0;

        // Coins
        this.manyCoins = [];
        for (let i = 0; i < 55; i++) {
          const coinX = Phaser.Math.Between(50, lvl1Width);
          const coinY = Phaser.Math.Between(50, lvl1Height - 50);
          interface Coin extends Phaser.Physics.Arcade.Image {
            collected: boolean;
          }

          const coin = this.physics.add.image(coinX, coinY, "coin") as Coin;
          coin.collected = false;
          coin.setScale(0.5);
          coin.setCollideWorldBounds(true);
          if (
            coin.body &&
            !(coin.body instanceof Phaser.Physics.Arcade.StaticBody)
          ) {
            coin.body.setAllowGravity(false);
          }
          if (
            coin.body &&
            !(coin.body instanceof Phaser.Physics.Arcade.StaticBody)
          ) {
            coin.body.immovable = true;
          }

          coin.collected = false;
          this.manyCoins.push(coin);
        }

        // Switch
        this.switch = this.physics.add.image(50, 550, "switch");
        this.switch.setScale(0.5);
        this.switch.setCollideWorldBounds(true);
        if (
          this.switch.body &&
          !(this.switch.body instanceof Phaser.Physics.Arcade.StaticBody)
        ) {
          this.switch.body.allowGravity = false;
        }

        this.switchActivated = false;

        // Camera and physics bounds
        this.cameras.main.setBounds(0, 0, lvl1Width, lvl1Height);
        this.physics.world.setBounds(0, 0, lvl1Width, lvl1Height);

        // Cacti
        this.manyCactus = [];
        const usedXPositions = new Set<number>();
        const generateUniqueX = (): number => {
          let x: number;
          do {
            x = Phaser.Math.Between(600, lvl1Width);
          } while (usedXPositions.has(x));
          usedXPositions.add(x);
          return x;
        };
        for (let i = 0; i < 25; i++) {
          const cactusX = generateUniqueX();
          const cactus = this.physics.add.image(cactusX, 400, "cactus");
          cactus.setScale(0.5);
          cactus.setCollideWorldBounds(true);
          this.manyCactus.push(cactus);
        }

        // Boxes
        this.manyBox = [];
        for (let i = 0; i < 30; i++) {
          const boxX = Phaser.Math.Between(50, lvl1Width);
          const boxY = Phaser.Math.Between(50, lvl1Height - 50);
          const box = this.physics.add.image(boxX, boxY, "box");
          box.setScale(0.5);
          box.setCollideWorldBounds(true);
          box.body.allowGravity = false;
          box.body.immovable = true;
          this.manyBox.push(box);
        }

        // Clouds
        this.add.image(200, 100, "cloud1");
        this.add.image(400, 90, "cloud1");
        this.add.image(600, 80, "cloud1");

        // Player
        this.player = this.physics.add.image(400, 500 - 19, "player");
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        // Weapon hold
        this.weaponHold = this.add.sprite(
          this.player.x,
          this.player.y,
          "weapon",
        );
        this.weaponHold.setVisible(false);

        // Player state
        this.isJumping = false;
        this.originalTexture = "player";

        // Player boost
        this.boost = 0;
        this.howManyJumps = 0;
        this.maxJumps = 2;
        this.gameOver = false;
        this.localCoins = 0;
        this.collected = false;

        // Player gravity and velocity
        if (
          this.player.body &&
          !(this.player.body instanceof Phaser.Physics.Arcade.StaticBody)
        ) {
          this.player.body.allowGravity = true;
        }
        this.player.setVelocity(0, 0);

        // Keyboard inputs
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.cursors!.space;

        // Colliders
        this.physics.add.collider(this.player, this.weapon, () => {
          this.weapon.destroy();
          this.weaponHold.setVisible(true);
          this.weaponHold.setScale(0.1);
          this.weaponHold.setPosition(this.player.x, this.player.y);
        });
        // Collide with springboard

        this.physics.add.collider(this.player, this.springboard, () => {
          this.player.setVelocityY(-500);
          this.player.setTexture("springPlayer");
          this.isJumping = true;
          this.time.delayedCall(500, () => {
            if (this.isJumping) {
              this.player.setTexture(this.originalTexture);
              this.isJumping = false;
            }
          });
        });
        // Collide between laser and cactus

        this.physics.add.collider(
          this.laser,
          this.manyCactus,
          (laser, cactus) => {
            (cactus as Phaser.Physics.Arcade.Image).destroy();
            (laser as Phaser.Physics.Arcade.Image).setVisible(false);
            (laser as Phaser.Physics.Arcade.Image).setVelocityX(0);
          },
        );
        // Collide between player and cactus

        this.physics.add.collider(this.player, this.manyCactus, () => {
          console.log("Player hit a cactus");
          setGameOver(true);
        });
        // Collide between player and box player floor

        this.physics.add.collider(this.player, this.manyBox);
        this.physics.add.collider(this.player, this.floor);
        // Collide between cache and floor
        this.physics.add.collider(this.manyCactus, this.floor);
      },

      update(this: Level1Scene) {
        // cactus movement
        this.manyCactus = this.manyCactus.filter((cactus) => {
          if (cactus?.active) {
            cactus.setVelocityX(-100);
            if (cactus.x < 50) {
              cactus.x = 800;
            }
            return true;
          }
          return false;
        });
        // trying to get the weapon to look like it is in the players hand
        if (this.weaponHold.visible) {
          this.weaponHold.setPosition(this.player.x, this.player.y - 5);
        }
        // texture change for the player when jumping
        if (
          !this.isJumping &&
          this.player.texture.key !== this.originalTexture
        ) {
          this.player.setTexture(this.originalTexture);
        }
        // mushroom boost logic

        if (this.physics.overlap(this.player, this.mushroom)) {
          this.boost = 100;
          this.shroomed = true;
          this.player.setScale(1.2);
        }
        // mushroom boost time

        this.time.delayedCall(15000, () => {
          this.shroomed = false;
          this.player.setScale(0.5);
        });
        // mushroom boost sucking in coins
        if (this.shroomed && this.shroomedForHowLong < 10) {
          this.manyCoins.forEach((coin: CustomCoin) => {
            const distance = Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              coin.x,
              coin.y,
            );
            if (distance < 150 && !coin.collected) {
              coin.collected = true;
              this.localCoins += 1;
              coin.destroy();
              this.shroomedForHowLong += 1;
            }
          });
        }

        // mushroom boost will destroy the cactus and boxes
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
        // background scroll
        this.background.tilePositionX = this.cameras.main.scrollX;

        const seenXPositions = new Set<number>();
        this.manyCactus.forEach((cactus) => {
          if (seenXPositions.has(cactus.x)) {
            cactus.destroy();
          } else {
            seenXPositions.add(cactus.x);
          }
        });

        if (
          this.physics.overlap(this.player, this.switch) &&
          !this.switchActivated
        ) {
          this.manyBox.forEach((box) => {
            box.x = Phaser.Math.Between(50, 800);
            this.switchActivated = true;
          });
        }

        if (this.boost > 0) {
          this.player.setVelocityY(-100);
          this.boost -= 1;
        }
        // laser logic
        if (this.weaponHold.visible && this.rKey.isDown) {
          this.laser.setPosition(this.weaponHold.x, this.weaponHold.y);
          this.laser.setVelocityX(100);
          this.laser.setVisible(true);
        }
        if (
          this.laser.visible &&
          this.laser.body &&
          this.laser.body.velocity.x === 0
        ) {
          this.laser.setVelocityX(300);
        }

        this.player.setVelocityX(0);

        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-150);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(150);
        }

        if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          if (this.howManyJumps < this.maxJumps) {
            this.player.setVelocityY(-300);
            this.howManyJumps++;
          }
        }

        if (this.player.body?.blocked.down) {
          this.howManyJumps = 0;
        }

        if (this.manyCoins) {
          this.manyCoins.forEach((coin) => {
            if (this.physics.overlap(this.player, coin)) {
              this.localCoins += 1;
              setCoins((prevCoins) => prevCoins + 1);
              coin.destroy();
            }
          });
        }
        /// if level 2 is released
        //  if (this.localCoins === 35) {
        //  this.scene.start("Level2");
        //}

        if (this.gameOver) {
          console.log("Game Over!");
          if (this.restartButton) {
            this.restartButton.setVisible(true);
          }
          this.scene.pause();
          this.physics.world.pause();
        } else {
          if (this.restartButton) {
            this.restartButton.setVisible(false);
          }
        }
      },
    } as Phaser.Types.Scenes.SettingsConfig;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-game-container",
      scene: [level1],
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 500, x: 0 },
          width: 1600,
          height: 600,
        },
      },
    };

    const gameInstance = new Phaser.Game(config);

    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
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
        Game made for fun! Collect coins to get to the next level.
      </h1>
      <h2 className="text-red-500">Level 2 coming soon</h2>
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
          <h2> How to move</h2>
          <h3>Left: Arrow Left</h3>
          <h3>Right: Arrow Right</h3>
          <h3>Jump: Space</h3>

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
