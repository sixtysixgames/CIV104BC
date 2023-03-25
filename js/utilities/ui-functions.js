"use strict";
import { appSettings, dataset, gameLoop, getLandTotals, getPlayingTimeShort, getReqText, isValid, population, settings, ui, updateResourceTotals } from "../index.js";

// Called when user switches between the various panes on the left hand side of the interface
// Returns the target pane element.
function paneSelect(e) {
    let oldTarget;

    let control = e.target;
    // Identify the target pane to be activated, and the currently active selector tab(s).
    let newTarget = dataset(control, "target");
    let selectors = ui.find("#selectors");
    if (!selectors) {
        console.log("paneSelect() No selectors found");
        sysLog("No selectors found");
        return null;
    }
    let curSelects = selectors.getElementsByClassName("selected");

    // Deselect the old panels.
    for (let i = 0; i < curSelects.length; ++i) {
        oldTarget = dataset(curSelects[i], "target");
        if (oldTarget == newTarget) { continue; }
        document.getElementById(oldTarget).classList.remove("selected");
        curSelects[i].classList.remove("selected");
    }

    // Select the new panel.
    control.classList.add("selected");
    let targetElem = document.getElementById(newTarget);
    if (targetElem) { targetElem.classList.add("selected"); }
    return targetElem;
}

function versionAlert() {
    console.log("versionAlert() New Version Available");
    ui.find("#versionAlert").style.display = "inline";
}

function prettify(input) {
    //xxx TODO: Add appropriate format options
    return (settings.delimiters) ? Number(input).toLocaleString() : input.toString();
}

function setAutosave(value) {
    if (value !== undefined) { settings.autosave = value; }
    ui.find("#toggleAutosave").checked = settings.autosave;
}
function onToggleAutosave(e) {
    let control = e.target;
    return setAutosave(control.checked);
}

function setCustomQuantities(value) {
    let i;
    let elems;
    let curPop = population.current;
    let totLand = getLandTotals().lands;

    if (value !== undefined) { settings.customIncr = value; }
    ui.find("#toggleCustomQuantities").checked = settings.customIncr;

    ui.show("#customJobQuantity", settings.customIncr);
    ui.show("#customPartyQuantity", settings.customIncr);
    ui.show("#customBuildQuantity", settings.customIncr);
    ui.show("#customSpawnQuantity", settings.customIncr);

    elems = document.getElementsByClassName("unit10");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (curPop >= 10));
    }

    elems = document.getElementsByClassName("unit100");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (curPop >= 100));
    }

    elems = document.getElementsByClassName("unit1000");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (curPop >= 1000));
    }

    elems = document.getElementsByClassName("unit10000");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (curPop >= 10000));
    }

    elems = document.getElementsByClassName("unit100000");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (curPop >= 100000));
    }

    elems = document.getElementsByClassName("unitInfinity");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (curPop >= 1000));
    }

    //totLand
    elems = document.getElementsByClassName("building10");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (totLand >= 100));
    }

    elems = document.getElementsByClassName("building100");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (totLand >= 1000));
    }

    elems = document.getElementsByClassName("building1000");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (totLand >= 10000));
    }

    elems = document.getElementsByClassName("building10000");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (totLand >= 100000));
    }

    elems = document.getElementsByClassName("building100000");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (totLand >= 1000000));
    }

    elems = document.getElementsByClassName("buildingInfinity");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], !settings.customIncr && (totLand >= 1000));
    }

    elems = document.getElementsByClassName("buycustom");
    for (i = 0; i < elems.length; ++i) {
        ui.show(elems[i], settings.customIncr);
    }
}

function onToggleCustomQuantities(control) {
    return setCustomQuantities(control.checked);
}

// Toggles the display of the .notes class
function setNotes(value) {
    if (value !== undefined) { settings.notes = value; }
    ui.find("#toggleNotes").checked = settings.notes;

    let elems = document.getElementsByClassName("note");
    for (let i = 0; i < elems.length; ++i) {
        ui.show(elems[i], settings.notes);
    }
}

function onToggleNotes(control) {
    return setNotes(control.checked);
}

// value is the desired change in 0.1em units.
function textSize(value) {
    if (value !== undefined) { settings.fontSize += 0.1 * value; }
    ui.find("#smallerText").disabled = (settings.fontSize <= 0.5);

    //xxx Should this be applied to the document instead of the body?
    ui.body.style.fontSize = settings.fontSize + "em";
}

// Does nothing yet, will probably toggle display for "icon" and "word" classes 
// as that's probably the simplest way to do this.
function setIcons(value) {
    if (value !== undefined) { settings.useIcons = value; }
    ui.find("#toggleIcons").checked = settings.useIcons;

    let elems = document.getElementsByClassName("icon");
    for (let i = 0; i < elems.length; ++i) {
        // Worksafe implies no icons.
        elems[i].style.visibility = (settings.useIcons && !settings.worksafe) ? "visible" : "hidden";
    }
}

function onToggleIcons(control) {
    //console.log("onToggleIcons: " + control.checked);
    return setIcons(control.checked);
}

//loopTimer = window.setInterval(gameLoop, 10)
function setGameSpeed(interval) {
    //console.log("setGameSpeed: " + interval);
    window.clearInterval(appSettings.loopTimer);
    appSettings.loopTimer = window.setInterval(gameLoop, interval);
}

// Generate two HTML <span> texts to display an item's cost and effect note.
function getCostNote(civObj) {
    // Only add a ":" if both items are present.
    //console.log("getCostNote.civObj=" + civObj.id);
    let reqText = getReqText(civObj.require);
    let effectText = (isValid(civObj.effectText)) ? civObj.effectText : "";
    let separator = (reqText && effectText) ? ": " : "";

    return "<span id='" + civObj.id + "Cost' class='cost'>" + reqText + "</span>"
        + "<span id='" + civObj.id + "Note' class='note'>" + separator + civObj.effectText + "</span>";
}

function setReqText(civObj) {
    if (!civObj || !civObj.require) {
        console.warn("ui-functions.setReqText() civObj or require not found");
        return;
    }
    //console.log("setReqText()" + civObj.id);
    let elem = ui.find("#" + civObj.id + "Req");
    if (!elem) {
        // not all resources have requirements
        //console.warn("ui-functions.setReqText() elem not found: " + "#" + civObj.id + "Req");
        return;
    }
    let reqText = getReqText(civObj.require);
    elem.innerHTML = reqText;
}

function gameLog(message) {
    let curTime = getPlayingTimeShort();
    message = sentenceCase(message);
    appSettings.logRepeat = logMessage("#logTable", curTime, message, appSettings.logRepeat); 
}

function logMessage(tableID, time, message, repeatCount) {
    let row, returnCount;
    message = sentenceCase(message);

    let logTable = ui.find(tableID);

    if (logTable.rows.length >= 100) {
        // remove latest
        logTable.deleteRow(99);
    }
    // get first row
    let currentRow = logTable.rows[0];
    // get previous message
    let prevMessage = currentRow.cells[1].innerHTML;

    if (message != prevMessage) {
        repeatCount = 1; //Reset the (xNumber) value
        // insert new row at top
        row = logTable.insertRow(0);
        row.insertCell(0);
        row.insertCell(1);
        row.insertCell(2);
    }
    else {
        repeatCount++;
        row = currentRow;
    }
    
    // add cells
    // time
    let cell = row.cells[0];
    cell.innerHTML = time;
    // message
    cell = row.cells[1];
    cell.innerHTML = message
    // repeats
    cell = row.cells[2];
    if (repeatCount > 1) {
        cell.innerHTML = "(x" + repeatCount + ")";
    }

    return repeatCount;
}

// outputs to the Event Log tab
function sysLog(message) {
    //get the current date, extract the current time in HH.MM format
    //xxx It would be nice to use Date.getLocaleTimeString(locale,options) here, but most browsers don't allow the options yet.
    let d = new Date();
    let curTime = d.getHours() + ":" + ((d.getMinutes() < 10) ? "0" : "") + d.getMinutes();

    appSettings.sysLogRepeat = logMessage("#syslogTable", curTime, message, appSettings.sysLogRepeat); 

    console.log("sysLog() " + message);
}
function tradeLog(message) {
    let curTime = getPlayingTimeShort();
    appSettings.tradeLogRepeat = logMessage("#tradeLogTable", curTime, message, appSettings.tradeLogRepeat); 
}
function raidLog(message) {
    let curTime = getPlayingTimeShort();
    appSettings.raidLogRepeat = logMessage("#raidLogTable", curTime, message, appSettings.raidLogRepeat); 
}
function achLog(message) {
    let curTime = getPlayingTimeShort();
    appSettings.achLogRepeat = logMessage("#achLogTable", curTime, message, appSettings.achLogRepeat); 
}
function traceLog(message) {
    // 66g todo: maybe a switch needed on the url
    // simple switch to turn on and off so we don't have to trawl through code
    if (false) {
        sysLog(message);
    }
}
function getCustomNumber(civObj) {
    if (!civObj || !civObj.customQtyId) { return undefined; }
    let elem = document.getElementById(civObj.customQtyId);
    if (!elem) { return undefined; }

    let num = Number(elem.value);

    // Check the above operations haven't returned NaN
    // Also don't allow negative increments.
    if (isNaN(num) || num < 0) {
        elem.style.background = "#f99"; //notify user that the input failed
        return 0;
    }

    num = Math.floor(num); // Round down

    elem.value = num; //reset fractional numbers, check nothing odd happened
    elem.style.background = "#fff";

    return num;
}

function sentenceCase(message) {
    // capitalize first letter
    if (!message || !isValid(message)) {
        return message;
    }
    return message.charAt(0).toUpperCase() + message.slice(1);
}

export {
    paneSelect, versionAlert, prettify, setAutosave, onToggleAutosave, setCustomQuantities, onToggleCustomQuantities, setNotes, onToggleNotes, textSize, 
    setIcons, onToggleIcons, getCostNote, gameLog, sysLog, getCustomNumber, sentenceCase, setGameSpeed, tradeLog, raidLog, achLog, traceLog, setReqText
};