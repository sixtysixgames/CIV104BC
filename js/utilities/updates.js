"use strict";
import {
    abs, achData, alignmentType, armyUnits, basicResources, buildingData, buildingType, calculatePopulation, calcWorkerCost, calcZombieCost, canAfford, canPurchase,
    civData, civObjType, civSizes, curCiv, dataset, deityDomains, wonderSelect, lootable, getBuyButton, setInitTradePrice,
    getCombatants, getCivType, getCurDeityDomain, getCurrentAltarId, getLandTotals, getReqText, getWonderLowItem, homeBuildings, homeUnits,
    idToType, isTraderHere, isUnderAttack, isValid, isWonderLimited, logSearchFn, makeDeitiesTables, meetsPrereqs, onBulkEvent, placeType, population, powerData, prettify,
    settings, sgn, subTypes, sysLog, unitData, upgradeData, ui, UIComponents, wonderResources, traceLog, updateTradeButton, setReqText,
    neighbours, prettifyLargeNumber, resourceType
} from "../index.js";

// Update functions. Called by other routines in order to update the interface.
function updateAll() {
    updateTrader();
    updateUpgrades();
    updateResourceRows(); //Update resource display
    updateBuildingButtons();
    updateJobButtons();
    updatePartyButtons();
    updatePopulation();
    updateTargets();
    updateDevotion();
    updateWonder();
    updateReset();
    updateGameDate();
}

function updateWonderList() {
    if (curCiv.wonders.length === 0) { return; }

    //update wonder list
    let wonderhtml = "<tr><td><strong>Name</strong></td><td><strong>Type</strong></td></tr>";
    for (let i = (curCiv.wonders.length - 1); i >= 0; --i) {
        try {
            wonderhtml += "<tr><td>" + curCiv.wonders[i].name + "</td><td>" + curCiv.wonders[i].resourceId + "</td></tr>";
        } catch (err) {
            console.warn("updateWonderList() Could not build wonder row " + i);
            console.trace();
            sysLog("Could not build wonder row " + i);
        }
    }
    ui.find("#pastWonders").innerHTML = wonderhtml;
}

function updateReset() {
    ui.show("#resetNote", (civData.worship.owned || curCiv.curWonder.stage === 3));
    ui.show("#resetDeity", (civData.worship.owned));
    ui.show("#resetWonder", (curCiv.curWonder.stage === 3));
    ui.show("#resetBoth", (civData.worship.owned && curCiv.curWonder.stage === 3));
}

function updateAfterReset() {
    updateRequirements(civData.mill);
    updateRequirements(civData.fortification);
    updateRequirements(civData.battleAltar);
    updateRequirements(civData.fieldsAltar);
    updateRequirements(civData.underworldAltar);
    updateRequirements(civData.catAltar);

    ui.find("#graceCost").innerHTML = prettify(civData.grace.cost);
    //Update page with all new values
    updateResourceTotals();
    updateUpgrades();
    updateDeity();
    makeDeitiesTables();
    updateDevotion();
    updateTargets();
    updateJobButtons();
    updatePartyButtons();
    updateWonder();
    //Reset upgrades and other interface elements that might have been unlocked
    //xxx Some of this probably isn't needed anymore; the update routines will handle it.
    ui.find("#renameDeity").disabled = "true";
    ui.find("#raiseDead").disabled = "true";
    ui.find("#raiseDead100").disabled = "true";
    ui.find("#raiseDeadMax").disabled = "true";
    ui.find("#smite").disabled = "true";
    ui.find("#wickerman").disabled = "true";
    ui.find("#pestControl").disabled = "true";
    ui.find("#grace").disabled = "true";
    ui.find("#walk").disabled = "true";
    ui.find("#ceaseWalk").disabled = "true";
    ui.find("#lure").disabled = "true";
    ui.find("#companion").disabled = "true";
    ui.find("#comfort").disabled = "true";
    ui.find("#book").disabled = "true";
    ui.find("#feast").disabled = "true";
    ui.find("#blessing").disabled = "true";
    ui.find("#waste").disabled = "true";
    ui.find("#riddle").disabled = "true";
    ui.find("#throne").disabled = "true";
    ui.find("#glory").disabled = "true";
    ui.find("#summonShade").disabled = "true";

    ui.find("#conquest").style.display = "none";

    ui.find(".alert").style.display = "none";
    ui.find("#tradeContainer").style.display = "none";
    ui.find("#tradeUpgradeContainer").style.display = "none";
    ui.find("#iconoclasmList").innerHTML = "";
    ui.find("#iconoclasm").disabled = false;
}

function updateTrader() {
    let isHere = isTraderHere();
    if (isHere && civData[curCiv.trader.materialId]) {
        ui.find("#tradeType").innerHTML = civData[curCiv.trader.materialId].getQtyName(curCiv.trader.requested);
        ui.find("#tradeRequested").innerHTML = prettify(curCiv.trader.requested);
        ui.find("#traderTimer").innerHTML = curCiv.trader.timer + " second" + ((curCiv.trader.timer != 1) ? "s" : "");
    }

    ui.show("#tradeContainer", isHere);
    ui.show("#noTrader", !isHere);
    ui.show("#tradeSelect .alert", isHere);
    return isHere;
}

//xxx This should become an onGain() member method of the building classes
function updateRequirements(buildingObj) {
    let displayNode = document.getElementById(buildingObj.id + "Cost");
    if (displayNode) {
        let reqText = getReqText(buildingObj.require);
        if (buildingObj.type === civObjType.building && buildingObj.land > 1) {
            reqText = buildingObj.land + " land: " + reqText;
        }
        displayNode.innerHTML = reqText;
    }
}

function updatePurchaseRow(purchaseObj) {
    if (!purchaseObj) { return; }

    let elem = ui.find("#" + purchaseObj.id + "Row");
    if (!elem) { console.warn("updates.updatePurchaseRow() Missing UI element for " + purchaseObj.id); console.trace(); return; }

    // If the item's cost is variable, update its requirements.
    if (purchaseObj.hasVariableCost()) {
        updateRequirements(purchaseObj);
    }

    // Already having one reveals it as though we met the prereq.
    // freeLand added to stop annoying UI jump
    let havePrereqs = (purchaseObj.owned > 0) || meetsPrereqs(purchaseObj.prereqs) || purchaseObj.id == buildingType.freeLand;

    // Special check: Hide one-shot upgrades after purchase; they're
    // redisplayed elsewhere.
    let hideBoughtUpgrade = ((purchaseObj.type == civObjType.upgrade) && (purchaseObj.owned == purchaseObj.limit) && !purchaseObj.salable);

    let maxQty = canPurchase(purchaseObj);
    let minQty = canPurchase(purchaseObj, -Infinity);

    let buyElems = elem.querySelectorAll("[data-action='purchase']");

    buyElems.forEach(function (elt) {
        let purchaseQty = dataset(elt, "quantity");
        // Treat 'custom' or Infinity as +/-1.
        //xxx Should we treat 'custom' as its appropriate value instead?
        let absQty = abs(purchaseQty);
        if ((absQty == "custom") || (absQty == Infinity)) {
            purchaseQty = sgn(purchaseQty);
        }
        elt.disabled = ((purchaseQty > maxQty) || (purchaseQty < minQty));
    });

    // Reveal the row if prereqs are met
    ui.show(elem, havePrereqs && !hideBoughtUpgrade);
}

// Only set up for the basic resources right now.
function updateResourceRows() {
    basicResources.forEach(function (elem) { updatePurchaseRow(elem); });
}
// Enables/disabled building buttons - calls each type of building in turn
// Can't do altars; they're not in the proper format.
function updateBuildingButtons() {
    homeBuildings.forEach(function (elem) {
        //console.log("updateBuildingButtons() " + elem.id);
        updatePurchaseRow(elem);
    });
}
// Update the page with the latest worker distribution and stats
function updateJobButtons() {
    homeUnits.forEach(function (elem) { updatePurchaseRow(elem); });
}
// Updates the party (and enemies)
function updatePartyButtons() {
    armyUnits.forEach(function (elem) { updatePurchaseRow(elem); });
}

//xxx Maybe add a function here to look in various locations for vars, so it
//doesn't need multiple action types?
function updateResourceTotals() {
    traceLog("updates.updateResourceTotals()");
    let i, displayElems, elem, val, obj;
    let landTotals = getLandTotals();

    // Scan the HTML document for elements with a "data-action" element of "display".  
    // The "data-target" of such elements(or their ancestors) 
    // is presumed to contain the global variable name to be displayed as the element's content.
    //xxx Note that this is now also updating nearly all updatable values, including population
    displayElems = document.querySelectorAll("[data-action='display']");
    for (i = 0; i < displayElems.length; ++i) {
        elem = displayElems[i];
        //xxx Have to use curCiv here because of zombies and other non-civData displays.
        //val = curCiv[dataset(elem, "target")].owned;
        obj = civData[dataset(elem, "target")];
        if (!isValid(obj)) {
            obj = curCiv[dataset(elem, "target")];
        }
        if (!isValid(obj)) {
            console.warn("updateResourceTotals() Invalid object id=" + dataset(elem, "target"));
            continue;
        }

        val = obj.owned;

        if (!isValid(val) || typeof val != "number") {
            // hack to fix NaN stored
            console.warn("updates.updateResourceTotals() id = " + dataset(elem, "target"));
            console.warn("updates.updateResourceTotals() owned not number. = " + val);
            console.trace();
           // curCiv[dataset(elem, "target")].owned = 0;
           // val = curCiv[dataset(elem, "target")].owned;
            obj.owned = 0;
            val = obj.owned;
        }
        //elem.title = prettify(Math.floor(val));
        elem.title = val;
        
        if (isValid(obj) && obj.type === civObjType.resource && obj.id !== resourceType.corpses && obj.id !== resourceType.coins) {
            // we don't pretify population related resources on the top row
            elem.innerHTML = prettifyLargeNumber(Math.floor(val));
        }
        else {
             elem.innerHTML = prettify(Math.floor(val));
        }
    }

    // Update net production values for primary resources.  Same as the above,
    // but look for "data-action" == "displayNet".
    displayElems = document.querySelectorAll("[data-action='displayNet']");
    for (i = 0; i < displayElems.length; ++i) {
        elem = displayElems[i];
        val = civData[dataset(elem, "target")].net;

        if (!isValid(val) || typeof val != "number") {
            // hack to fix NaN stored
            console.warn("updates.updateResourceTotals() id = " + dataset(elem, "target"));
            console.warn("updates.updateResourceTotals() net not number. = " + val);
            console.trace();
            civData[dataset(elem, "target")].net = 0;
            val = civData[dataset(elem, "target")].net;
        }

        // Colourise net production values.
        if (val < 0) { elem.style.color = "#f00"; }
        else if (val > 0) { elem.style.color = "#0b0"; }
        else { elem.style.color = "#000"; }

        //elem.title = prettify(Math.floor(val));
        elem.title = val;
        elem.innerHTML = ((val <= 0) ? "" : "+") + prettifyLargeNumber(val);
    }

    //Update page with building numbers, also stockpile limits.
    let resID = "";
    lootable.forEach(function (resElem) {
        resID = "#max" + resElem.id;
        ui.find(resID).title = prettify(civData[resElem.id].limit);
        ui.find(resID).innerHTML = prettifyLargeNumber(civData[resElem.id].limit);
    });

    ui.find("#maxpiety").innerHTML = prettifyLargeNumber(civData.piety.limit);
    ui.find("#totalBuildings").innerHTML = prettify(landTotals.buildings);// + ". Land Used: " + prettify(landTotals.used);
    ui.find("#totalLand").innerHTML = prettify(landTotals.lands);
    ui.find("#usedLand").innerHTML = prettify(landTotals.used);

    // Unlock advanced control tabs as they become enabled (they never disable)
    // Temples unlock Deity, barracks unlock Conquest, having coins unlocks Trade.
    // Deity is also unlocked if there are any prior deities present.
    if ((civData.temple.owned > 0) || (curCiv.deities.length > 1)) { ui.show("#deitySelect", true); }
    if (civData.barracks.owned > 0) { ui.show("#conquestSelect", true); }
    if (civData.coins.owned > 0) { ui.show("#tradeSelect", true); }

    // Need to have enough resources to trade
    ui.find("#tradeButton").disabled = !curCiv.trader || !curCiv.trader.timer ||
        (civData[curCiv.trader.materialId] && civData[curCiv.trader.materialId].owned < curCiv.trader.requested);

    // Cheaters don't get names.
    ui.find("#renameRuler").disabled = (curCiv.rulerName == "Cheater");

    ui.show("#resourcesSelect .info", (curCiv.resourceClicks == 22) && (!curCiv.neverclickAch.owned));// neverclick is a possibility
    ui.show("#neverclickInfo", curCiv.resourceClicks == 22 && (!curCiv.neverclickAch.owned));

}

//Update page with numbers
function updatePopulation(calc) {
    let i, elem, elems, displayElems,
        spawn1button = ui.find("#spawn1button"),
        spawnCustomButton = ui.find("#spawnCustomButton"),
        spawnMaxbutton = ui.find("#spawnMaxbutton"),
        spawn10button = ui.find("#spawn10button"),
        spawn100button = ui.find("#spawn100button"),
        spawn1000button = ui.find("#spawn1000button"),
        spawn10000button = ui.find("#spawn10000button"),
        spawn100000button = ui.find("#spawn100000button");

    if (calc) { calculatePopulation(); }

    // Scan the HTML document for elements with a "data-action" element of
    // "display_pop".  The "data-target" of such elements is presumed to contain
    // the population subproperty to be displayed as the element's content.
    //xxx This selector should probably require data-target too.
    //xxx Note that relatively few values are still stored in the population
    // struct; most of them are now updated by the 'display' action run
    // by updateResourceTotals().
    displayElems = document.querySelectorAll("[data-action='display_pop']");
    displayElems.forEach(function (elt) {
        let prop = dataset(elt, "target");
        elt.innerHTML = prettify(Math.floor(population[prop]));
    });

    // loop over elements and if has an update then call it
    buildingData.forEach(function (elt) {
        if (isValid(elt.update)) {
            elt.update();
        }
    });

    ui.show("#totalSickRow", (population.totalSick > 0));

    // alert about sickness and attacks
    ui.show("#populationSelect .alert", (population.totalSick > 0) || isUnderAttack());

    //As population increases, various things change
    // Update our civ type name
    ui.find("#civType").innerHTML = getCivType();
    ui.find("#civTypeRaid").innerHTML = getCivType();

    //Unlocking interface elements as population increases to reduce unnecessary clicking
    //xxx These should be reset in reset()
    if (population.current >= 10) {
        if (!settings.customIncr) {
            elems = document.getElementsByClassName("unit10");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
        }
    }
    if (population.current >= 100) {
        if (!settings.customIncr) {
            elems = document.getElementsByClassName("building10");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
            elems = document.getElementsByClassName("unit100");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
        }
    }
    if (population.current >= 1000) {
        if (!settings.customIncr) {
            elems = document.getElementsByClassName("building100");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
            elems = document.getElementsByClassName("unit1000");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
            elems = document.getElementsByClassName("unitInfinity");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
        }
    }
    if (population.current >= 10000) {
        if (!settings.customIncr) {
            elems = document.getElementsByClassName("building1000");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
            elems = document.getElementsByClassName("unit10000");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
        }
    }
    if (population.current >= 100000) {
        if (!settings.customIncr) {
            elems = document.getElementsByClassName("building10000");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
            elems = document.getElementsByClassName("unit100000");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
        }
    }

    if (population.current >= 1000000) {
        if (!settings.customIncr) {
            elems = document.getElementsByClassName("building100000");
            for (i = 0; i < elems.length; i++) {
                ui.show(elems[i], !settings.customincr);
            }
        }
    }

    //Turning on/off buttons based on free space.
    let maxSpawn = Math.max(0, Math.min((population.limit - population.living), logSearchFn(calcWorkerCost, civData.food.owned)));

    spawn1button.disabled = (maxSpawn < 1);
    spawnCustomButton.disabled = (maxSpawn < 1);
    spawnMaxbutton.disabled = (maxSpawn < 1);
    spawn10button.disabled = (maxSpawn < 10);
    spawn100button.disabled = (maxSpawn < 100);
    spawn1000button.disabled = (maxSpawn < 1000);
    spawn10000button.disabled = (maxSpawn < 10000);
    spawn100000button.disabled = (maxSpawn < 100000);

    let canRaise = (getCurDeityDomain() == deityDomains.underworld && civData.devotion.owned >= 20);
    let maxRaise = canRaise ? logSearchFn(calcZombieCost, civData.piety.owned) : 0;
    ui.show("#raiseDeadRow", canRaise);
    ui.find("#raiseDead").disabled = (maxRaise < 1 || civData.corpses.owned < 1);
    ui.find("#raiseDeadMax").disabled = ((maxRaise < 1) || (civData.corpses.owned < 1));
    ui.find("#raiseDead100").disabled = (maxRaise < 100) || (civData.corpses.owned < 100);

    //Calculates and displays the cost of buying workers at the current population
    ui.find("#raiseDeadCost").innerHTML = prettify(Math.round(calcZombieCost(1)));

    ui.find("#workerNumMax").innerHTML = prettify(Math.round(maxSpawn));

    spawn1button.title = "Cost: " + prettify(Math.round(calcWorkerCost(1))) + " food";
    spawn10button.title = "Cost: " + prettify(Math.round(calcWorkerCost(10))) + " food";
    spawn100button.title = "Cost: " + prettify(Math.round(calcWorkerCost(100))) + " food";
    spawn1000button.title = "Cost: " + prettify(Math.round(calcWorkerCost(1000))) + " food";
    spawn10000button.title = "Cost: " + prettify(Math.round(calcWorkerCost(10000))) + " food";
    spawn100000button.title = "Cost: " + prettify(Math.round(calcWorkerCost(100000))) + " food";
    spawnMaxbutton.title = "Cost: " + prettify(Math.round(calcWorkerCost(maxSpawn))) + " food";

    ui.find("#workerCost").innerHTML = prettify(Math.round(calcWorkerCost(1)));

    updateJobButtons(); //handles the display of units in the player's kingdom.
    updatePartyButtons(); // handles the display of units out on raids.
    updateMorale();
    updateAchievements(); //handles display of achievements
    updatePopulationBar();
    updateLandBar();
}

function updatePopulationBar() {
    let barElt = ui.find("#populationBar");
    let h = '';
    function getUnitPercent(x, y) {
        return (Math.floor(100000 * (x / y)) / 1000);
    }
    unitData.forEach(function (unit) {
        let p;
        if (unit.isPopulation) {
            p = getUnitPercent(unit.owned, population.current);
            h += (
                '<div class="' + unit.id + '" '
                + ' style="width: ' + p + '%">'
                + '<span>' + (Math.round(p * 10) / 10) + '% ' + unit.plural + '</span>'
                + '</div>'
            );
        }
    });
    barElt.innerHTML = (
        '<div style="min-width: ' + getUnitPercent(population.current, population.limitIncludingUndead) + '%">'
        + h
        + '</div>'
    );
}

function updateLandBar() {
    let barElt = ui.find("#landBar");
    let landTotals = getLandTotals();
    //let p = (Math.floor(1000 * (landTotals.buildings / landTotals.lands)) / 10);
    let p = (Math.floor(1000 * (landTotals.used / landTotals.lands)) / 10);

    // show warnings if we're getting close to full
    let bg = "#aaccaa";
    //let pc = 100 - ((landTotals.buildings * 100) / landTotals.lands);
    let pc = 100 - ((landTotals.used * 100) / landTotals.lands);
    if (pc <= 5) {
        bg = "#ff3300";
    } else if (pc <= 10) {
        bg = "#ffcc00";
    }
    barElt.innerHTML = ('<div style="width: ' + p + '%; background-color: ' + bg + '"></div>');
}

function updateRaidBar(attacker, defender) {
    updateFightBar(attacker, defender, "#raidBar");
}
function updateMobBar(attacker, defender) {
    updateFightBar(defender, attacker, "#mobBar");
}
function updateFightBar(attacker, defender, elementId) {
    let barElt = ui.find(elementId);
    let h = '';
    let apc = attacker.owned * 100 / (attacker.owned + defender.owned);
    let dpc = 100 - apc;

    h += '<div class="attacker" style="width: ' + apc + '%"></div>';
    h += '<div class="defender" style="width: ' + dpc + '%"></div>';

    barElt.innerHTML = '<div style="min-width: 100%">' + h + '</div>';
}
// Check to see if the player has an upgrade and hide as necessary
// Check also to see if the player can afford an upgrade and enable/disable as necessary
function updateUpgrades() {
    let domain = getCurDeityDomain();
    let hasDomain = (getCurDeityDomain() === "") ? false : true;
    let canSelectDomain = ((civData.worship.owned) && !hasDomain);

    // Update all of the upgrades
    upgradeData.forEach(function (elem) {
        updatePurchaseRow(elem);  // Update the purchase row.
        // Show the already-purchased line if we've already bought it.
        ui.show(("#P" + elem.id), elem.owned);
    });

    // show the alert on the upgrades tab if one is available
    ui.show("#upgradesSelect .info", false);
    ui.show("#deitySelect .info", false);
    ui.show("#conquestSelect .info", false);
    ui.show("#tradeSelect .info", false);
    for (let s = 0; s < upgradeData.length; s++) {
        if (canPurchase(upgradeData[s]) && !upgradeData[s].owned) {
            if (upgradeData[s].subType === subTypes.normal) {
                ui.show("#upgradesSelect .info", true);
            }
            if (upgradeData[s].subType === subTypes.deity || upgradeData[s].subType === subTypes.pantheon) {
                ui.show("#deitySelect .info", true);
            }
            if (upgradeData[s].subType === subTypes.conquest) {
                ui.show("#conquestSelect .info", true);
            }
            if (upgradeData[s].subType === subTypes.trade) {
                ui.show("#tradeSelect .info", true);
            }
            //break;
        }
    }

    // Deity techs
    ui.show("#deityPane .notYet", (!hasDomain && !canSelectDomain));
    ui.find("#renameDeity").disabled = !civData.worship.owned;
    ui.show("#battleUpgrades", (getCurDeityDomain() == deityDomains.battle));
    ui.show("#fieldsUpgrades", (getCurDeityDomain() == deityDomains.fields));
    ui.show("#underworldUpgrades", (getCurDeityDomain() == deityDomains.underworld));
    ui.findAll("#civInfoTable .zombieWorkers").forEach(function (elem) {
        ui.show(elem, (curCiv.zombie.owned > 0));
    });

    ui.show("#catsUpgrades", (getCurDeityDomain() == deityDomains.cats));

    ui.show("#deityDomains", canSelectDomain);
    ui.findAll("#deityDomains button.purchaseFor500Piety").forEach(function (button) {
        button.disabled = (!canSelectDomain || (civData.piety.owned < 500));
    });

    ui.show("#" + domain + "Upgrades", hasDomain);

    // Conquest / battle standard
    ui.show("#conquest", civData.standard.owned);
    ui.show("#conquestPane .notYet", (!civData.standard.owned));

    // Trade
    ui.show("#tradeUpgradeContainer", civData.trade.owned);
    ui.show("#tradePane .notYet", !civData.trade.owned);
}

function updateDeity() {
    //console.log("updateDeity() current deity: " + curCiv.deities[0].name);
    let hasDeity = (curCiv.deities[0].name) ? true : false;

    //Update page with deity details
    ui.find("#deityAName").innerHTML = curCiv.deities[0].name;
    ui.find("#deityADomain").innerHTML = getCurDeityDomain() ? ", deity of " + idToType(getCurDeityDomain()) : "";
    ui.find("#deityADevotion").innerHTML = civData.devotion.owned;

    updateAltars();

    // Display if we have an active deity, or any old ones.
    ui.show("#deityContainer", hasDeity);
    ui.show("#activeDeity", hasDeity);
    ui.show("#oldDeities", (hasDeity || curCiv.deities.length > 1));
    ui.show("#pantheonContainer", (hasDeity || curCiv.deities.length > 1));
    ui.show("#iconoclasmGroup", (curCiv.deities.length > 1));
}

function updateAltars() {
    let altarID = getCurrentAltarId();
    let altars = 0;
    if (isValid(altarID)) {
        altars = civData[altarID].owned;
    }
    ui.find("#deityA" + "Altars").innerHTML = altars;
}

// Enables or disables availability of activated religious powers.
// Passive religious benefits are handled by the upgrade system.
function updateDevotion() {
    ui.find("#deityA" + "Devotion").innerHTML = civData.devotion.owned;
    updateAltars();

    // Process altars
    buildingData.forEach(function (elem) {
        if (elem.subType === subTypes.altar) {
            ui.show(("#" + elem.id + "Row"), meetsPrereqs(elem.prereqs));
            document.getElementById(elem.id).disabled = (!(meetsPrereqs(elem.prereqs) && canAfford(elem.require)));
        }
    });

    // Process activated powers
    powerData.forEach(function (elem) {
        if (elem.subType === subTypes.prayer) {
            //xxx raiseDead buttons updated by UpdatePopulationUI
            if (elem.id == "raiseDead") { return; }
            ui.show(("#" + elem.id + "Row"), meetsPrereqs(elem.prereqs));
            document.getElementById(elem.id).disabled = !(meetsPrereqs(elem.prereqs) && canAfford(elem.require));
        }
    });

    //xxx Smite should also be disabled if there are no foes.
    //xxx These costs are not yet handled by canAfford().
    if (population.healthy < 1) {
        ui.find("#wickerman").disabled = true;
        ui.find("#walk").disabled = true;
    }

    ui.find("#ceaseWalk").disabled = (civData.walk.rate == 0);
}

// Dynamically create the achievement display
function addAchievementRows() {
    let s = '';
    achData.forEach(function (elem) {
        s += (
            '<div class="achievement" title="' + elem.getQtyName() + ": " + elem.effectText + '">'
            + '<div class="unlockedAch" id="' + elem.id + '">' + elem.getQtyName() + '</div>'
            + '</div>'
        );
    });
    ui.find("#achievements").innerHTML += s;
}

// Displays achievements if they are unlocked
function updateAchievements() {
    achData.forEach(function (achObj) {
        ui.show("#" + achObj.id, achObj.owned);
    });
}

// Dynamically add the raid buttons for the various civ sizes.
function addRaidRows() {
    let s = '';
    civSizes.forEach(function (elem) {
        s += UIComponents.raidRow(elem);
    });

    let group = ui.find("#raidGroup");
    group.innerHTML += s;
    group.onmousedown = onBulkEvent;
}

// Dynamically add the buttons for the various resources.
function addBuyButtons() {
    traceLog("updates.addBuyButtons()");
    let s = '<table><tr><td valign=\"top\">';

    let counter = 0;
    lootable.forEach(function (elem) {
        s += getBuyButton(elem);
        counter++;
        if (counter == 9 ) {
            s += "</td><td valign=\"top\">"
        }
    });
    s += "</td></tr></table>";
    let group = ui.find("#buyButtonGroup");
    group.innerHTML += s;
    lootable.forEach(function (elem) {
        setInitTradePrice(elem);
    });
}

// Enable the raid buttons for eligible targets.
function updateTargets() {
    //console.log("updateTargets()");
    let i;
    let raidButtons = document.getElementsByClassName("raid");

    let haveArmy = false;

    ui.show("#victoryGroup", curCiv.raid.victory);
    ui.show("#conquestSelect .alert", curCiv.raid.victory);

    // Raid buttons are only visible when not already raiding.
    if (ui.show("#raidGroup", !curCiv.raid.raiding)) {
        if (getCombatants(placeType.party, alignmentType.player).length > 0) { haveArmy = true; }

        let curElem;
        for (i = 0; i < raidButtons.length; ++i) {
            // Disable if we have no standard, no army, or they are too big a target.
            curElem = raidButtons[i];

            let isDisabled = (!civData.standard.owned || !haveArmy);
            curElem.disabled = isDisabled;

            let neighbourID = dataset(curElem, "target");
            let neighbour = neighbours.find(n => n.id === neighbourID);

            if (neighbour != null) {
                let civsizeID = neighbourID + "civsize";
                let spanElem = document.getElementById(civsizeID);
                //spanElem.innerText = civSizes[curCiv.neighbours[idx].size].name;
                if (neighbour.size != "conquered") {
                    spanElem.innerText = civSizes[neighbour.size].name;
                }
                else {
                    spanElem.innerText = "Conquered";
                    curElem.disabled = true;
                    ui.show(curElem, false);
                }
            }
        }
    }
}

function updateMorale() {
    //updates the morale stat
    let happinessRank; // Lower is better
    let elt = ui.find("#morale");
    //first check there's someone to be happy or unhappy, not including zombies
    if (population.living < 1) {
        elt.className = "";
        updateMoraleIcon(0);
        return;
    }

    if (curCiv.morale.efficiency > 1.4) { happinessRank = 1; }
    else if (curCiv.morale.efficiency > 1.2) { happinessRank = 2; }
    else if (curCiv.morale.efficiency > 0.8) { happinessRank = 3; }
    else if (curCiv.morale.efficiency > 0.6) { happinessRank = 4; }
    else { happinessRank = 5; }

    elt.className = "happy-" + happinessRank;
    elt.title = curCiv.morale.efficiency;
    updateMoraleIcon(happinessRank);
}

function updateMoraleIcon(morale) {
    ui.show("#morale0", morale == 0);
    ui.show("#morale1", morale == 1);
    ui.show("#morale2", morale == 2);
    ui.show("#morale3", morale == 3);
    ui.show("#morale4", morale == 4);
    ui.show("#morale5", morale == 5);
}

function setResourcesReqText() {
    lootable.forEach(function (resElem) {
        setReqText(resElem);
    });
}

function addWonderSelectText() {
    let wcElem = ui.find("#wonderCompleted");
    if (!wcElem) {
        console.error("addWonderSelectText() Error: No wonderCompleted element found.");
        return;
    }
    let s = wcElem.innerHTML;
    wonderResources.forEach(function (elem, i, wr) {
        s += "<button id=\"" + elem.id + "\" >" + elem.getQtyName(0) + "</button>";
        // Add newlines to group by threes (but no newline for the last one)
        if (!((i + 1) % 3) && (i != wr.length - 1)) { s += "<br />"; }
    });

    wcElem.innerHTML = s;

    // assign onmousedown method to select buttons
    let elem;
    wonderResources.forEach(function (elem, i, wr) {
        elem = document.getElementById(elem.id);
        elem.onmousedown = function (e) { wonderSelect(elem.id); };
    });

}

//updates the display of wonders and wonder building
function updateWonder() {
    let haveTech = (civData.construction.owned && civData.theism.owned);
    let isLimited = isWonderLimited();
    let lowItem = getWonderLowItem();

    ui.show("#lowResources", isLimited);
    ui.show("#upgradesSelect .alert", isLimited);

    if (lowItem) {
        ui.find("#limited").innerHTML = " by low " + lowItem.getQtyName();
    }

    if (curCiv.curWonder.progress >= 100) {
        ui.find("#lowResources").style.display = "none";
    }

    // Display this section if we have any wonders or could build one.
    ui.show("#wondersContainer", (haveTech || curCiv.wonders.length > 0));

    // Can start building a wonder, but haven't yet.
    ui.show("#startWonderLine", (haveTech && curCiv.curWonder.stage === 0));
    ui.find("#startWonder").disabled = (!haveTech || curCiv.curWonder.stage !== 0);

    // Construction in progress; show/hide building area and labourers
    ui.show("#labourerRow", (curCiv.curWonder.stage === 1));
    ui.show("#wonderInProgress", (curCiv.curWonder.stage === 1));
    ui.show("#speedWonderGroup", (curCiv.curWonder.stage === 1));
    ui.find("#speedWonder").disabled = (curCiv.curWonder.stage !== 1 || !canAfford({ gold: 100 }));
    if (curCiv.curWonder.stage === 1) {
        if (typeof curCiv.curWonder.progress != "number") {
            console.warn("updates.updateWonder() curCiv.curWonder.progress not a number");
            console.trace();
            curCiv.curWonder.progress = 0; // hack to fix NaN saved
        }
        ui.find("#progressBar").style.width = curCiv.curWonder.progress.toFixed(4) + "%";
        ui.find("#progressNumber").title = curCiv.curWonder.progress;//.toFixed(6);
        ui.find("#progressNumber").innerHTML = curCiv.curWonder.progress.toFixed(3);
    }

    // Finished, but haven't picked the resource yet.
    ui.show("#wonderCompleted", (curCiv.curWonder.stage === 2));
    updateWonderList();
}

function updateNote(id, text) {
    if (!isValid(id) || !isValid(text)) {
        return;
    }
    document.getElementById(id + "Note").innerHTML = ": " + text;
}

function updateGameDate() {
    if (!curCiv.loopCounter) {
        curCiv.loopCounter = 1;
    }
    else {
        // can't have been playing longer than since 29/06/2021 16:18
        let date1 = new Date();
        let date2 = new Date("June 29, 2021 16:18:00");

        // get total seconds between two dates
        let seconds = Math.floor(Math.abs(date1.getTime() - date2.getTime()) / 1000);

        if (curCiv.loopCounter > seconds) {
            curCiv.loopCounter = seconds;
        }
    }
    let elem = ui.find("#gameDate");
    if (curCiv.loopCounter % 60 != 0 && elem.innerHTML != "0000-00-00") { return; }

    elem.innerHTML = getPlayingTime();
}

function getPlayingTime() {
    let oneDay = 24 * 60 * 60;
    let oneHour = 60 * 60;
    let oneMinute = 60;
    let c = curCiv.loopCounter;
    let days = Math.floor(c / oneDay);
    c = c % oneDay;
    let hours = Math.floor(c / oneHour);
    c = c % oneHour;
    let mins = Math.floor(c / oneMinute);
    let secs = c % oneMinute;

    let ret = "Playing time: ";
    if (days > 0) { ret += days + " day" + (days > 1 ? "s " : " "); }
    if (hours > 0) { ret += hours + " hour" + (hours > 1 ? "s " : " "); }
    if (mins > 0) { ret += mins + " minute" + (mins > 1 ? "s " : " "); }
    if (secs > 0) { ret += secs + " second" + (secs > 1 ? "s " : " "); }

    return ret;
}
function getPlayingTimeShort() {
    let oneDay = 24 * 60 * 60;
    let oneHour = 60 * 60;
    let oneMinute = 60;
    let c = curCiv.loopCounter;
    let days = Math.floor(c / oneDay);
    c = c % oneDay;
    let hours = Math.floor(c / oneHour);
    c = c % oneHour;
    let mins = Math.floor(c / oneMinute);
    let seconds = c % oneMinute;

    let ret = "";
    if (days > 0) { ret += days + ":"; }

    ret += ('00' + hours).slice(-2) + ":";
    ret += ('00' + mins).slice(-2) + ":";
    ret += ('00' + seconds).slice(-2);

    return ret;
}

export {
    updateAll, updateWonderList, updateReset, updateAfterReset, updateTrader, updateRequirements, updatePurchaseRow, updateResourceRows, updateBuildingButtons,
    updateJobButtons, updatePartyButtons, updateResourceTotals, updatePopulation, updatePopulationBar, updateLandBar, updateRaidBar, updateMobBar, updateFightBar,
    updateUpgrades, updateDeity, updateAltars, updateDevotion, addAchievementRows, updateAchievements, addRaidRows, updateTargets, updateMorale, updateMoraleIcon,
    addWonderSelectText, updateWonder, updateNote, updateGameDate, getPlayingTime, getPlayingTimeShort, addBuyButtons, setResourcesReqText
};
