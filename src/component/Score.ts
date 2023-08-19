import { Component, Entity, TextRenderer } from "@galacean/engine";

export class Score extends Component {
  private _score: number = 0;
  renderer: TextRenderer;

  constructor(e: Entity) {
    super(e);

    const renderer = this.entity.addComponent(TextRenderer);
    renderer.text = "分数：" + this._score;
    renderer.fontSize = 60;

    this.renderer = renderer;

    this.entity.transform.setPosition(0, 10, 0);
  }

  addScore() {
    this._score++;
    this.renderer.text = "分数：" + this._score;
  }

  getScore() {
    return this._score;
  }

  setText(text: string) {
    this.renderer.text = text;
  }
}
