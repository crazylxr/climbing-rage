import {
  BoxColliderShape,
  Entity,
  GLTFResource,
  Script,
  StaticCollider,
  Vector3,
} from "@galacean/engine";
import { GameCtrl } from ".";
import { addBoxCollider, addWireframe, MoveBy } from "./util";

export class StairManager {
  private static _instance: StairManager;
  /**
   * 用来放置梯子的根节点
   */
  stairRootEntity: Entity;
  stairEntityList: Entity[];
  lastStairIndex: number = 4; // 最后一块梯子的索引
  firstStairIndex: number = 0; // 第一块梯子的索引
  timer = 0;

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
        console.log("resource梯子", resource);

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
      curEntity.addComponent(MoveScript);

      // 给硬币添加碰撞体
      curEntity.children.forEach((child) => {
        if (child.name.includes("coin") || child.name.includes("obstacle")) {
          child.addComponent(CollisionScript);
        }
      });

      this.stairRootEntity.addChild(curEntity);
    }

    this.timer = setInterval(() => {
      this.addStair();
    }, 500);
  }

  stop() {
    // 停止定时器, 停止梯子的移动
    clearInterval(this.timer);

    // 停止所有梯子的移动
    this.stairRootEntity.children.forEach((entity) => {
      entity.getComponent(MoveScript).enabled = false;
    });
  }

  addStair() {
    if (this.lastStairIndex === 17) {
      this.lastStairIndex = 0;
    } else {
      this.lastStairIndex++;
    }

    const i = this.lastStairIndex;

    const curEntity = this.stairEntityList[i].clone();
    const { y, z } = this.stairRootEntity.children[4].transform.position;
    curEntity.transform.setPosition(0, y + 3, z - 5);
    curEntity.transform.setRotation(30, 0, 0);

    curEntity.addComponent(MoveScript);

    // 给硬币添加碰撞体
    curEntity.children.forEach((child) => {
      child.addComponent(CollisionScript);
    });

    this.stairRootEntity.addChild(curEntity);

    // 移除第一个梯子
    const firstEntity = this.stairRootEntity.children[0];
    this.stairRootEntity.removeChild(firstEntity);
  }
}

class MoveScript extends Script {
  onUpdate(deltaTime: number) {
    const { x, y, z } = this.entity.transform.position;
    this.entity.transform.setPosition(0, y - deltaTime * 6, z + deltaTime * 10);
  }
}

class CollisionScript extends Script {
  // private _showWireframe: boolean = false;

  set showWireframe(value: boolean) {
    // this._showWireframe = value;

    if (value) {
      addWireframe(this.entity.getComponent(StaticCollider));
    }
  }

  onAwake(): void {
    // const sprites = this.entity.getComponent(MeshRenderer);
    // console.log("sprite", sprites);

    const cubeSize = 1;
    const physicsBox = new BoxColliderShape();
    physicsBox.size = new Vector3(cubeSize, cubeSize, cubeSize);
    physicsBox.position = new Vector3(0, 0, 0);
    physicsBox.material.staticFriction = 0.1;
    physicsBox.material.dynamicFriction = 0.2;
    physicsBox.material.bounciness = 1;
    physicsBox.isTrigger = true;

    const collier = this.entity.addComponent(StaticCollider);
    collier.addShape(physicsBox);
  }
}
