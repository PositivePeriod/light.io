export const SHAPE = Object.freeze(new Map([
    ["Rect", { "property": ["width", "height"], "hierarchy": 1 }],
    ["Circle", { "property": ["rad"], "hierarchy": 2 }],
    ["Donut", { "property": ["innerR", "outerR"], "hierarchy": 3 }],
    ["Tri", { "property": ["width", "height", "dir"], "hierarchy": 4 }],
    ["Hex", { "property": ["rad"], "hierarchy": 5 }],

]));

export const OBJECT = Object.freeze(new Map([
    ["GameObject", ["MapObject", "PlayerObject", "ProjectileObject", "MovableObject"]],
    ["MapObject", ["BouncyBackground", "RigidBackground", "Panel", "PullBackground"]],
    ["Panel", ["ShieldPanel", "WeakAttackPanel", "StrongAttackPanel", "TeleportPanel"]],
]));

// Not Correct