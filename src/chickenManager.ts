import {
  Animator,
  BoxColliderShape,
  DynamicCollider,
  Entity,
  GLTFResource,
  Keys,
  MeshRenderer,
  Pointer,
  Script,
  SphereColliderShape,
} from "@galacean/engine";
import { GameCtrl } from ".";
import { Score } from "./component/Score";
import { GameState } from "./Eunm";
import { SpeedManager } from "./speedManager";
import { StairManager } from "./stairManager";
import { addWireframe } from "./util";

export class ChickenManager {
  private static _instance: ChickenManager;
  chickenEntity: Entity;

  public static get instance(): ChickenManager {
    if (!this._instance) {
      this._instance = new ChickenManager();
    }
    return this._instance;
  }

  loadChicken() {
    const { engine, rootEntity } = GameCtrl.instance;
    // 加载小鸡 gltf 模型
    return engine.resourceManager
      .load<GLTFResource>(
        "https://gw.alipayobjects.com/os/raptor/9140174156005314/chicken1.gltf"
      )
      .then((resource) => {
        const { animations, defaultSceneRoot } = resource;
        console.log("resource小鸡", resource);
        rootEntity.addChild(resource.defaultSceneRoot);
        defaultSceneRoot.transform.setPosition(0, -9, 0);
        defaultSceneRoot.transform.setRotation(0, 180, 0);
        const animation = defaultSceneRoot.getComponent(Animator);
        animation.play(animations![0].name);

        this.chickenEntity = defaultSceneRoot;

        defaultSceneRoot.addComponent(CollisionScript);
      });
  }

  run() {
    this.chickenEntity.addComponent(JumpScript);
  }
}


class CollisionScript extends Script {
  onAwake(): void {
    // 增加小鸡的碰撞体
    const sphereColliderShape = new SphereColliderShape();
    sphereColliderShape.position.set(0, 0.75, 0);
    sphereColliderShape.radius = 1;

    const collider = this.entity.addComponent(DynamicCollider);
    collider.isKinematic = true;
    collider.addShape(sphereColliderShape);

    // addWireframe(collider);
  }

  onTriggerEnter(other: BoxColliderShape) {
    const name = other.collider.entity.name;
    console.log("onTriggerEnter", other.collider);

    const components = [];
    other.collider.entity.getComponentsIncludeChildren(MeshRenderer, components);
    console.log("components", components);
    const { rootEntity } = GameCtrl.instance;

    if (name.includes("coin")) {
      other.collider.entity.destroy();
      rootEntity.findByName("score").getComponent(Score).addScore();
    } else {
      rootEntity
        .findByName("score")
        .getComponent(Score)
        .setText("游戏结束 \n请点击下面的 「Play」 按钮\n重新开始游戏");
      // this.entity.getComponent(JumpScript).enabled = false;
      GameCtrl.instance.jump(GameState.End);
    }
  }
}

export class JumpScript extends Script {
  // 上一次更新的时间
  _time: number = 0;
  // 重力加速度
  _g: number = -20;
  // 初速度
  _initSpeed: number = -0.5 * this._g;
  // _initSpeed: number = 5 / 8 - this._g / 4;
  // 当前速度
  _speed: number = this._initSpeed;
  // 当前的 y
  _deltaY: number = this.entity.transform.position.y;
  _deltaX = 0;

  onUpdate(deltaTime: number): void {
    const { x, y } = this.entity.transform.position;

    // 通过键盘控制小鸡的左右移动
    const { inputManager } = this.engine;
    if (inputManager.isKeyDown(Keys.ArrowLeft)) {
      this._deltaX -= 1;
    } else if (inputManager.isKeyDown(Keys.ArrowRight)) {
      this._deltaX += 1;
    } else {
      this._deltaX = 0;
    }

    // 如果小鸡掉落到地面，重置时间和速度
    if (y <= -9) {
      this._time = 0;
      this._speed = this._initSpeed * SpeedManager.instance.speedFactor;
    }

    // 1. 计算更新时间：t=t+时间步长
    this._time += deltaTime;

    // y = v * t + 1/2 * g * t * t
    const _y =
      this._speed * this._time + 0.5 * this._g * this._time * this._time;

    this.entity.transform.position.set(x + this._deltaX, -9 + _y * 5, 0);
  }
}
