"use client";
import Phaser from "phaser";

export default class Level2 extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private floor!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private howManyJumps: number = 0;
  private maxJumps: number = 2;
  private randomFloors!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: "Level2" });
  }

  preload() {
    this.load.image("sky", "/assets/mapbg/bg.png");
    this.load.image("player", "/assets/p3_stand.png");
    this.load.image("floor", "/assets/mapImages/castleMid.png");
  }

  create() {
    this.add.text(100, 100, "Level 2", { fill: "#0f0" });
    this.add.image(400, 300, "sky");

    const lvl2Width = 650;
    const lvl2Height = 4500;
    const floorLvl2Height = 40;

    // Create a movable background
    this.background = this.add
      .tileSprite(0, 0, lvl2Width, lvl2Height, "sky")
      .setOrigin(0, 0);

    this.background.setDisplaySize(
      this.sys.game.config.width as number,
      this.sys.game.config.height as number,
    );

    // Set camera bounds to the size of the world
    this.cameras.main.setBounds(0, 0, lvl2Width, lvl2Height);
    this.physics.world.setBounds(0, 0, lvl2Width, lvl2Height);

    // Initialize the floor as a StaticGroup
    this.floor = this.physics.add.staticGroup();

    // Create the ground floor
    const groundFloor = this.floor
      .create(0, lvl2Height - floorLvl2Height, "floor")
      .setOrigin(0.0);
    groundFloor.setScale(lvl2Width / groundFloor.width, 1).refreshBody();

    // Create random floating floors
    this.randomFloors = this.physics.add.staticGroup();
    for (let i = 0; i < 55; i++) {
      const x = Phaser.Math.Between(50, lvl2Width);
      const y = Phaser.Math.Between(50, lvl2Height - 50);
      const floor = this.randomFloors.create(x, y, "floor");
      floor.setScale(0.2).refreshBody();
    }

    // Create the player at the starting position
    this.player = this.physics.add.sprite(
      lvl2Width / 2,
      lvl2Height - floorLvl2Height - 50,
      "player",
    );
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Follow the player with the camera
    this.cameras.main.startFollow(this.player);

    // Enable gravity for the player
    this.player.body.allowGravity = true;

    // Add keyboard inputs for movement
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.cursors.space;

    // Add colliders between the player and the floors
    this.physics.add.collider(this.player, this.floor); // Collide with the ground floor
    this.physics.add.collider(this.player, this.randomFloors); // Collide with the floating floors
  }

  update(time: number, delta: number): void {
    this.player.setVelocityX(0);
    // player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(150);
    }
    // jump
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.howManyJumps < this.maxJumps) {
        this.player.setVelocityY(-400);
        this.howManyJumps++;
      }
    }

    if (this.player.body.blocked.down) {
      this.howManyJumps = 0;
    }
  }
}
