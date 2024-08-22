"use client";
import React, { useEffect, useState } from "react";
import Phaser from "phaser";

const PhaserGame = () => {
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let gameInstance;

    const sceneConfig = {
      preload: function () {
        this.load.image("sky", "/assets/mapbg/bg.png");
        this.load.image("player", "/assets/p3_stand.png");
        this.load.image("cloud1", "/assets/items/cloud1.png");
        this.load.image("cactus", "/assets/items/cactus.png");
      },
      create: function () {
        const background = this.add.image(400, 300, "sky");
        background.setDisplaySize(
          this.sys.game.config.width,
          this.sys.game.config.height,
        );

        // Create the cactus objects with dynamic physics
        this.manyCactus = [];
        for (let i = 0; i < 10; i++) {
          const cactus = this.physics.add.image(600 + i * 300, 500, "cactus");
          cactus.setScale(0.5);
          cactus.setCollideWorldBounds(true);
          this.manyCactus.push(cactus);
        }

        // Create the clouds in the background
        this.add.image(200, 100, "cloud1");
        this.add.image(400, 90, "cloud1");
        this.add.image(600, 80, "cloud1");

        // Create the player sprite
        this.player = this.physics.add.image(400, 500, "player");
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);

        // Enable gravity for the player
        this.player.body.allowGravity = true;

        // Set initial velocity to zero
        this.player.setVelocity(0, 0);

        // Add keyboard inputs for movement
        this.cursors = this.input.keyboard.createCursorKeys();

        // Spacebar jump
        this.spaceKey = this.cursors.space;

        // Add collision between player and cactus
        this.physics.add.collider(this.player, this.manyCactus, () => {
          setGameOver(true); // Game over when player collides with any cactus
        });

        // Create button to restart
        this.restartButton = this.add.text(400, 300, "Restart", {
          backgroundColor: "white",
          color: "black",
          padding: 10,
        });
        this.restartButton.setInteractive();
        this.restartButton.on("pointerdown", () => {
          setGameOver(false);
        });
        this.restartButton.setVisible(false);
      },
      update: function () {
        // Move each cactus to the left
        this.manyCactus.forEach((cactus) => {
          cactus.setVelocityX(-100);

          // Reset cactus position
          if (cactus.x < 50) {
            cactus.x = 800;
          }
        });
        // Stop player movement if no key is pressed
        this.player.setVelocityX(0);

        // Horizontal movement for player
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-150);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(150);
        }

        // Jump
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.player.setVelocityY(-300);
        }

        // Loose changing state to simulate a game over
        if (this.player.x > 600 || this.player.x < 200) {
          if (!gameOver) {
            setGameOver(true);
          }
        }
        if (this.restartButton) {
          this.restartButton.setVisible(gameOver);
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
        },
      },
    };

    gameInstance = new Phaser.Game(config);

    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
      }
    };
  }, [gameOver]);

  return (
    <div>
      <div id="phaser-game-container"></div>
      {gameOver ? (
        <div>
          <h1>LOOSE</h1>
          <button onClick={() => setGameOver(false)}>Try Again</button>
        </div>
      ) : (
        <div>
          <h1>Game is Running</h1>
        </div>
      )}
    </div>
  );
};

export default PhaserGame;
