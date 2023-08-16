import { Animator, GLTFResource } from "@galacean/engine";
import { GameCtrl } from ".";

export class ChickenManager {
  private static _instance: ChickenManager;

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
				defaultSceneRoot.transform.setPosition(0, 1.5, 0);
        defaultSceneRoot.transform.setRotation(0, 180, 0);
        const animation = defaultSceneRoot.getComponent(Animator);
        animation.play(animations![0].name);
      });
  }
}
