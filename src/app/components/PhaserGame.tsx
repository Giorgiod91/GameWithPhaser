"use client";
import React, { useEffect, useState } from "react";
import Phaser from "phaser";
import { endianness } from "os";

const PhaserGame = () => {
  const [gameOver, setGameOver] = useState(false);
  useEffect(() => {
    let gameInstance;

    const sceneConfig = {
      preload: function () {
        this.load.image("sky", "/assets/damn.png");
        this.load.image("player", "/assets/player.jpg");
      },
      create: function () {
        this.add.image(400, 300, "sky");

        // Create the player sprite
        const player = this.physics.add.image(400, 500, "player");
        player.setScale(0.2);
        player.setCollideWorldBounds(true);

        // Enable gravity
        player.body.allowGravity = true;

        // Set initial velocity to zero
        player.setVelocity(0, 0);

        // Add keyboard inputs for movement
        this.cursors = this.input.keyboard.createCursorKeys();

        // Spacebar jump
        this.spaceKey = this.cursors.space;
      },
      update: function () {
        const player = this.physics.world.bodies.entries[0].gameObject;
        player.setVelocityX(0);

        // Horizontal movement
        if (this.cursors.left.isDown) {
          player.setVelocityX(-150);
        } else if (this.cursors.right.isDown) {
          player.setVelocityX(150);
        }
        // Jump
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          player.setVelocityY(-300);
        }

        // Loose chaning state to simulate a game over
        if (player.x > 600 || player.x < 200) {
          if (!gameOver) {
            setGameOver(true);
          }
          if (gameOver) {
            setGameOver(false);
          }
        }
      },
      cursors: null,
      spaceKey: null as Phaser.Input.Keyboard.Key | null,
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
      {gameOver && (
        <div>
          <h1>You Lose</h1>
        </div>
      )}
    </div>
  );
};

export default PhaserGame;
