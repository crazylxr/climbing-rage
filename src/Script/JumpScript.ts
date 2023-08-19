import { Keys, Script } from "@galacean/engine";

export class JumpScript extends Script {
  // 上一次更新的时间
  time: number = 0;
  // 初速度
  initSpeed: number = 3.5;
  // 重力加速度
  g: number = -9.8;
  // 当前速度
  speed: number = this.initSpeed;
  // 当前的 y
  deltaY: number = this.entity.transform.position.y;
  deltaX = 0;

  onUpdate(deltaTime: number): void {
    const { x, y } = this.entity.transform.position;

    // 通过键盘控制小鸡的左右移动
    const { inputManager } = this.engine;
    if (inputManager.isKeyDown(Keys.ArrowLeft)) {
      this.deltaX -= 1;
    } else if (inputManager.isKeyDown(Keys.ArrowRight)) {
      this.deltaX += 1;
    } else {
      this.deltaX = 0;
    }

    // 如果小鸡掉落到地面，重置时间和速度
    if (y <= -9) {
      this.time = 0;
      this.initSpeed = 3.5;
    }

    /**
     * 计算位置
     * 1. 计算更新时间：t=t+时间步长
     * 2. 更新角色的垂直速度（在竖直方向上的速度变化）：v=v+gt
     * 3. 更新角色的垂直位移（在竖直方向上的位置变化）：y = v * t
     */

    // 1. 计算更新时间：t=t+时间步长
    this.time += deltaTime;
    // 2. 更新角色的垂直速度（在竖直方向上的速度变化）：v=v+gt
    this.speed = this.initSpeed + this.g * this.time;
    // 3. 更新角色的垂直位移（在竖直方向上的位置变化）：y = v * t
    this.deltaY = this.speed * this.time;

    this.entity.transform.position.set(x + this.deltaX, this.deltaY + y, 0);
  }
}
