import {
  BoxColliderShape,
  Entity,
  MeshRenderer,
  StaticCollider,
  Vector3,
} from "@galacean/engine";
import { WireframeManager } from "@galacean/engine-toolkit-auxiliary-lines";
import TWEEN from "@tweenjs/tween.js";
import { GameCtrl } from ".";

export const ActionTweenGroup = new TWEEN.Group();

export function MoveBy(
  entity: Entity,
  duration: number,
  to: { x?: number; y?: number; z?: number }
) {
  const _to = {
    x: entity.transform.position.x + to.x || 0,
    y: entity.transform.position.y + to.y || 0,
    z: entity.transform.position.z + to.z || 0,
  };

  console.log(_to);
  const cur = entity.transform.position;
  const coords = { x: cur.x, y: cur.y, z: cur.z }; // 从 (0, 0) 开始

  return new TWEEN.Tween(coords)
    .to(_to, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      entity.transform.setPosition(coords.x, coords.y, coords.z);
    })
    .start();
}
// requestAnimationFrame(ActionTweenGroup.update);

/**
 * @description 添加碰撞体
 * @param entity 需要添加碰撞体的实体
 * @param size 碰撞体的大小
 * @param needWireframe 是否需要辅助线
 */
export function addBoxCollider(
  entity: Entity,
  size: number,
  needWireframe: boolean
) {
  const cubeSize = size;
  // 增加小鸡的碰撞体
  const physicsBox = new BoxColliderShape();
  physicsBox.position = new Vector3(0, 1, 0);
  physicsBox.size = new Vector3(cubeSize, cubeSize, cubeSize);
  physicsBox.material.staticFriction = 0.1;
  physicsBox.material.dynamicFriction = 0.2;
  physicsBox.material.bounciness = 1;
  physicsBox.isTrigger = true;

  const collider = entity.addComponent(StaticCollider);
  collider.addShape(physicsBox);

  // 给碰撞体添加辅助线
  if (needWireframe) {
    addWireframe(collider);
  }
}

/**
 * @description 添加辅助线
 * @param collider
 */
export function addWireframe(collider: StaticCollider) {
  const { rootEntity } = GameCtrl.instance;
  // 添加小鸡辅助线
  rootEntity.addComponent(MeshRenderer);
  const wireframe = rootEntity.addComponent(WireframeManager);
  wireframe.addCollideWireframe(collider);
}
