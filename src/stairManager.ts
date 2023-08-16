import { Entity, GLTFResource } from "@galacean/engine";
import { GameCtrl } from ".";

export class StairManager {
  private static _instance: StairManager;
  stairEntity: Entity;

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
        const { animations, defaultSceneRoot, entities } = resource;

        console.log("resource", resource);
        // defaultSceneRoot.transform.setPosition(0, 0, 0);
        // const one = entities![14];
        // const two = entities![29];
        // one.transform.setPosition(0, 0, -5);
        // one.transform.setRotation(30, 0, 0);

        // two.transform.setPosition(0, 3, -10);
        // two.transform.setRotation(30, 0, 0);
        // // rootEntity.addChild(resource.defaultSceneRoot);
        // rootEntity.addChild(one);
        // rootEntity.addChild(two);
        this.stairEntity = defaultSceneRoot;

        for (let i = 0; i < 5; i++) {
          const curEntity = defaultSceneRoot.children[i];
          curEntity.transform.setPosition(0, 3 * i, -5 * (i));
          curEntity.transform.setRotation(30, 0, 0);
					rootEntity.addChild(curEntity);
        }
      });
  }
}
