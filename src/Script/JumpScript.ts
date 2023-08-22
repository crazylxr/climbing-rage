import { Keys, Script } from "@galacean/engine";

export class JumpScript extends Script {
  // 上一次更新的时间
  _time: number = 0;
  // 重力加速度
  _g: number = -10;
  // 初速度
  _initSpeed: number = -0.25 * this._g;
  // 当前速度
  _speed: number = this._initSpeed;
  // 当前的 y
  _deltaY: number = this.entity.transform.position.y;
  _deltaX = 0;

  onUpdate(deltaTime: number): void {
    const { x, y } = this.entity.transform.position;

    // 通过键盘控制小鸡的左右移动
    const { inputManager } = this.engine;
    if (inputManager.isKeyDown(Keys.ArrowLeft)) {
      this._deltaX -= 1;
    } else if (inputManager.isKeyDown(Keys.ArrowRight)) {
      this._deltaX += 1;
    } else {
      this._deltaX = 0;
    }

    console.log(this._deltaX);

    // 如果小鸡掉落到地面，重置时间和速度
    if (y <= -9) {
      this._time = 0;
      this._speed = this._initSpeed;
    }

    // 1. 计算更新时间：t=t+时间步长
    this._time += deltaTime;

    // y = v * t + 1/2 * g * t * t
    const _y = this._speed * this._time + 0.5 * this._g * this._time * this._time;

    this.entity.transform.position.set(x + this._deltaX, -9 + _y * 15, 0);
  }
}
