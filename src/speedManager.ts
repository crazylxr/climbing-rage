import { StairManager } from "./stairManager";

/**
 * @description 用于控制速度，每隔 10s，就加快一点速度
 */
const Interval = 10000;

export class SpeedManager {
	private _speedFactor: number = 1;
	private static _instance: SpeedManager;
	private increaseSpeedInterval: number;

	get speedFactor(): number {
		return this._speedFactor;
	}

	set speedFactor(value: number) {
		this._speedFactor = value;
	}

	public static get instance(): SpeedManager {
		if (!this._instance) {
			this._instance = new SpeedManager();
		}
		return this._instance;
	}

	constructor() {
		setTimeout(() => {
			this.increaseSpeed();
		}, Interval);
	}

	/**
	 * 增加速度
	 */
	private increaseSpeed(): void {
		this.increaseSpeedInterval = setTimeout(() => {
			const nextSpeedFactor = this._speedFactor * 0.9;
			if (nextSpeedFactor < 0.5) {
				return
			}

			clearInterval(StairManager.instance.timer);

			StairManager.instance.timer = setInterval(() => {
				StairManager.instance.addStair();
			}, 1000 * nextSpeedFactor);
			this.speedFactor = nextSpeedFactor;

			this.increaseSpeed();
		}, Interval);
	}

	start() {
		StairManager.instance.timer = setInterval(() => {
			StairManager.instance.addStair();
		}, 1000);
	}

	reset() {
		this.speedFactor = 1;
		clearTimeout(this.increaseSpeedInterval);
		clearInterval(StairManager.instance.timer);
	}

}