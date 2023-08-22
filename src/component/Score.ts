import { Component, Entity, TextRenderer } from "@galacean/engine";

export class Score extends Component {
  private _score: number = 0;
  renderer: TextRenderer;

  constructor(e: Entity) {
    super(e);

    const renderer = this.entity.addComponent(TextRenderer);
    renderer.width = 7.5;
    renderer.text = "分数：" + this._score;
    renderer.fontSize = 60;
    // 打开换行模式
    renderer.enableWrapping = true;

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
