import { Camera, Vector3, WebGLEngine, Entity, Script } from "@galacean/engine";
import { ChickenManager, JumpScript } from "./chickenManager";
import { GameState } from "./Eunm";
import { StairManager } from "./stairManager";
import { PhysXPhysics } from "@galacean/engine-physics-physx";

import { Score } from "./component/Score";

export class GameCtrl {
  private _engine: WebGLEngine;
  private static _instance: GameCtrl;
  private _rootEntity: Entity;
  private _state: GameState.NotInit;

  static get instance() {
    return this._instance || (this._instance = new GameCtrl());
  }

  get engine() {
    return this._engine;
  }

  get rootEntity() {
    return this._rootEntity;
  }

  /**
   * 跳转到某个状态
   * @param state - 状态
   * @param arg - 携带参数
   */
  jump(state: GameState) {
    switch (state) {
      case GameState.InitEngine:
        this.initEngine(() => {
          this.jump(GameState.InitScene);
        });
        break;
      case GameState.InitScene:
        this.initScene(() => this.jump(GameState.Start));
        this.jump(GameState.Start);
        break;
      case GameState.Start:
        // 开始游戏
        this._engine.run();
        break;
      case GameState.End:
        this.gameOver();
        break;
      default:
        break;
    }
  }

  gameOver() {
    ChickenManager.instance.chickenEntity.getComponent(JumpScript).enabled =
      false;

    StairManager.instance.stop();
  }

  /**
   * 初始化引擎
   * @param complete
   */
  async initEngine(complete: () => void) {
    WebGLEngine.create({ canvas: "canvas", physics: new PhysXPhysics() })
      .then((engine) => {
        engine.canvas.resizeByClientSize();
        this._engine = engine;
        complete();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * 初始化场景
   */
  initScene(complete: () => void) {
    const { _engine: engine } = this;
    const scene = engine.sceneManager.activeScene;
    const rootEntity = scene.createRootEntity();

    // init camera
    const cameraEntity = rootEntity.createChild("camera");
    cameraEntity.addComponent(Camera);
    const pos = cameraEntity.transform.position;
    pos.set(0, 0, 30);
    cameraEntity.transform.position = pos;
    cameraEntity.transform.lookAt(new Vector3(0, 0, 0));

    // init light
    scene.ambientLight.diffuseSolidColor.set(1, 1, 1, 1);
    scene.ambientLight.diffuseIntensity = 1.2;

    this._rootEntity = rootEntity;

    // rootEntity.addComponent(TweenScript);

    // 加载小鸡和楼梯
    ChickenManager.instance.loadChicken();
    StairManager.instance.loadStair();

    // init 分数
    const scoreEntity = rootEntity.createChild("score");
    scoreEntity.addComponent(Score);
  }
}

GameCtrl.instance.jump(GameState.InitEngine);

// class TweenScript extends Script {
//   onUpdate(deltaTime: number): void {
//     // ActionTweenGroup.update(deltaTime);
//     TWEEN.update();
//   }
// }
