import {
    civData, curCiv, gameLog, tickAutosave, calculatePopulation, clearSpecialResourceNets, doJobs, doDieOrSurvive, doStarve, doHomeless,
    checkResourceLimits, doMobs, doPestControl,
    tickGlory, doShades, doEsiege, doRaid, placeType, alignmentType, doRaidCheck,  doThrone,
    tickGrace, tickWalk, doLabourers, tickTraders, updateResourceTotals, testAchievements, updateAll
     } from "../index.js";

// dismissWorkers, doFarmers, doWoodcutters, doMiners, doBlacksmiths, doApothecaries, doTanners,
// doIronsmiths, doCharcoalBurners, doCoppersmiths, doLeadsmiths, doTinsmiths, doSilversmiths, doMercurysmiths, doGoldsmiths, doLimeBurners
// doGraveyards, doHealers, doPlague, doCorpses,
// Create a cat
function spawnCat() {
    ++civData.cat.owned;
    gameLog("Found a cat!");
}

function gameLoop() {
    //debugging - mark beginning of loop execution
    //let start = new Date().getTime();

    tickAutosave();
    calculatePopulation();

    // The "net" values for special resources are just running totals of the
    // adjustments made each tick; as such they need to be zero'd out at the
    // start of each new tick.
    clearSpecialResourceNets();

    // 66g import single function from jobs.js that does all jobs
    doJobs();

    // Check for starvation
    doStarve();
    // Need to kill workers who die from exposure.
    doHomeless();

    checkResourceLimits();

    //Timers - routines that do not occur every second
    doMobs();
    doPestControl();
    tickGlory();
    doShades();

    doRaid(placeType.party, alignmentType.player, alignmentType.enemy);
    doRaidCheck(placeType.party, alignmentType.player, alignmentType.enemy);

    //Population-related
    doDieOrSurvive();

    // deity/wonder related
    doThrone();
    tickGrace();
    tickWalk();
    doLabourers();

    // trade related
    tickTraders();

    updateResourceTotals(); //This is the point where the page is updated with new resource totals
    testAchievements();

    curCiv.loopCounter++;

    //Data changes should be done; now update the UI.
    updateAll();

    //Debugging - mark end of main loop and calculate delta in milliseconds
    //let end = new Date().getTime();
    //let time = end - start;
    //console.log("Main loop execution time: " + time + "ms");
}

export { spawnCat, gameLoop};