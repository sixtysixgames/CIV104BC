﻿"use strict";
import {
    adjustMorale, appSettings, civData, CivObj, civSizes, curCiv, deleteCookie, getCurDeityDomain, haveDeity, isValid, LZString, makeDeitiesTables, mergeObj, migrateGameData, population,
    prettify, read_cookie, resetRaiding, saveTypes, selectDeity, resetCurCiv, lootable,
    setAutosave, setCustomQuantities, setIcons, setNotes, settings, sysLog, tallyWonderCount, textSize, ui, updateAfterReset,
    updateDeity, updateDevotion, updateJobButtons, updateMorale, updatePartyButtons, updateRequirements, updateResourceTotals, updateTargets, updateTradeButtons,
    updateUpgrades, updateWonder, VersionData, traceLog
} from "../index.js";

function setDefaultSettings() {
    // Here, we ensure that UI is properly configured for our settings.
    // Calling these with no parameter makes them update the UI for the current values.
    setAutosave();
    setCustomQuantities();
    textSize(0);
    setNotes();
    setIcons();
}

// Game infrastructure functions
function handleStorageError(err) {
    let msg;
    if ((err instanceof DOMException) && (err.code == DOMException.SECURITY_ERR)) { msg = "Browser security settings blocked access to local storage."; }
    else { msg = "Cannot access localStorage - browser may not support localStorage, or storage may be corrupt"; }
    console.error(err.toString());
    console.error(msg);
}

// Load in saved data
function load(loadType) {
    //deleteSave()
    traceLog("settings.load");

    //define load variables
    let loadVar = {},
        loadVar2 = {},
        settingsVar = {};
    let saveVersion = new VersionData(1, 0, 0, "legacy");

    if (loadType === "cookie") {
        //check for cookies
        if (read_cookie(appSettings.saveTag) && read_cookie(appSettings.saveTag2)) {
            //set variables to load from
            loadVar = read_cookie(appSettings.saveTag);
            loadVar2 = read_cookie(appSettings.saveTag2);
            loadVar = mergeObj(loadVar, loadVar2);
            loadVar2 = undefined;
            //notify user
            sysLog("Loaded saved game from cookie");
            sysLog("Save system switching to localStorage.");
        } else {
            console.error("load() Unable to find cookie");
            sysLog("Unable to find cookie");
            return false;
        }
    }

    if (loadType === "localStorage") {
        //check for local storage
        let string1;
        let string2;
        let settingsString;
        try {
            settingsString = localStorage.getItem(appSettings.saveSettingsTag);
            string1 = localStorage.getItem(appSettings.saveTag);
            string2 = localStorage.getItem(appSettings.saveTag2);

            if (!string1) {
                console.warn("load() Unable to find variables in localStorage. Attempting to load cookie.");
                console.trace();
                sysLog("Unable to find variables in localStorage. Attempting to load cookie.");
                //return load("cookie");
                return false;
            }
        } catch (err) {
            if (!string1) { // It could be fine if string2 or settingsString fail.
                handleStorageError(err);
                //return load("cookie");
                return false;
            }
        }

        // Try to parse the strings
        if (string1) { try { loadVar = JSON.parse(string1); } catch (ignore) { sysLog("Failed to parse string1"); } }
        if (string2) { try { loadVar2 = JSON.parse(string2); } catch (ignore) { sysLog("Failed to parse string2"); } }
        if (settingsString) { try { settingsVar = JSON.parse(settingsString); } catch (ignore) { sysLog("Failed to parse settingsString"); } }

        // If there's a second string (old save game format), merge it in.
        if (loadVar2) { loadVar = mergeObj(loadVar, loadVar2); loadVar2 = undefined; }

        if (!loadVar) {
            console.warn("load() Unable to parse variables in localStorage. Attempting to load cookie.");
            console.trace();
            sysLog("Unable to parse variables in localStorage. Attempting to load cookie.");
            return load("cookie");
        }

        //notify user
        sysLog("Loaded saved game from localStorage");
    }

    if (loadType === "import") {
        loadVar = importByInput(ui.find("#impexpField"));
    }

    saveVersion = mergeObj(saveVersion, loadVar.versionData);
    if (saveVersion.toNumber() > appSettings.versionData.toNumber()) {
        // Refuse to load saved games from future versions.
        let alertStr = "Cannot load; saved game version " + saveVersion + " is newer than game version " + appSettings.versionData;
        console.warn("load() " + alertStr);
        console.trace();
        sysLog(alertStr);
        alert(alertStr);
        return false;
    }
    if (saveVersion.toNumber() < appSettings.versionData.toNumber()) {
        // Migrate saved game data from older versions.
        let settingsVarReturn = { val: {} };
        migrateGameData(loadVar, settingsVarReturn);
        settingsVar = settingsVarReturn.val;

        // Merge the loaded data into our own, in case we've added fields.
        mergeObj(curCiv, loadVar.curCiv);
    } else {
        //curCiv = loadVar.curCiv; // No need to merge if the versions match; this is quicker.
        //curCiv is readonly with modules
        // we need to reset curCiv
        resetCurCiv();
        mergeObj(curCiv, loadVar.curCiv);
    }

    let lsgv = "Loaded save game version " + saveVersion.major + "." + saveVersion.minor + "." + saveVersion.sub + "(" + saveVersion.mod + ") via ";
    //console.log(lsgv, loadType);
    sysLog(lsgv + loadType);

    if (isValid(settingsVar)) { mergeObj(settings, settingsVar); }

    adjustMorale(0);
    updateRequirements(civData.mill);
    updateRequirements(civData.fortification);
    updateRequirements(civData.battleAltar);
    updateRequirements(civData.fieldsAltar);
    updateRequirements(civData.underworldAltar);
    updateRequirements(civData.catAltar);
    updateResourceTotals();
    updateJobButtons();
    makeDeitiesTables();
    updateDeity();
    updateUpgrades();
    updateTargets();
    updateDevotion();
    updatePartyButtons();
    updateMorale();
    updateWonder();
    tallyWonderCount();
    ui.find("#clicks").innerHTML = prettify(Math.round(curCiv.resourceClicks));
    ui.find("#civName").innerHTML = curCiv.civName;
    ui.find("#civNameRaid").innerHTML = curCiv.civName;
    ui.find("#rulerName").innerHTML = curCiv.rulerName;
    ui.find("#wonderNameP").innerHTML = curCiv.curWonder.name;
    ui.find("#wonderNameC").innerHTML = curCiv.curWonder.name;

    return true;
}

function importByInput(elt) {
    //take the import string, decompress and parse it
    let compressed = elt.value;
    let decompressed = LZString.decompressFromBase64(compressed);
    let revived = JSON.parse(decompressed);
    //set variables to load from
    let loadVar = revived[0];
    let loadVar2;
    if (isValid(revived[1])) {
        loadVar2 = revived[1];
        // If there's a second string (old save game format), merge it in.
        if (loadVar2) { loadVar = mergeObj(loadVar, loadVar2); loadVar2 = undefined; }
    }
    if (!loadVar) {
        console.error("importByInput() Unable to parse saved game string.");
        sysLog("Unable to parse saved game string.");
        return false;
    }

    //notify user
    sysLog("Imported saved game");

    return loadVar;
}

// Create objects and populate them with the variables, these will be stored in HTML5 localStorage.
// Cookie-based saves are no longer supported.
function save(savetype) {
    let xmlhttp;

    let saveVar = {
        versionData: appSettings.versionData, // Version information header
        curCiv: curCiv // Game data
    };

    let settingsVar = settings; // UI Settings are saved separately.

    // Handle export
    if (savetype == saveTypes.export) {
        let savestring = "[" + JSON.stringify(saveVar) + "]";
        console.log(savestring);
        let compressed = LZString.compressToBase64(savestring);
        console.log("save() Compressed save from " + savestring.length + " to " + compressed.length + " characters");
        sysLog("Compressed save from " + savestring.length + " to " + compressed.length + " characters");
        ui.find("#impexpField").value = compressed;
        sysLog("Exported game to text");
        return true;
    }

    //set localstorage
    try {
        // Delete the old cookie-based save to avoid mismatched saves
        deleteCookie(appSettings.saveTag);
        deleteCookie(appSettings.saveTag2);

        localStorage.setItem(appSettings.saveTag, JSON.stringify(saveVar));

        // We always save the game settings.
        localStorage.setItem(appSettings.saveSettingsTag, JSON.stringify(settingsVar));

        //Update console for debugging, also the player depending on the type of save (manual/auto)
        if (savetype == saveTypes.auto) {
            sysLog("Autosaved");
        } else if (savetype == saveTypes.manual) {
            alert("Game Saved");
            console.info("save() Manual Save");
            sysLog("Saved game");
        }
    } catch (err) {
        handleStorageError(err);

        if (savetype == saveTypes.auto) {
            console.error("save() Autosave Failed");
            sysLog("Autosave Failed");
        } else if (savetype == saveTypes.manual) {
            alert("Manual Save Failed!");
            console.error("save() Manual Save Failed");
            sysLog("Manual Save Failed");
        }
        return false;
    }

    return true;
}

function deleteSave() {
    //Deletes the current savegame by setting the game's cookies to expire in the past.
    if (!confirm("All progress and achievements will be lost.\nReally delete save?")) { return; } //Check the player really wanted to do that.

    try {
        deleteCookie(appSettings.saveTag);
        deleteCookie(appSettings.saveTag2);
        localStorage.removeItem(appSettings.saveTag);
        localStorage.removeItem(appSettings.saveTag2);
        localStorage.removeItem(appSettings.saveSettingsTag);
        console.info("deleteSave() Save Deleted");
        if (confirm("Save Deleted. Refresh page to start over?")) {
            window.location.reload();
        }
    } catch (err) {
        handleStorageError(err);
        alert("Save Deletion Failed!");
    }
}

function renameCiv(newName) {
    //Prompts player, uses result as new civName
    while (!newName) {
        newName = prompt("Please name your civilization", (newName || curCiv.civName || "Tribe"));
        if ((newName === null) && (curCiv.civName)) { return; } // Cancelled
    }

    curCiv.civName = newName;
    ui.find("#civName").innerHTML = curCiv.civName;
    ui.find("#civNameRaid").innerHTML = curCiv.civName;
}

function renameRuler(newName) {
    if (curCiv.rulerName == "Cheater") { return; } // Reputations suck, don't they?
    //Prompts player, uses result as rulerName
    while (!newName || haveDeity(newName) !== false) {
        newName = prompt("What is your name?", (newName || curCiv.rulerName || "Chief"));
        if ((newName === null) && (curCiv.rulerName)) { return; } // Cancelled
        if (haveDeity(newName) !== false) {
            alert("That would be a blasphemy against the deity " + newName + ".");
            newName = "";
        }
    }

    curCiv.rulerName = newName;
    ui.find("#rulerName").innerHTML = curCiv.rulerName;
}

// Looks to see if the deity already exists.  If it does, that deity
// is moved to the first slot, overwriting the current entry, and the
// player's domain is automatically assigned to match (for free).
function renameDeity(newName) {
    let i = false;
    while (!newName) {
        newName = prompt("Whom do your people worship?", (newName || curCiv.deities[0].name || "Deity"));
        if ((newName === null) && (curCiv.deities[0].name)) { return; } // Cancelled

        // If haveDeity returns a number > 0, the name is used by a legacy deity.
        // This is only allowed when naming (not renaming) the active deity.
        i = haveDeity(newName);
        if (i && curCiv.deities[0].name) {
            alert("That deity already exists.");
            newName = "";
        }
    }

    // Rename the active deity.
    curCiv.deities[0].name = newName;

    // If the name matches a legacy deity, make the legacy deity the active deity.
    if (i) {
        curCiv.deities[0] = curCiv.deities[i]; // Copy to front position
        curCiv.deities.splice(i, 1); // Remove from old position
        if (getCurDeityDomain()) { // Does deity have a domain?
            selectDeity(getCurDeityDomain(), true); // Automatically pick that domain.
        }
    }

    makeDeitiesTables();
}

function reset() {
    //console.log("Reset");
    //Resets the game, keeping some values but resetting most back to their initial values.
    let msg = "Really reset? You will keep past deities and wonders (and cats)"; //Check player really wanted to do that.
    if (!confirm(msg)) { return false; } // declined

    // Let each data subpoint re-init.
    civData.forEach(function (elem) { if (elem instanceof CivObj) { elem.reset(); } });

    curCiv.zombie.owned = 0;
    curCiv.grave.owned = 0;
    curCiv.enemySlain.owned = 0;
    curCiv.resourceClicks = 0; // For NeverClick
    curCiv.attackCounter = 0; // How long since last attack?
    curCiv.morale = { mod: 1.0, efficiency: 1.0 };

    // If our current deity is powerless, delete it.
    if (!curCiv.deities[0].maxDev) {
        curCiv.deities.shift();
    }
    // Insert space for a fresh deity.
    curCiv.deities.unshift({ name: "", domain: "", maxDev: 0 });

    // cannot assign to readonly var
    //population = {
    //    current: 0,
    //    limit: 0,
    //    healthy: 0,
    //    totalSick: 0
    //};

    population.current = 0;
    population.limit = 0;
    population.healthy = 0;
    population.totalSick = 0;


    resetRaiding();
    curCiv.raid.targetMax = civSizes[0].id;

    curCiv.trader.materialId = "";
    curCiv.trader.requested = 0;
    curCiv.trader.timer = 0;
    curCiv.trader.counter = 0; // How long since last trader?
    curCiv.trader.userTraded = false;

    //Neverclick ach test: curCiv.curWonder.stage === 3 && curCiv.resourceClicks <= 22;
    curCiv.curWonder.name = "";
    curCiv.curWonder.stage = 0;
    curCiv.curWonder.rushed = false;
    curCiv.curWonder.progress = 0;

    //curCiv.neighbour.north.targetMax = civSizes[0].id;
    //curCiv.neighbour.northwest.targetMax = civSizes[0].id;
    //curCiv.neighbour.northeast.targetMax = civSizes[0].id;
    //curCiv.neighbour.east.targetMax = civSizes[0].id;
    //curCiv.neighbour.west.targetMax = civSizes[0].id;
    //curCiv.neighbour.southeast.targetMax = civSizes[0].id;
    //curCiv.neighbour.southwest.targetMax = civSizes[0].id;
    //curCiv.neighbour.south.targetMax = civSizes[0].id;
    curCiv.neighbours = [
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id },
        { size: civSizes[0].id }
    ];

    resetTradeAmounts();

    updateAfterReset();
    sysLog("Game Reset"); //Inform player.

    renameCiv();
    renameRuler();

    return true;
}

function resetTradeAmounts() {
    traceLog("settings.resetTradeAmounts");

    lootable.forEach(function (elem) {
        //curCiv[elem.id].trdAmt = civData[elem.id].initTradeAmount;
        civData[elem.id].tradeAmount = civData[elem.id].initTradeAmount;
    });
}

function setInitTradeAmount() {
    traceLog("settings.setInitTradeAmount");
    lootable.forEach(function (elem) {
        if (!isValid(civData[elem.id].tradeAmount)) {
            civData[elem.id].tradeAmount = civData[elem.id].initTradeAmount;
        }
    });
}

function tickAutosave() {
    if (settings.autosave && (++settings.autosaveCounter >= settings.autosaveTime)) {
        settings.autosaveCounter = 0;
        // If autosave fails, disable it.
        if (!save(saveTypes.auto)) { settings.autosave = false; }
    }
}

export {
    setDefaultSettings, handleStorageError, load, importByInput, save, deleteSave, renameCiv, renameRuler, renameDeity, reset, resetTradeAmounts,
    setInitTradeAmount, tickAutosave
};
