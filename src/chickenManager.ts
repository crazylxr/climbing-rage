import {
  Animator,
  BoxColliderShape,
  DynamicCollider,
  Entity,
  GLTFResource,
  Keys,
  Script,
  SphereColliderShape,
} from "@galacean/engine";
import { GameCtrl } from ".";
import { Score } from "./component/Score";
import { GameState } from "./Eunm";
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
    engine.resourceManager
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
        defaultSceneRoot.addComponent(JumpScript);
      });
  }
}

class CollisionScript extends Script {
  onAwake(): void {
    // 增加小鸡的碰撞体
    const sphereColliderShape = new SphereColliderShape();
    sphereColliderShape.position.set(0, 0.75, 0);
    sphereColliderShape.radius = 0.9;

    const collider = this.entity.addComponent(DynamicCollider);
    collider.isKinematic = true;
    collider.addShape(sphereColliderShape);

    addWireframe(collider);
  }

  onTriggerEnter(other: BoxColliderShape) {
    const name = other.collider.entity.name;
    console.log("onTriggerEnter", name);
    const { rootEntity } = GameCtrl.instance;

    if (name.includes("coin")) {
      other.collider.entity.destroy();
      rootEntity.findByName("score").getComponent(Score).addScore();
    } else {
      rootEntity.findByName("score").getComponent(Score).setText("游戏结束");
      // this.entity.getComponent(JumpScript).enabled = false;
      GameCtrl.instance.jump(GameState.End);
    }
  }
}

export class JumpScript extends Script {
  // 上一次更新的时间
  time: number = 0;
  // 初速度
  initSpeed: number = 3.5;
  // 重力加速度
  g: number = -9.8;
  // 当前速度
  speed: number = this.initSpeed;
  // 当前的 y
  deltaY: number = this.entity.transform.position.y;
  deltaX = 0;

  onUpdate(deltaTime: number): void {
    const { x, y } = this.entity.transform.position;

    // 通过键盘控制小鸡的左右移动
    const { inputManager } = this.engine;
    if (inputManager.isKeyDown(Keys.ArrowLeft)) {
      this.deltaX -= 1;
    } else if (inputManager.isKeyDown(Keys.ArrowRight)) {
      this.deltaX += 1;
    } else {
      this.deltaX = 0;
    }

    // 如果小鸡掉落到地面，重置时间和速度
    if (y <= -9) {
      this.time = 0;
      this.initSpeed = 3.5;
    }

    /**
     * 计算位置
     * 1. 计算更新时间：t=t+时间步长
     * 2. 更新角色的垂直速度（在竖直方向上的速度变化）：v=v+gt
     * 3. 更新角色的垂直位移（在竖直方向上的位置变化）：y = v * t
     */

    // 1. 计算更新时间：t=t+时间步长
    this.time += deltaTime;
    // 2. 更新角色的垂直速度（在竖直方向上的速度变化）：v=v+gt
    this.speed = this.initSpeed + this.g * this.time;
    // 3. 更新角色的垂直位移（在竖直方向上的位置变化）：y = v * t
    this.deltaY = this.speed * this.time;

    this.entity.transform.position.set(x + this.deltaX, this.deltaY + y, 0);
  }
}
