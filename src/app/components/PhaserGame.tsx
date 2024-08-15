"use client";
import React, { useEffect } from "react";
import Phaser from "phaser";
//phaser codesnipet

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
        const logo = this.physics.add.image(400, 300, "logo");
        logo.setScale(0.2);
        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setInteractive();
        logo.on("pointerdown", () => {
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
          gravity: { y: 200, x: 200 },
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
