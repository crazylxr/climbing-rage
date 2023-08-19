import { Entity, GLTFResource, Script } from "@galacean/engine";
import { update } from "@tweenjs/tween.js";
import { GameCtrl } from ".";
import { addBoxCollider, MoveBy } from "./util";

export class StairManager {
  private static _instance: StairManager;
  /**
   * 用来放置梯子的根节点
   */
  stairRootEntity: Entity;
  stairEntityList: Entity[];
  lastStairIndex: number = 4; // 最后一块梯子的索引
  firstStairIndex: number = 0; // 第一块梯子的索引

  public static get instance(): StairManager {
    if (!this._instance) {
      this._instance = new StairManager();
    }
    return this._instance;
  }

  loadStair() {
    const { engine, rootEntity } = GameCtrl.instance;
    // 加载梯子 gltf 模型
    engine.resourceManager
      .load<GLTFResource>(
        "https://mdn.alipayobjects.com/afts/file/A*QpYQQpIfG8kAAAAAAAAAAAAADrd2AQ/stairs.gltf"
      )
      .then((resource) => {
        const { defaultSceneRoot } = resource;

        this.stairEntityList = defaultSceneRoot.children.concat();
        this.stairRootEntity = rootEntity.createChild("stairRootEntity");

        this.run();
      });
  }

  run() {
    for (let i = 0; i < 5; i++) {
      const curEntity = this.stairEntityList[i].clone();
      curEntity.transform.setPosition(0, -10 + 3 * i, -5 * i);
      curEntity.transform.setRotation(30, 0, 0);
      curEntity.addComponent(MoveByScript);

      // console.log("curEntity.children[0]", curEntity.children[0]);
      // addBoxCollider(curEntity.children[0], 1, true);

      this.stairRootEntity.addChild(curEntity);
    }

    setInterval(() => {
      this.addStair();
    }, 1000);
  }

  addStair() {
    if (this.lastStairIndex === 17) {
      this.lastStairIndex = 0;
    } else {
      this.lastStairIndex++;
    }

    const i = this.lastStairIndex;

    const curEntity = this.stairEntityList[i].clone();
    console.log("children", this.stairEntityList);
    console.log("curEntity", curEntity);
    console.log("i", i);
    const { y, z } = this.stairRootEntity.children[4].transform.position;
    curEntity.transform.setPosition(0, y + 3, z - 5);
    curEntity.transform.setRotation(30, 0, 0);

    curEntity.addComponent(MoveByScript);
    this.stairRootEntity.addChild(curEntity);

    const firstEntity = this.stairRootEntity.children[0];
    this.stairRootEntity.removeChild(firstEntity);
  }
}

class MoveByScript extends Script {
  onUpdate(deltaTime: number) {
    const { x, y, z } = this.entity.transform.position;
    this.entity.transform.setPosition(0, y - deltaTime * 3, z + deltaTime * 5);
  }
}
