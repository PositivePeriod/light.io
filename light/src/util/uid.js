class UID {
    constructor() {
        this.length = 6;
        this.num = 0;
    }

    get() {
        if (this.num > 36 ** this.num) { console.error("Lack of new UID"); }
        return (this.num++).toString(36).padStart(this.length, 0)
    }
}

var uid = new UID();
export { uid as UID }