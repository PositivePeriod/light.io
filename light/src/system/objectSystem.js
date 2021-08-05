class ObjectSystem {
    constructor() {
        this.objects = new Map();
    }

    reset() {
        this.objects = new Map();
    }

    add(obj) {
        obj.type.forEach(type => {
            if (this.objects.has(type)) {
                this.objects.get(type).push(obj);
            } else { this.objects.set(type, [obj]) }
        })
    }

    find(type) {
        return this.objects.get(type) || [];
    }

    remove(obj) {
        obj.type.forEach(type => {
            var group = this.objects.get(type);
            var idx = group.indexOf(obj);
            if (idx > -1) { group.splice(idx, 1); } else { console.warn("Fail to remove obj;", obj); }
        })
    }
};

var objecySystem = new ObjectSystem();
export { objecySystem as ObjectSystem }