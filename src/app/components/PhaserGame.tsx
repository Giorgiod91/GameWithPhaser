"use client";
import React, { useEffect } from "react";
import Phaser from "phaser";

const PhaserGame = () => {
  useEffect(() => {
    let gameInstance;

    const sceneConfig = {
      preload: function () {
        this.load.image("sky", "/assets/damn.png");
        this.load.image("logo", "assets/robot.jpg");
      },
      create: function () {
        this.add.image(400, 300, "sky");
        const logo = this.physics.add.image(60, 60, "logo");
        logo.setScale(0.2);
        logo.setVelocity(100, 100);
        logo.setBounce(1, 1);
        logo.setInteractive();
        this.spaceKey = this.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.SPACE,
        );
        this.spaceKey.on("down", () => {
          logo.setY(100);
        });
      },
      update: function () {},
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
          gravity: { y: 50 },
        },
      },
    };

    gameInstance = new Phaser.Game(config);

    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
      }
    };
  }, []);

  return <div id="phaser-game-container"></div>;
};

export default PhaserGame;
