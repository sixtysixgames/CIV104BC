"use strict";
import {
    addBuyButtons, civData, civSizes, indexArrayByAttr, setIndexArrays, setupUI, ui, sysLog, addUITable, basicResources, homeBuildings, homeUnits,
    armyUnits, addUpgradeRows, normalUpgrades, addAchievementRows, addRaidRows, addWonderSelectText, makeDeitiesTables, load, renameCiv, renameRuler,
    setInitTradeAmount, setDefaultSettings, getPlayingTime, gameLoop, appSettings, paneSelect, lootable, sentenceCase, traceLog,
    save, onToggleAutosave, reset, deleteSave, renameDeity, textSize, onPurchase, onToggleCustomQuantities, onToggleNotes, onToggleIcons, spawn,
    speedWonder, selectDeity, iconoclasmList, plunder, trade, buy, startWonder, renameWonder, setGameSpeed, updateTradeButtons,
    setResourcesReqText, onBulkEvent} from "./index.js";

const setup = {};

//========== SETUP (Functions meant to be run once on the DOM)
setup.all = function () {
    setupUI();
    ui.find("#main").style.display = "none";
    setup.data();
    setup.civSizes();
    document.addEventListener("DOMContentLoaded", function (e) {
        setup.game();
        setup.events();
        
        setup.loop();
        // Show the game
        ui.find("#main").style.display = "block";
    });
};

setup.events = function () {
    let elem;
    // pane selectors
    let elems = document.getElementsByClassName("paneSelector");
    for (let i = 0; i < elems.length; ++i) {
        elems[i].onclick = paneSelect;
    }

    // settings buttons
    elem = document.getElementById("manualSave");
    elem.onmousedown = function () { return save('manual'); };

    elem = document.getElementById("toggleAutosave");
    elem.onclick = onToggleAutosave;

    elem = document.getElementById("resetGame");
    elem.onmousedown = function () { return reset(); };

    elem = document.getElementById("expButton");
    elem.onmousedown = function () { return save('export'); };

    elem = document.getElementById("impButton");
    elem.onmousedown = function () { return load('import'); };

    elem = document.getElementById("delSave");
    elem.onmousedown = function () { return deleteSave(); };

    elem = document.getElementById("renameCiv");
    elem.onmousedown = function () { return renameCiv(); };

    elem = document.getElementById("renameRuler");
    elem.onmousedown = function () { return renameRuler(); };

    elem = document.getElementById("renameDeity");
    elem.onmousedown = function () { return renameDeity(); };

    elem = document.getElementById("smallerText");
    elem.onmousedown = function () { return textSize(-1); };

    elem = document.getElementById("largerText");
    elem.onmousedown = function () { return textSize(1); };

    elem = document.getElementById("toggleCustomQuantities");
    elem.onclick = function (e) { onToggleCustomQuantities(e.target); };

    elem = document.getElementById("toggleNotes");
    elem.onclick = function (e) { onToggleNotes(e.target); };

    elem = document.getElementById("toggleIcons");
    elem.onclick = function (e) { onToggleIcons(e.target); };

    for (let i = 1; i <= 100000; i = i*10) {
        elem = document.getElementById("spawn"+i+"button");
        elem.onmousedown = function (e) { spawn(i); };
    }
    elem = document.getElementById("spawnMaxbutton");
    elem.onmousedown = function (e) { spawn(Infinity); };

    elem = document.getElementById("spawnCustomButton");
    elem.onmousedown = function (e) { spawn('custom'); };

    elem = document.getElementById("startWonder");
    elem.onmousedown = function (e) { startWonder(); };

    elem = document.getElementById("speedWonder");
    elem.onmousedown = function (e) { speedWonder(); };

    elem = document.getElementById("renameWonder");
    elem.onmousedown = function (e) { renameWonder(); };

    elem = document.getElementById("battleDeity");
    elem.onmousedown = function (e) { selectDeity('battle'); };

    elem = document.getElementById("fieldsDeity");
    elem.onmousedown = function (e) { selectDeity('fields'); };

    elem = document.getElementById("underworldDeity");
    elem.onmousedown = function (e) { selectDeity('underworld'); };

    elem = document.getElementById("catsDeity");
    elem.onmousedown = function (e) { selectDeity('cats'); };

    elem = document.getElementById("iconoclasm");
    elem.onmousedown = function (e) { iconoclasmList(); };

    elem = document.getElementById("plunder");
    elem.onmousedown = function (e) { plunder(); };

    elem = document.getElementById("tradeButton");
    elem.onmousedown = function (e) { trade(); };

    // buying resources
    let buttID = "";
    let butt;
    lootable.forEach(function (elem) {
        buttID = "buy" + sentenceCase(elem.id);
        butt = document.getElementById(buttID);
        butt.onmousedown = function (e) { buy(elem.id); };
    });

    elem = document.getElementById("gameSpeedSlow");
    elem.onclick = function (e) { setGameSpeed(2000); };
    elem = document.getElementById("gameSpeedNorm");
    elem.onclick = function (e) { setGameSpeed(1000); };
    elem = document.getElementById("gameSpeedFast");
    elem.onclick = function (e) { setGameSpeed(500); };


    let group = ui.find("#raidGroup");
    group.onmousedown = onBulkEvent;

};

setup.data = function () {
    setIndexArrays(civData);
};

setup.civSizes = function () {
    indexArrayByAttr(civSizes, "id");

    // Annotate with max population and index.
    civSizes.forEach(function (elem, i, arr) {
        elem.max_pop = (i + 1 < arr.length) ? (arr[i + 1].min_pop - 1) : Infinity;
        elem.idx = i;
    });

    civSizes.getCivSize = function (popcnt) {
        for (let i = 0; i < this.length; ++i) {
            if (popcnt <= this[i].max_pop) { return this[i]; }
        }
        return this[0];
    };
};

setup.game = function () {
    traceLog("app.setup.game");
    sysLog("Starting game");

    // we need to set up ui stuff before loading saved data
    addBuyButtons();
    addUITable(basicResources, "basicResources"); // Dynamically create the basic resource table.
    addUITable(homeBuildings, "buildings"); // Dynamically create the building controls table.
    addUITable(homeUnits, "jobs"); // Dynamically create the job controls table.
    addUITable(armyUnits, "party"); // Dynamically create the party controls table.
    addUpgradeRows(); // This sets up the framework for the upgrade items.
    //console.log("setup.game.normalUpgrades: " + normalUpgrades.);
    addUITable(normalUpgrades, "upgrades"); // Place the stubs for most upgrades under the upgrades tab.
    addAchievementRows();
    //addRaidRows();
    
    addWonderSelectText();
    makeDeitiesTables();

    setInitTradeAmount();
    setResourcesReqText();

    if (!load("localStorage")) { //immediately attempts to load
        //Prompt player for names
        renameCiv();
        renameRuler();
    }

    // update with current
    updateTradeButtons();
    
    setDefaultSettings();
};

setup.loop = function () {
    // This sets up the main game loop, which is scheduled to execute once per second.
    console.log("Setting up Main Loop");
    sysLog(getPlayingTime());
    gameLoop();
    appSettings.loopTimer = window.setInterval(gameLoop, 1000); //updates once per second (1000 milliseconds)
};

// run the game
setup.all();