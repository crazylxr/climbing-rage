import {
  BoxColliderShape,
  Component,
  Entity,
  Pointer,
  Script,
  Sprite,
  SpriteRenderer,
  StaticCollider,
  Texture2D,
} from "@galacean/engine";
import { GameCtrl } from "..";
import { GameState } from "../Eunm";
import { addWireframe } from "../util";

export class CtrlButton extends Component {
  constructor(entity: Entity) {
    super(entity);

    this.loadImage();
  }

  async loadImage() {
    const texture = await this.engine.resourceManager.load<Texture2D>(
      "../../asset/start.png"
    );

    const renderer = this.entity.addComponent(SpriteRenderer);
    const sprite = new Sprite(this.engine, texture);
    renderer.sprite = sprite;

    this.entity.transform.setPosition(0, 8, 0);
    this.entity.transform.setScale(0.4, 0.4, 0);

    const boxCollider: StaticCollider =
      this.entity.addComponent(StaticCollider);
    const boxColliderShape = new BoxColliderShape();
    const { pivot } = sprite;
    boxColliderShape.size.set(renderer.width, renderer.height / 2, 0);
    boxColliderShape.position.set(
      (0.5 - pivot.x) * renderer.width,
      (pivot.y - 0.5) * -renderer.height,
      0
    );
    boxCollider.addShape(boxColliderShape);

    this.entity.addComponent(PointScript);

    // addWireframe(boxCollider);
  }
}

class PointScript extends Script {
  constructor(entity: Entity) {
    super(entity);
  }

  onPointerClick(): void {
    GameCtrl.instance.jump(GameState.Start);

    this.entity.isActive = false;
  }
}
