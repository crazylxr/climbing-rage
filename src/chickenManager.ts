import {
  Animator,
  BoxColliderShape,
  DynamicCollider,
  Entity,
  GLTFResource,
  Script,
  SphereColliderShape,
} from "@galacean/engine";
import { GameCtrl } from ".";
import { Score } from "./component/Score";
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
    other.collider.entity.destroy();
    console.log("onTriggerEnter", other);
    const { rootEntity } = GameCtrl.instance;
    rootEntity.findByName("score").getComponent(Score).addScore();
  }

  onPhysicsUpdate(): void {
    this.entity.transform.setPosition(0, -9, 0);
  }
}
