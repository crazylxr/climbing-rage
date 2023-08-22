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
import { JumpScript } from "./Script/JumpScript";
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
      rootEntity
        .findByName("score")
        .getComponent(Score)
        .setText("游戏结束 \n请点击下面的 「Play」 按钮\n重新开始游戏");
      // this.entity.getComponent(JumpScript).enabled = false;
      GameCtrl.instance.jump(GameState.End);
    }
  }
}
