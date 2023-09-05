import { Camera, WebGLEngine, Entity, Script, Pointer, StaticCollider, BoxColliderShape, Vector2 } from "@galacean/engine";
import { ChickenManager, JumpScript } from "./chickenManager";
import { GameState } from "./Eunm";
import { StairManager } from "./stairManager";
import { PhysXPhysics } from "@galacean/engine-physics-physx";
import { Score } from "./component/Score";
import { CtrlButton } from "./component/CtrlButton";
import { addWireframe } from "./util";

// const vConsole = new VConsole()

export class GameCtrl {
  private _engine: WebGLEngine;
  private static _instance: GameCtrl;
  private _rootEntity: Entity;
  private _state: GameState.NotInit;
  private _camera: Camera;
  ratio: number;
  invCanvasWidth: number;

  static get instance() {
    return this._instance || (this._instance = new GameCtrl());
  }

  get camera() {
    return this._camera;
  }

  set camera(value: Camera) {
    this._camera = value;
  }

  get engine() {
    return this._engine;
  }

  get rootEntity() {
    return this._rootEntity;
  }

  get state() {
    return this._state;
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
        // this.jump(GameState.Start);
        break;
      case GameState.Start:
        this.start();
        // 开始游戏
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
    this._rootEntity.findByName("ctrl").isActive = true;
  }

  /**
   * 初始化引擎
   * @param complete
   */
  async initEngine(complete: () => void) {
    WebGLEngine.create({ canvas: "canvas", physics: new PhysXPhysics() })
      .then((engine) => {
        engine.canvas.resizeByClientSize();
        (engine.canvas._webCanvas as HTMLCanvasElement).style.touchAction = "none";

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
    const camera = cameraEntity.addComponent(Camera);
    this.camera = camera;

    this.ratio = (camera.orthographicSize * 2) / GameCtrl.instance.engine.canvas.height;

    // this.ratio = camera.orthographicSize * 2 / document.cl

    const pos = cameraEntity.transform.position;
    pos.set(0, 0, 30);
    cameraEntity.transform.position = pos;

    // init light
    scene.ambientLight.diffuseSolidColor.set(1, 1, 1, 1);
    scene.ambientLight.diffuseIntensity = 1.2;

    this._rootEntity = rootEntity;

    // init 分数
    const scoreEntity = rootEntity.createChild("score");
    scoreEntity.addComponent(Score);

    const ctrlEntity = rootEntity.createChild("ctrl");
    ctrlEntity.addComponent(CtrlButton);

    this._engine.run();

    // 加载小鸡和楼梯
    StairManager.instance.loadStair();

    ChickenManager.instance.loadChicken().then(() => {
      // 初始化点击事件
      this.rootEntity.addComponent(HorizontalMoveScript);
    });
  }

  start() {
    StairManager.instance.run();
    ChickenManager.instance.run();
  }
}

GameCtrl.instance.jump(GameState.InitEngine);

// 水平移动脚本
export class HorizontalMoveScript extends Script {
  tempX: number;
  chickenEntity: Entity;
  chickenX: number;

  onAwake(): void {
    const boxCollider: StaticCollider =
      this.entity.addComponent(StaticCollider);
    const cubeSize = 10;
    const boxColliderShape = new BoxColliderShape();
    boxColliderShape.size.set(cubeSize, cubeSize, 0);
    boxColliderShape.position.set(0, -7, 0);
    boxCollider.addShape(boxColliderShape);
    // addWireframe(boxCollider);
  }
  onPointerDown(pointer: Pointer): void {
    this.tempX = pointer.position.x;
    this.chickenEntity = ChickenManager.instance.chickenEntity;
    this.chickenX = this.chickenEntity.transform.position.x;
  }
  onPointerDrag(pointer: Pointer): void {
    const deltaX = pointer.position.x - this.tempX;
    const ratio = GameCtrl.instance.ratio;

    this.chickenEntity.transform.position.x = this.chickenX + deltaX * ratio;
  }
}
