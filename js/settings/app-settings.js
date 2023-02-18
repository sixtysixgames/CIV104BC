import { VersionData } from "../index.js";

const appSettings = {
    loopTimer: 0,

    // TODO: Update the version numbering internally
    version: 1, // This is an ordinal used to trigger reloads. 66g No it doesn't 
    //66g Always increment versionData if adding/modifying element to civData
    versionData: new VersionData(0, 2, 0, "alpha"), // this is not accurate.  

    saveTag: "bc104",
    saveTag2: function () { return this.saveTag + "2"; }, // For old saves.
    saveSettingsTag: function () { return this.saveTag + "Settings"; },
    logRepeat: 1,
    sysLogRepeat: 1,
    tradeLogRepeat: 1,
    raidLogRepeat: 1,
    achLogRepeat: 1
};

// These are settings that should probably be tied to the browser
let settings = {
    autosave: true,
    autosaveCounter: 1,
    autosaveTime: 120, //Currently autosave is every 2 minutes
    customIncr: false,
    fontSize: 1.0,
    delimiters: true,
    textShadow: false,
    notes: true,
    worksafe: false,
    useIcons: true
};

export { appSettings, settings};