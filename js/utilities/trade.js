"use strict";
import {
    civData, curCiv, gameLog, getRandomTradeableResource, isValid, population, prettify, resourceType, sysLog, ui, updateResourceTotals, updateTrader,
    tradeLog, lootable, traceLog
} from "../index.js";

/* Trade functions */
function setInitTradePrice(civObj) {
    traceLog("trade.setInitTradePrice");
    if (!isValid(civObj.initTradeAmount)) { return; }
    updateTradeButton(civObj.id, civObj.initTradeAmount);
}

function startTrader() {
    // check a couple of things, if one of these is missing, then all are probably missing
    if (!checkTradeAmounts(resourceType.food)) { return; }
    if (!checkTradeAmounts(resourceType.herbs)) { return; }
    if (!checkTradeAmounts(resourceType.metal)) { return; }

    // select a resource the player actually has some to trade
    let selected = getRandomTradeableResource();
    if (isValid(selected)) {
        // Set timer length (12 sec + 5 sec/upgrade)
        curCiv.trader.timer = 12 + (5 * (civData.currency.owned + civData.commerce.owned + civData.stay.owned));

        curCiv.trader.materialId = selected.id;
        curCiv.trader.requested = selected.baseTradeAmount * (Math.ceil(Math.random() * 100)); // Up to 20x amount
        // between 75% and 100% of resource limit
        let limit = Math.floor(selected.limit * 0.75) + Math.floor(selected.limit * Math.random() * 0.25);
        // don't request more than the player can own
        curCiv.trader.requested = Math.min(selected.limit, curCiv.trader.requested);
        // and finally, we don't want less than the initial amount
        if (curCiv.trader.requested < selected.initTradeAmount) {
            curCiv.trader.requested = selected.initTradeAmount;
        }
        curCiv.trader.userTraded = false; // has the user sold the requested
        updateTrader();
    }
}

function trade() {
    let materialId = curCiv.trader.materialId;
    if (!checkTradeAmounts(materialId)) { return; }
    //check we have enough of the right type of resources to trade
    if (!curCiv.trader.materialId || (curCiv.trader.materialId.owned < curCiv.trader.requested)) {
        tradeLog("Not enough resources to trade.");
        return;
    }

    //subtract resources, add gold
    let material = civData[curCiv.trader.materialId];

    material.owned -= curCiv.trader.requested;
    curCiv.trader.userTraded = true;
    ++civData.gold.owned;
    updateResourceTotals();

    tradeLog("Traded " + prettify(curCiv.trader.requested) + " " + material.getQtyName(curCiv.trader.requested));
}

function isTraderHere() {
    return (curCiv.trader.timer > 0);
}

function checkTradeAmounts(materialId) {
    let ret = true;
    if (!isValid(curCiv[materialId].tradeAmount)) { sysLog("Missing curCiv tradeAmount for " + materialId); ret = false; }
    if (!isValid(civData[materialId].baseTradeAmount)) { sysLog("Missing civData baseTradeAmount for " + materialId); ret = false; }
    return ret;
}

function buy(materialId) {
    if (!checkTradeAmounts(materialId)) { return; }
    if (civData.gold.owned < 1) { return; }

    let material = civData[materialId];
    let currentAmount = curCiv[materialId].tradeAmount;

    material.owned += currentAmount;
    --civData.gold.owned;

    updateResourceTotals();
    tradeLog("Bought " + prettify(currentAmount) + " " + material.getQtyName(currentAmount));
}

function updateTradeButton(materialId, cost) {
    traceLog("trade.updateTradeButton: " + materialId);
    let materialCostID = "#" + materialId + "Cost";
    let elem = ui.find(materialCostID);
    if (!elem) { console.warn("trade.updateTradeButton() Missing UI element for " + materialCostID); return; }

    elem.innerHTML = prettify(cost);
}

function updateTradeButtons() {
    traceLog("updates.updateTradeButtons");
    // 66g: iterate over salable resources
    lootable.forEach(function (elem) {
        updateTradeButton(elem.id, curCiv[elem.id].tradeAmount);
    });
}

function tickTraders() {
    let delayMult = 60 * (3 - ((civData.currency.owned) + (civData.commerce.owned)));
    let check;
    //traders occasionally show up
    if (population.current > 0) {
        ++curCiv.trader.counter;
    }
    if (population.current > 0 && curCiv.trader.counter > delayMult) {
        check = Math.random() * delayMult;
        if (check < (1 + (0.2 * (civData.comfort.owned)))) {
            curCiv.trader.counter = 0;
            startTrader();
        }
    }

    if (curCiv.trader.timer > 0) {
        curCiv.trader.timer--;
    }
    if (curCiv.trader.timer == 1 && civData.cornexchange.owned) {
        // here we call a function to change price on trade buttons just before trader leaves
        updateTradeAmount();
    }
}

function updateTradeAmount() {
    traceLog("updates.updateTradeAmount");
    let materialId = curCiv.trader.materialId;
    let origCost = curCiv[materialId].tradeAmount;

    // make it less obvious with another +/- 10% of base price
    let extra = Math.ceil((civData[materialId].baseTradeAmount / 10)) * Math.ceil((Math.random() * 5));
    let r = Math.random()
    if (r < 0.1) {
        curCiv[materialId].tradeAmount -= extra;
    }
    else if (r < 0.2) {
        curCiv[materialId].tradeAmount += extra;
    }
    // don't offer less than base amount
    curCiv[materialId].tradeAmount = Math.max(civData[materialId].baseTradeAmount, curCiv[materialId].tradeAmount);

    updateTradeButton(materialId, curCiv[materialId].tradeAmount);
    //
    if (origCost != curCiv[materialId].tradeAmount) {
        let material = civData[materialId];
        let verb = "remains at";
        if (origCost > curCiv[materialId].tradeAmount) {
            verb = "decreased to";
        }
        else if (origCost < curCiv[materialId].tradeAmount) {
            verb = "increased to";
        }
        tradeLog(material.getQtyName(1) + " trade amount " + verb + " " + prettify(curCiv[materialId].tradeAmount));
    }
}

export { setInitTradePrice, startTrader, trade, isTraderHere, checkTradeAmounts, buy, updateTradeButton, updateTradeButtons, tickTraders, updateTradeAmount };
