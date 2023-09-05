import {
  BoxColliderShape,
  Entity,
  GLTFResource,
  MeshRenderer,
  Script,
  StaticCollider,
  Vector3,
} from "@galacean/engine";
import { WireframeManager } from "@galacean/engine-toolkit-auxiliary-lines";
import { GameCtrl } from ".";
import { addWireframe } from "./util";

export class StairManager {
  static readonly intervalY = 2;
  static readonly intervalZ = 5;
  private static _instance: StairManager;
  /**
   * 用来放置梯子的根节点
   */
  stairRootEntity: Entity | null = null;
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

    if (this.stairRootEntity) {
      this.stairRootEntity.destroy();
      rootEntity.removeChild(this.stairRootEntity);
      this.stairRootEntity = null;
      this.stairEntityList = [];

      this.lastStairIndex = 4;
      this.firstStairIndex = 0;
      this.timer = 0;
    }

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

        // this.run();
      });
  }

  addColliders() {
    for (let i = 0; i < this.stairEntityList.length; i++) {
      const curEntity = this.stairEntityList[i];
      // 给硬币和添加碰撞体
      curEntity.children.forEach((child) => {
        if (child.name.includes("coin") || child.name.includes("obstacle")) {
          child.addComponent(CollisionScript);
        }
      });
      const wireframe = GameCtrl.instance.rootEntity?.addComponent(WireframeManager);
      wireframe?.addEntityWireframe(curEntity);
    }
  }

  run() {
    this.addColliders();

    // 先默认添加 5 个梯子
    for (let i = 0; i < 5; i++) {
      const curEntity = this.stairEntityList[i].clone();

      curEntity.transform.setPosition(
        0,
        -10 + StairManager.intervalY * i,
        -StairManager.intervalZ * i
      );
      curEntity.transform.setRotation(30, 0, 0);
      curEntity.addComponent(MoveScript);

      this.stairRootEntity!.addChild(curEntity);

      // const wireframe = GameCtrl.instance.rootEntity?.addComponent(WireframeManager);
      // wireframe?.addEntityWireframe(curEntity);
    }

    this.timer = setInterval(() => {
      this.addStair();
    }, 1000);
  }

  stop() {
    // 停止定时器, 停止梯子的移动
    clearInterval(this.timer);

    // 停止所有梯子的移动
    this.stairRootEntity!.children.forEach((entity) => {
      entity.getComponent(MoveScript).enabled = false;
    });
  }

  addStair() {
    console.log('add:', Date.now())
    if (this.lastStairIndex === 17) {
      this.lastStairIndex = 0;
    } else {
      this.lastStairIndex++;
    }

    const i = this.lastStairIndex;

    const curEntity = this.stairEntityList[i].clone();
    const { y, z } = this.stairRootEntity!.children[4].transform.position;
    curEntity.transform.setPosition(
      0,
      y + StairManager.intervalY,
      z - StairManager.intervalZ
    );
    curEntity.transform.setRotation(30, 0, 0);

    if(curEntity.getComponent(MoveScript)) {
      console.log('有了')
    }
    

    curEntity.addComponent(MoveScript);

    this.stairRootEntity!.addChild(curEntity);


    // 移除第一个梯子
    const firstEntity = this.stairRootEntity!.children[0];
    this.stairRootEntity!.removeChild(firstEntity);
  }
}

class MoveScript extends Script {
  onUpdate(deltaTime: number) {
    const { x, y, z } = this.entity.transform.position;
    this.entity.transform.setPosition(
      0,
      y - deltaTime * StairManager.intervalY ,
      z + deltaTime * StairManager.intervalZ
    );
  }
}

class CollisionScript extends Script {
  constructor(e) {
    super(e);

    const components: MeshRenderer[] = [];
    this.entity.getComponentsIncludeChildren(MeshRenderer, components);

    for (let i = 0; i < components.length; i++) {
      const { min, max } = components[i].bounds;
      this.addCollider(new Vector3(max.x - min.x, max.y - min.y, max.z - min.z),);
    }
  }

  addCollider(size: Vector3) {
    const physicsBox = new BoxColliderShape();
    physicsBox.size = size;
    physicsBox.position = new Vector3(0, 0, 0);
    physicsBox.material.staticFriction = 0.1;
    physicsBox.material.dynamicFriction = 0.2;
    physicsBox.material.bounciness = 1;
    physicsBox.isTrigger = true;

    const collier = this.entity.addComponent(StaticCollider);
    collier.addShape(physicsBox);
  }
}
