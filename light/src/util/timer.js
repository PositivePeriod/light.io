export class Timer {
    constructor() {
        this.time = Date.now();
    }

    now() {
        return Date.now() - this.time;
    }
}