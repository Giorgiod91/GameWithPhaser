import Phaser from "phaser";

export default class Level2 extends Phaser.Scene {
  constructor() {
    super({ key: "Level2Scene" });
  }

  preload() {
    this.load.image("sky2", "/assets/mapbg/bg2.png");
    this.load.image("player", "/assets/p3_stand.png");
  }

  create() {
    // Initialize Level 2 scene
    this.cameras.main.setBackgroundColor("#a9f0f0"); // Example background color
    this.add.text(100, 100, "Level 2", { fontSize: "32px", fill: "#fff" });
  }

  update() {}
}
