import { dataset, onInvade, onInvadeMult, increment, doPurchase } from "../index.js";

// For efficiency, we set up a single bulk listener for all of the buttons, rather
// than putting a separate listener on each button.
function onBulkEvent(e) {
    switch (dataset(e.target, "action")) {
        case "increment": return onIncrement(e.target);
        case "purchase": return onPurchase(e.target);
        case "raid": return onInvade(e.target);
        case "raid-mult": return onInvadeMult(e.target);
    }
    return false;
}

// Game functions
function onIncrement(control) {
    // We need a valid target to complete this action.
    let targetId = dataset(control, "target");
    if (targetId === null) { return false; }

    return increment(targetId);
}

function onPurchase(control) {
    // We need a valid target and a quantity to complete this action.
    let targetId = dataset(control, "target");
    if (targetId === null) { return false; }

    let qty = dataset(control, "quantity");
    if (qty === null) { return false; }

    return doPurchase(targetId, qty);
}

export {onBulkEvent, onIncrement, onPurchase };
