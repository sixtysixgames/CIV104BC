﻿"use strict";
import {
    civData, civSizes, curCiv, lootable, invadeable, population, unitData, neighbours,
    alignmentType, buildingType, combatTypes, mobTypeIds, placeType, speciesType,
    adjustMorale, dataset, calculatePopulation, gameLog, raidLog,
    getAltarsOwned, getCurrentAltarId, getLandTotals, getPietyEarnedBonus, getRandomSackableBuilding, getRandomLootableResource, getRandomWorker, getReqText, getResourceTotal,
    isValid, killUnit, prettify, rndRound, ui,
    updateAltars, updateRaidBar, updateMobBar, updatePartyButtons, updateRequirements, updateResourceTotals, updateTargets,
    BUILDING_LIST
} from "../index.js";

// there might be a better way to check this i.e. loop over all enemy types
function isUnderAttack() {
    return (curCiv.wolf.owned > 0) ||
        (curCiv.bandit.owned > 0) ||
        (curCiv.barbarian.owned > 0) ||
        (curCiv.invader.owned > 0);
}

// Reset the raid data.
function resetRaiding() {
    curCiv.raid.raiding = false;
    curCiv.raid.victory = false;
    curCiv.raid.epop = 0;
    curCiv.raid.plunderLoot = {};
    curCiv.raid.last = "";
    curCiv.raid.neighbour = {};

    // Also reset the enemy party units.
    unitData.filter(function (elem) { return ((elem.alignment == alignmentType.enemy) && (elem.place == placeType.party)); })
        .forEach(function (elem) { elem.reset(); });

    ui.show("#raidEventsContainer", true);
}

function getPlayerCombatMods() {
    let mods = 0.01 * (civData.riddle.owned + civData.weaponry.owned + civData.shields.owned + civData.armour.owned);
    // bandits should be a bit less than 0.05 + 0.04 = 0.09 ~0.06
    mods += 0.02 * (civData.stdweaponry.owned + civData.stdshields.owned + civData.stdarmour.owned);
    // barbarians should be a bit less than 0.05 + 0.04 + 0.6 = 0.15 ~0.11
    mods += 0.03 * (civData.advweaponry.owned + civData.advshields.owned + civData.advarmour.owned);
    // invaders should be a bit less than 0.05 + 0.04 + 0.6 + 0.9 = 0.24 ~0.19

    // total 0.04 + 0.06 + 0.09 = 0.19
    // soldiers = base = 0.05 + 0.19 = 0.24
    // cavalry = base = 0.08 + 0.19 = 0.27
    return mods;
}

/* Enemies */
function spawnMob(mobObj, num) {
    let num_sge = 0, msg = "";

    if (num === undefined) { // By default, base numbers on current population
        let max_mob = (population.limit / 50); // is this 2% too small? 
        //No! According to research a standing army was about 1% of total population
        // However, the enemy force should not be based on player population.  See invade
        num = Math.ceil(max_mob * Math.random());
    }

    if (num === 0) { return num; }  // Nobody came

    // Human mobs might bring siege engines.
    if (mobObj.species == speciesType.human) { num_sge = Math.floor(Math.random() * num / 100); }

    mobObj.owned += num;
    civData.esiege.owned += num_sge;

    msg = prettify(num) + " " + mobObj.getQtyName(num) + " attacked";  //xxx L10N
    if (num_sge > 0) { msg += ", with " + prettify(num_sge) + " " + civData.esiege.getQtyName(num_sge); }  //xxx L10N 
    gameLog(msg);

    return num;
}

/* War Functions */
function invade(ecivtype) {
    //invades a certain type of civilisation based on the button clicked
    curCiv.raid.raiding = true;
    curCiv.raid.last = ecivtype;

    let minpop = civSizes[ecivtype].min_pop;
    let maxpop = civSizes[ecivtype].max_pop;
    if (maxpop === Infinity) { maxpop = civSizes[ecivtype].min_pop * 2; }
    curCiv.raid.epop = minpop + Math.ceil((maxpop - minpop) * Math.random());

    if (civData.glory.timer > 0) { curCiv.raid.epop *= 2; } //doubles soldiers fought

    // Research show 1-5% of population could be soldiers, so we'll be generous with between 2 and 12
    civData.esoldier.owned += Math.ceil((curCiv.raid.epop / 50) + Math.floor(Math.random() * (curCiv.raid.epop / 10)));
    civData.efort.owned += Math.floor(Math.random() * (curCiv.raid.epop / 1000));
    // increase enemy efficiency depending on invasion target
    civData.esoldier.efficiency = civData.esoldier.efficiency_base + civSizes[ecivtype].efficiency;

    // 66g todo: should we should take into account size of raiding party, also number of lootable buildings = approx 0.1 of population
    //let baseLoot = Math.min(civData.soldierParty.owned + civData.cavalryParty.owned, curCiv.raid.epop / 10);
    //let baseLoot = Math.min(civData.soldierParty.owned + civData.cavalryParty.owned, curCiv.raid.epop - minpop);
    let baseLoot = Math.min((civData.soldierParty.owned + civData.cavalryParty.owned) / 2, curCiv.raid.epop - civData.esoldier.owned);
    baseLoot = Math.ceil(baseLoot);
    // Glory redoubles rewards
    baseLoot = baseLoot * (1 + (civData.glory.timer <= 0 ? 0 : 1));

    // Set rewards of land and other random plunder
    // land between 10 and 25% because it can be doubled with administration and we don't want to gain too much so we force player to conquest
    let baseLand = baseLoot * (1 + (civData.administration.owned));
    curCiv.raid.plunderLoot = {
        freeLand: Math.floor((baseLand * 0.1) + Math.round(Math.random() * (baseLand * 0.15)))
    };

    //console.log("baseLoot b=" + baseLoot);
    baseLoot -= curCiv.raid.plunderLoot.freeLand;
    //console.log("baseLoot a=" + baseLoot);

    // let's gain some buildings if we attack nations
    let counter = 0;
    let invaded = 0;
    let elem;
    if (civSizes[ecivtype].min_pop >= civSizes.smNation.min_pop) {
        //baseLand = curCiv.raid.plunderLoot.freeLand;
        baseLand = Math.floor(curCiv.raid.plunderLoot.freeLand / 2);
        curCiv.raid.plunderLoot.freeLand -= baseLand;
        //invadeable.forEach(function (elem) {
        BUILDING_LIST.forEach(function (elemid) {
            elem = civData[elemid];
            counter++;
            //if (baseLand > 0 && elem.id != buildingType.mill && elem.id != buildingType.fortification) {
            if (baseLand > 0) {
                //invaded = Math.floor((baseLand * Math.random()) / (invadeable.length * counter)); 
                invaded = Math.floor((baseLand * Math.random()) / (BUILDING_LIST.length * counter)); 
                //curCiv.raid.plunderLoot[elem.id] = Math.min(baseLand, invaded); // can't have more than available land
                curCiv.raid.plunderLoot[elem.id] = Math.min(baseLand, invaded * elem.land); // can't have more than available land
                baseLand -= curCiv.raid.plunderLoot[elem.id] * counter;
            }
            if (baseLand < 0) { baseLand = 0; }
        });
        curCiv.raid.plunderLoot.freeLand += baseLand; // if there's any left
    }

    counter = 0;
    lootable.forEach(function (elem) {
        counter++;
        if (baseLoot > 0) {
            curCiv.raid.plunderLoot[elem.id] = Math.floor(baseLoot * Math.random());
            //66g we don't want rare resources plundered from low population, so decrease baseLoot quicker
            baseLoot -= curCiv.raid.plunderLoot[elem.id];
        }
        if (baseLoot < 0) { baseLoot = 0; }
    });

    let msg = civSizes[ecivtype].name + " raises an army of " + prettify(civData.esoldier.owned);
    if (civData.efort.owned > 0) {
        msg += " with " + prettify(civData.efort.owned) + " fortifications";
    }
    raidLog(msg);
    ui.hide("#raidNews");
    ui.hide("#raidEventsContainer");
    updateTargets(); //Hides raid buttons until the raid is finished
    updatePartyButtons();
}

function onInvade(control) { return invadeNeighbour(dataset(control, "target")); }
function invadeNeighbour(neighbourID) {
    //console.log("invadeNeighbour() = " + neighbourID);
    let neighbour = neighbours.find(neighbour => neighbour.id === neighbourID);

    curCiv.raid.neighbour = neighbour;
    invade(neighbour.size);
}

function plunder() {
    //console.log("plunder()");
    let plunderMsg = "";
    let raidNewsElt = ui.find("#raidNews");

    // If we fought our largest eligible foe, but not the largest possible, raise the limit.
    if ((curCiv.raid.neighbour.size != civSizes[civSizes.length - 1].id) && curCiv.raid.last == curCiv.raid.neighbour.size) {
        curCiv.raid.neighbour.size = civSizes[civSizes[curCiv.raid.neighbour.size].idx + 1].id;
    }
    else if (curCiv.raid.neighbour.size == civSizes[civSizes.length - 1].id) {
        curCiv.raid.neighbour.size = "conquered";
    }
    // Improve morale based on size of defeated foe.
    adjustMorale((civSizes[curCiv.raid.last].idx + 1) / 100);

    // Lamentation
    if (civData.lament.owned) { curCiv.attackCounter -= Math.ceil(curCiv.raid.epop / 2000); }

    // Collect loot
    let num;
    let lootObj = curCiv.raid.plunderLoot;
    for (let i in lootObj) {
        num = lootObj[i];
        if (!num) { continue; }
        civData[i].owned += num;
    }

    // Create message to notify player
    let where = curCiv.raid.neighbour.name + "ern ";
    plunderMsg = where + civSizes[curCiv.raid.last].name + " raided! (pop. " + prettify(curCiv.raid.epop) + ")<br/>";
    let lootMsg = getReqText(curCiv.raid.plunderLoot);
    if (lootMsg == "") {
        lootMsg = "nothing";
    }
    plunderMsg += "Plundered " + lootMsg + ". ";
    raidLog(plunderMsg);

    ui.show(raidNewsElt, true);
    raidNewsElt.innerHTML = "Results of last raid: " + plunderMsg;

    // Victory outcome has been handled, end raid
    resetRaiding();
    updateResourceTotals();
    updateTargets();
}

// Returns all of the combatants present for a given place and alignment that.
function getCombatants(place, alignment) {
    //console.log("getCombatants() place=" + place + ". align=" + alignment);
    return unitData.filter(function (elem) {
        return ((elem.alignment == alignment) && (elem.place == place)
            && (elem.combatType) && (elem.owned > 0));
    });
}

// Some attackers get a damage mod against some defenders
//https://history.stackexchange.com/questions/838/how-well-can-cavalry-fight-infantry
//https://en.wikipedia.org/wiki/Infantry_in_the_Middle_Ages#Infantry_versus_cavalry
function getCasualtyMod(attacker, defender) {
    // Cavalry take 50% more casualties vs infantry - 66G todo seems a bit high  
    if ((defender.combatType == combatTypes.cavalry) && (attacker.combatType == combatTypes.infantry)) { return 1.50; }

    return 1.0; // Otherwise no modifier
}

function doFight(attacker, defender) {
    //console.log("doFight()");
    if ((attacker.owned <= 0) || (defender.owned <= 0)) { return; }

    // Defenses vary depending on whether the player is attacking or defending.
    let fortMod = (defender.alignment == alignmentType.player ? (civData.fortification.owned * civData.fortification.efficiency)
                                                              : (civData.efort.owned * civData.efort.efficiency));

    // 66g HACK! if fortmod is 1 or greater, there will be no defense casualties.  
    // This happens if over 100 fortification are owned because fort efficiency is 0.01
    //if (fortMod >= 1.0) {
    //    fortMod = 0.99;
    //}

    let defenceMod = 0;
    if (defender.alignment == alignmentType.player) {
        defenceMod += civData.rampart.owned ? civData.rampart.efficiency : 0;
        defenceMod += civData.palisade.owned ? civData.palisade.efficiency : 0;
        defenceMod += civData.battlement.owned ? civData.battlement.efficiency : 0;
    }
    //var palisadeMod = ((defender.alignment == "player")&&(civData.palisade.owned)) * civData.palisade.efficiency;
    // Determine casualties on each side.  
    // Round fractional casualties probabilistically, and don't inflict more than 100% casualties.
    //let attackerCas = Math.ceil(Math.min(attacker.owned, rndRound(getCasualtyMod(defender, attacker) * defender.owned * defender.efficiency)));
    let attackerCas = rndRound(getCasualtyMod(defender, attacker) * defender.owned * defender.efficiency);
    //let defenderCas = Math.ceil(Math.min(defender.owned, rndRound(getCasualtyMod(attacker, defender) * attacker.owned * (attacker.efficiency - defenceMod) * Math.max(1 - fortMod, 0))));
    let defenderCas = rndRound(getCasualtyMod(attacker, defender) * attacker.owned * (attacker.efficiency - defenceMod));

    //console.log("1. defender: " + defenderCas + ". attacker: " + attackerCas);
    attackerCas = Math.min(attacker.owned, attackerCas);
    defenderCas = Math.min(defender.owned, defenderCas);

    //console.log("2. defender: " + defenderCas + ". attacker: " + attackerCas);
    defenderCas = Math.ceil(defenderCas / (1 + fortMod));
    //console.log("3. defender: " + defenderCas + ". attacker: " + attackerCas);

    attackerCas = Math.min(attacker.owned, Math.ceil(attackerCas * Math.random()));
    defenderCas = Math.min(defender.owned, Math.ceil(defenderCas * Math.random()));

    //console.log("4. defender: " + defenderCas + ". attacker: " + attackerCas);

    attacker.owned -= attackerCas;
    defender.owned -= defenderCas;

    // 66g attempt to control zombie pop = population.living <= 0 &&
    if (curCiv.zombie.owned > 0) {
        // kill zombies
        if (attacker.alignment == alignmentType.player) { curCiv.zombie.owned -= attackerCas; }
        if (defender.alignment == alignmentType.player) { curCiv.zombie.owned -= defenderCas; }
    }

    // Give player credit for kills.
    let playerCredit = ((attacker.alignment == alignmentType.player) ? defenderCas : (defender.alignment == alignmentType.player) ? attackerCas : 0);
    let playerDiscredit = ((attacker.alignment == alignmentType.player) ? attackerCas : (defender.alignment == alignmentType.player) ? defenderCas : 0);

    //Increments enemies slain, corpses, and piety
    curCiv.enemySlain.owned += playerCredit;
    if (civData.throne.owned) { civData.throne.count += playerCredit; }
    civData.corpses.owned += (attackerCas + defenderCas);
    if (civData.book.owned) { civData.piety.owned += (attackerCas + defenderCas) * getPietyEarnedBonus(); }

    // increase morale for enemy kills.  This is the opposite of losing morale for citizens dying
    // see doStarve and killUnit
    if (playerCredit > 0 && population.living > 1) {
        //adjustMorale(0.0025 / playerCredit); // is this too small?
        //adjustMorale(playerCredit / population.living);
        adjustMorale(1);
    }
    if (playerDiscredit > 0 && population.living > 1) {
        //adjustMorale(-playerDiscredit / population.living);
        adjustMorale(-1);
    }
    //Updates population figures (including total population)
    calculatePopulation();
}

function doWolves(attacker) {
    // eat corpses first
    if (civData.corpses.owned > 0) {
        let gone = Math.ceil((Math.random() * attacker.owned / 100));
        civData.corpses.owned -= gone;
        attacker.owned -= gone; // wolves leave after eating
        // just in case
        if (civData.corpses.owned < 0) { civData.corpses.owned = 0; }
        gameLog("Unburied " + civData.corpses.getQtyName(gone) + " eaten by wolves");

    } else {
        doSlaughter(attacker);
    }
}
function doBandits(attacker) {
    // bandits mainly loot
    let r = Math.random();
    if (r < 0.01) { doSlaughter(attacker); }
    else if (r < 0.02) { doSack(attacker); }
    else { doLoot(attacker); }
}
function doBarbarians(attacker) {
    //barbarians mainly kill, steal and destroy
    let r = Math.random();
    if (r < 0.3) {
        if (Math.random() < 0.6) { doSlaughter(attacker); }
        else { doSlaughterMulti(attacker); }
    }
    else if (r < 0.6) { doLoot(attacker); }
    else if (r < 0.9) {
        if (Math.random() < 0.8) { doSack(attacker); }
        else if (Math.random() < 0.9) { doSackMulti(attacker); }
        else { doDesecrate(attacker); }
    }
    else { doConquer(attacker); }
}
function doInvaders(attacker) {
    let r = Math.random();
    if (r < 0.24) { doSlaughterMulti(attacker); }
    else if (r < 0.48) { doLoot(attacker); }
    else if (r < 0.72) { doSackMulti(attacker); }
    else if (r < 0.98) { doConquer(attacker); }
    else { doDesecrate(attacker); }

    if (civData.freeLand.owned === 0) {
        // this is an attempt to speed up the decline process
        let landTotals = getLandTotals();
        let altars = getAltarsOwned();
        //if (civData.graveyard.owned + altars === landTotals.buildings) {
        if (civData.graveyard.owned + altars === landTotals.used) {
            doDesecrate(attacker);
        }
    }
}

// kill
function doSlaughter(attacker) {
    let target = getRandomWorker(); //Choose random worker
    let targetUnit = civData[target];
    let targetName = "";
    if (isValid(targetUnit) && targetUnit.owned > 0) {
        if ((Math.random() * targetUnit.defence) <= (Math.random() * attacker.efficiency)) {
            let killVerb = (attacker.species == speciesType.animal) ? "eaten" : "killed";
            // An attacker may disappear after killing
            if (Math.random() < attacker.killStop) { --attacker.owned; }

            killUnit(targetUnit);
            // 66g attempt to control zombie pop // population.living <= 0 &&
            if (curCiv.zombie.owned > 0) {
                curCiv.zombie.owned -= 1;
                targetName = "Zombie";
            }
            else {
                targetName = targetUnit.getQtyName(1)
            }
            // Animals will eat the corpse
            if (attacker.species == speciesType.animal) {
                civData.corpses.owned -= 1;
            }
            gameLog(targetName + " " + killVerb + " by " + attacker.getQtyName(2)); // always use plural
        }
        else {
            --attacker.owned;
            // 66g gain morale
            if (population.living > 1) {
                //adjustMorale(1 / population.living);
                adjustMorale(1);
            }
        }
    }
    else if (curCiv.zombie.owned > 0) {
        // 66g attempt to control zombie pop // population.living <= 0 &&
        curCiv.zombie.owned -= 1;
        gameLog("Zombie killed by " + attacker.getQtyName(2)); // always use plural
    }
    if (!isValid(targetUnit) || (isValid(targetUnit) && targetUnit.owned <= 0)) {
        // Attackers slowly leave once everyone is dead
        let leaving = Math.ceil(attacker.owned * Math.random() * attacker.killFatigue);
        attacker.owned -= leaving;
    }
    calculatePopulation();

    if (attacker.owned < 0) { attacker.owned = 0; }
}
function doSlaughterMulti(attacker) {
    // kill up to %age of attacking force
    let targets = Math.min(attacker.owned, population.current);
    targets = 1 + Math.ceil(Math.random() * targets * attacker.killMax);
    let kills = 0;
    let lastTarget = "citizen";

    for (let k = 1; k <= targets; k++) {
        let target = getRandomWorker(); //Choose random worker
        if (target) {
            let targetUnit = civData[target];
            if (targetUnit.owned >= 1) {
                if ((Math.random() * targetUnit.defence) <= (Math.random() * attacker.efficiency)) {
                    // An attacker may disappear after killing
                    if (Math.random() < attacker.killStop) { --attacker.owned; }

                    killUnit(targetUnit);
                    // 66g attempt to control zombie pop // population.living <= 0 &&
                    if (curCiv.zombie.owned > 0) {
                        curCiv.zombie.owned -= 1;
                    }
                    // Animals will eat the corpse
                    if (attacker.species == speciesType.animal) {
                        civData.corpses.owned -= 1;
                    }
                    kills++;
                    lastTarget = targetUnit.singular;
                }
                else {
                    --attacker.owned;
                    // 66g gain morale
                    if (population.living > 1) {
                        //adjustMorale(1 / population.living);
                        adjustMorale(1);
                    }
                }
            }
        }
        else if (curCiv.zombie.owned > 0) {
            // 66g attempt to control zombie pop // population.living <= 0 &&
            curCiv.zombie.owned -= 1;
            kills++;
            lastTarget = "zombie";
        }
    }
    if (kills > 0) {
        let who = population.living <= 0 ? "zombies " : "citizens ";
        let killVerb = Math.random() < 0.001 ? "captured" : "slaughtered";
        let killNote = (kills == 1) ? lastTarget + " murdered by " : who + killVerb + " by ";
        gameLog(killNote + attacker.getQtyName(2)); // always use plural attacker
        calculatePopulation();
    }
    else {
        // Attackers slowly leave once everyone is dead
        let leaving = Math.ceil(attacker.owned * Math.random() * attacker.killFatigue);
        attacker.owned -= leaving;
    }
    if (attacker.owned < 0) { attacker.owned = 0; }
}
// rob
function doLoot(attacker) {
    // Select random resource, steal random amount of it.
    let targetID = getRandomLootableResource();
    let target = civData[targetID];
    if (isValid(target) && target.owned > 0) {
        let looters = Math.ceil((Math.random() * attacker.owned * attacker.lootMax)); //up to %age of attackers steal.
        let stolenQty = looters * (1 + Math.floor((Math.random() * 10))); // attackers steal up to 10 items.  TODO: global constant for items
        // target.owned can be decimal.  we can't loot more than is available
        stolenQty = Math.min(stolenQty, Math.floor(target.owned));
        if (stolenQty > 0) {
            target.owned -= stolenQty;
            // 66g lose morale
            if (population.living > 1) {
                //adjustMorale(-looters / population.living);
                adjustMorale(-1);
            }
            if (Math.random() < attacker.lootStop) { attacker.owned -= looters; } // Attackers might leave after stealing something.
            gameLog(target.getQtyName(stolenQty) + " stolen by " + attacker.getQtyName(2)); // always plural
        }
    }
    if (!isValid(target) || (isValid(target) && target.owned <= 0)) {
        //some will leave after cleaning out resource
        let leaving = Math.ceil(attacker.owned * Math.random() * attacker.lootFatigue);
        attacker.owned -= leaving;
    }

    if (attacker.owned < 0) { attacker.owned = 0; }
    updateResourceTotals();
}
// burn
function doSack(attacker) {
    //Destroy building
    let targetID = getRandomSackableBuilding();
    let target = civData[targetID];

    if (isValid(target) && target.owned > 0) {
        let destroyVerb = (Math.random() < 0.99) ? "burned" : "destroyed";
        // Slightly different phrasing for fortifications
        if (target == civData.fortification) { destroyVerb = "damaged"; }

        --target.owned;
        //++civData.freeLand.owned;
        civData.freeLand.owned += target.land;

        // 66g lose morale
        if (population.living > 1) {
            adjustMorale(-1);
        }
        if (Math.random() < attacker.sackStop) { --attacker.owned; } // Attackers might leave after sacking something.
        updateRequirements(target);
        updateResourceTotals();
        calculatePopulation(); // Limits might change
        gameLog(target.getQtyName(1) + " " + destroyVerb + " by " + attacker.getQtyName(2)); // always plural
    }
    if (!isValid(target) || (isValid(target) && target.owned <= 0)) {
        //some will leave
        let leaving = Math.ceil(attacker.owned * Math.random() * attacker.sackFatigue);
        attacker.owned -= leaving;
    }
    if (attacker.owned < 0) { attacker.owned = 0; }
}
function doSackMulti(attacker) {
    //Destroy buildings
    // sack up to % of attacking force
    let landTotals = getLandTotals();
    let targets = Math.min(attacker.owned, landTotals.buildings);
    targets = 1 + Math.ceil(Math.random() * targets * attacker.sackMax);
    let sacks = 0;
    let lastTarget = "building";
    for (let s = 1; s <= targets; s++) {
        let targetID = getRandomSackableBuilding();
        let target = civData[targetID];
        if (isValid(target) && target.owned > 0) {
            --target.owned;
            // ++civData.freeLand.owned;
            civData.freeLand.owned += target.land;
            sacks++;
            lastTarget = target.singular;

            if (Math.random() < attacker.sackStop) { --attacker.owned; } // Attackers might leave after sacking something.
            updateRequirements(target);

        }
        if (attacker.owned < 0) { attacker.owned = 0; }
        if (isValid(target)) {
            updateRequirements(target);
        }
    }
    if (sacks > 0) {
        // 66g lose morale
        if (population.living > 1) {
            //adjustMorale(-sacks / population.living);
            adjustMorale(-1);
        }
        let destroyVerb = (Math.random() < 0.01) ? " burned by " : " destroyed by ";
        let destroyNote = (sacks == 1) ? lastTarget + destroyVerb : "buildings " + destroyVerb;
        gameLog(destroyNote + attacker.getQtyName(2)); // always use plural attacker
        updateResourceTotals();
        calculatePopulation(); // Limits might change
    }
    else {
        //some will leave
        let leaving = Math.ceil(attacker.owned * Math.random() * attacker.sackFatigue);
        attacker.owned -= leaving;
    }
    if (attacker.owned < 0) { attacker.owned = 0; }
}

// occupy land
function doConquer(attacker) {
    if (civData.freeLand.owned > 0) {
        // up to % of attacking force or land - this might need adjusting
        let targets = Math.min(attacker.owned, civData.freeLand.owned);
        let land = Math.ceil(Math.random() * targets * attacker.conquerMax);
        land = Math.min(civData.freeLand.owned, land);
        if (land > 0) {
            civData.freeLand.owned -= land;
            // 66g lose morale for bad things
            if (population.living > 1) {
                adjustMorale(-1);
            }
            // 66g: barbarians 'lay waste' to land
            gameLog("land occupied by " + attacker.getQtyName(2)); // always plural
            // Attackers might leave after conquering land.
            if (Math.random() < attacker.conquerStop) { attacker.owned -= land; }
        }
    }
    if (civData.freeLand.owned <= 0) {
        //some will leave
        let leaving = Math.ceil(attacker.owned * Math.random() * attacker.conquerFatigue);
        attacker.owned -= leaving;
    }
    if (attacker.owned < 0) { attacker.owned = 0; }
}

// desecrate graves or altars
function doDesecrate(attacker) {
    let obj = "";
    let total = civData.graveyard.owned + getAltarsOwned();
    let test = Math.random() * total;
    if (test < civData.graveyard.owned) {
        obj = civData.graveyard;
    }
    else {
        // get current altar
        let id = getCurrentAltarId();
        if (isValid(id)) {
            obj = civData[id];
        }
    }
    if (isValid(obj) && obj.owned > 0) {
        // up to 1% of attacking force or owned 
        let targets = Math.min(attacker.owned, obj.owned);
        let sacked = Math.ceil(Math.random() * targets * attacker.sackMax);
        sacked = Math.min(obj.owned, sacked);
        if (sacked > 0) {
            let target = obj.getQtyName(sacked);
            obj.owned -= sacked;
            if (obj.id === buildingType.graveyard && curCiv.grave.owned > (civData.graveyard.owned * 100)) {
                curCiv.grave.owned = curCiv.grave.owned - (civData.graveyard.owned * 100);
                if (curCiv.grave.owned < 0) { curCiv.grave.owned = 0; }
            }
            else {
                updateAltars();
            }
            //civData.freeLand.owned += sacked;
            civData.freeLand.owned += sacked * obj.land;
            gameLog(target + " desecrated by " + attacker.getQtyName(2)); // always plural
            // 66g lose morale
            if (population.living > 1) {
                //adjustMorale(-sacked / population.living);
                adjustMorale(-1);
            }
            // Attackers might leave after conquering land.
            if (Math.random() < attacker.sackStop) { attacker.owned -= sacked; }
        }
        if (obj.owned < 0) {
            obj.owned = 0;
        }
    }
    if (!isValid(obj) || (isValid(obj) && obj.owned <= 0)) {
        obj.owned = 0;
        //some will leave
        let leaving = Math.ceil(attacker.owned * Math.random() * attacker.sackFatigue);
        attacker.owned -= leaving;
    }
    if (attacker.owned < 0) { attacker.owned = 0; }
}

function doShades() {
    //console.log("doShades()");
    let defender = civData.shade;
    if (defender.owned <= 0) { return; }

    // Attack each enemy in turn.
    getCombatants(defender.place, alignmentType.enemy).forEach(function (attacker) {
        let num = Math.floor(Math.min((attacker.owned / 4), defender.owned));
        //xxx Should we give book and throne credit here?
        defender.owned -= num;
        attacker.owned -= num;
    });

    // Shades fade away even if not killed.
    defender.owned = Math.max(Math.floor(defender.owned * 0.95), 0);
}

// Deals with potentially capturing enemy siege engines.
function doEsiege(siegeObj, targetObj) {
    //console.log("doEsiege() siegeObj=" + siegeObj.id + ". targetObj=" + targetObj.id);
    if (siegeObj.owned <= 0) { return; }

    //First check there are enemies there defending them
    if (!getCombatants(siegeObj.place, siegeObj.alignment).length &&
        getCombatants(targetObj.place, targetObj.alignment).length) {
        //the siege engines are undefended; maybe capture them.
        if ((targetObj.alignment == alignmentType.player) && civData.wheel.owned) { //Can we use them?
            gameLog("Captured " + prettify(siegeObj.owned) + " enemy siege engines");
            civData.siege.owned += siegeObj.owned; //capture them
        }
        siegeObj.owned = 0;
    }
    else {
        let damage = doSiege(siegeObj, targetObj);
        if (damage > 0 && targetObj.id === buildingType.fortification) {
            civData.freeLand.owned += damage;
            updateRequirements(targetObj);
            gameLog("Enemy siege engine damaged " + damage + " fortifications");
        }
    }
}

// Process siege engine attack.
// Returns the number of hits.
function doSiege(siegeObj, targetObj) {
    //console.log("doSiege()");
    let hit, hits = 0;
    // Only half can fire every round due to reloading time.
    // We also allow no more than 2 per defending fortification.
    let firing = Math.ceil(Math.min(siegeObj.owned / 2, targetObj.owned * 2));
    let defenceMod = 0;
    if (targetObj.id === buildingType.fortification) {
        defenceMod += civData.rampart.owned ? civData.rampart.efficiency : 0;
        defenceMod += civData.palisade.owned ? civData.palisade.efficiency : 0;
        defenceMod += civData.battlement.owned ? civData.battlement.efficiency : 0;
    }
    //console.log("doSiege() firing=" + firing);
    for (let i = 0; i < firing; ++i) {
        hit = Math.random();
        if (hit > 0.95) { --siegeObj.owned; } // misfire; destroys itself
        if (hit >= siegeObj.efficiency - defenceMod) { continue; } // miss // 66g this doesn't make sense - it should be seige obj compared to target obj
        ++hits; // hit
        if (--targetObj.owned <= 0) { break; }
    }
    return hits;
}

//Handling raids
//starts when player clicks button on Conquest page. see invade
function doRaid(place, attackAlignment, defendAlignment) {
    //console.log("doRaid()");
    if (!curCiv.raid.raiding) {
        // We're not raiding right now.
        ui.show("#raidBar", false);
        return;
    }

    let attackers = getCombatants(place, attackAlignment);
    let defenders = getCombatants(place, defendAlignment);

    ui.show("#raidBar", attackers.length && defenders.length);

    if (attackers.length && !defenders.length) { // Win check.
        // Slaughter any losing noncombatant units.
        //xxx Should give throne and corpses for any human ones?
        unitData.filter(function (elem) { return ((elem.alignment == defendAlignment) && (elem.place == place)); })
            .forEach(function (elem) { elem.owned = 0; });

        if (!curCiv.raid.victory) { gameLog("Raid victorious!"); } // Notify player on initial win.
        curCiv.raid.victory = true;  // Flag victory for future handling
    }

    if (!attackers.length && defenders.length) { // Loss check.
        //curCiv.raid.left = 0;
        curCiv.raid.invadeciv = null;
        // Slaughter any losing noncombatant units.
        //xxx Should give throne and corpses for any human ones?
        unitData.filter(function (elem) { return ((elem.alignment == attackAlignment) && (elem.place == place)); })
            .forEach(function (elem) { elem.owned = 0; });

        gameLog("Raid defeated!");  // Notify player
        // exact opposite of victory
        //adjustMorale(-(civSizes[curCiv.raid.last].idx + 1) / 100);
        adjustMorale(-1);
        resetRaiding();
        return;
    }

    // Do the actual combat.
    attackers.forEach(function (attacker) {
        defenders.forEach(function (defender) {
            doFight(attacker, defender);
            updateRaidBar(attacker, defender);
        });
    });

    // Handle siege engines
    doSiege(civData.siege, civData.efort);
}

function doRaidCheck(place, attackAlignment, defendAlignment) {
    if (curCiv.raid.raiding && curCiv.raid.victory) {
        //console.log("doRaidCheck raid left = " + curCiv.raid.left);
        //let attackers = getCombatants(place, attackAlignment);
        //if (curCiv.raid.left > 0) {
        //    plunder(); // plunder resources before new raid
        //    let troopsCount = attackers.reduce((acc, val) => acc + val.owned, 0);
        //    if (troopsCount > 0) { // attack
        //        curCiv.raid.left -= 1;
        //        invade(curCiv.raid.invadeciv);
        //    }
        //} else {
        curCiv.raid.invadeciv = null;
        //}
    }
}

function doMobs() {
    //console.log("doMobs()");
    //Checks when mobs will attack
    //xxx Perhaps this should go after the mobs attack, so we give 1 turn's warning?
    let mobType, choose;
    let landTotals = getLandTotals();
    let resources = getResourceTotal();
    let altars = getAltarsOwned();

    let civLimit = population.limit; //population.current
    // attacks can still happen if there are habitable buildings to destroy, resources to plunder, graves/altars to desecrate, zombies to hack
    let totalStuff = population.limit + landTotals.sackableTotal + resources + civData.freeLand.owned + civData.graveyard.owned + altars + curCiv.zombie.owned;

    if (totalStuff < 1) {
        // resources can be fractional, so we don't check for zero stuff
        // nothing to do
        curCiv.attackCounter = 0;
        if (civData[mobTypeIds.invader].owned > 0) {
            // only invaders reduce civ to nothing
            gameLog(prettify(civData[mobTypeIds.invader].owned) + " invaders go home disappointed there is nothing to kill, plunder or destroy");
            civData[mobTypeIds.invader].owned = 0;
        }
        return false;
    }
    else {
        // only attack if something available.
        ++curCiv.attackCounter;
    }

    // overcrowding will speed up attack frequency
    if (civData.freeLand.owned < 0) {
        curCiv.attackCounter += Math.abs(civData.freeLand.owned);
    }
    // no population will speed up attack frequency
    if (population.current <= 0) {
        curCiv.attackCounter += 10;
    }
    // possible attack every 5-10 minutes
    let minMinutes = (population.current > 0) ? 5 : 2; // 10 mins if any population
    let limit = (60 * minMinutes) + Math.floor(60 * minMinutes * Math.random()); //Minimum 5 minutes, max 10

    if (curCiv.attackCounter > limit) {
        // attempt at forcing attacks more frequently the larger the civ
        // because thorp is smallest civSize
        // is this the wrong way around?
        let rnum = totalStuff * Math.random();
        let rnum2 = (totalStuff * Math.random()) / civSizes.thorp.min_pop;
        //console.log("rnum=" + rnum + " rnum2=" + rnum2);

        rnum = Math.random();
        rnum2 = Math.random() * population.limit;
        //console.log("rnum=" + rnum + " rnum2=" + rnum2);

        // check if attack takes place
        if (rnum < rnum2) {
            curCiv.attackCounter = 0;

            mobType = getMobType(civLimit);

            let mobNum = Math.ceil(civLimit / 50 * Math.random());
            // don't attack with more than cuurent population
            mobNum = Math.min(mobNum, population.current);

            let oneDay = 24 * 60 * 60;
            if (population.current === 0 && curCiv.loopCounter > oneDay && civData.freeLand.owned > 100) {
                // no population, let's invade!
                mobType = mobTypeIds.invader; // they do a lot of everything
                if (civData[mobType].owned > 0) {
                    // already under attack
                    mobNum = 0;
                }
                else {
                    // we want loads of attackers, but not too many otherwise the browser breaks
                    // 66g 20230119 we don't want more than there is stuff to do
                    mobNum = Math.ceil(totalStuff * Math.random());
                }
            }
            spawnMob(civData[mobType], mobNum);
        }
    }
    ui.show("#mobBar", isUnderAttack());

    //Handling mob attacks
    // do siege engines first
    //if (civData.esiege.owned > 0) {
    doEsiege(civData.esiege, civData.fortification);
    //}
    getCombatants(placeType.home, alignmentType.enemy).forEach(function (attacker) {
        //console.log("doMobs() attacker.owned=" + attacker.owned);
        if (attacker.owned <= 0) { ui.show("#mobBar", false); return; } // In case the last one was killed in an earlier iteration.

        let defenders = getCombatants(attacker.place, alignmentType.player);

        if (!defenders.length) { ui.show("#mobBar", false); attacker.onWin(); return; } // Undefended 

        defenders.forEach(function (defender) {
            doFight(attacker, defender);
            updateMobBar(attacker, defender);
        });
    });
}

function getMobType(civLimit) {
    // we don't want wolves/bandits attacking large settlements/nations
    // or barbarians/invaders attacking small ones
    let mobType;

    if (civLimit < civSizes.thorp.min_pop) {
        // mostly wolves
        if (Math.random() < 0.99) {
            mobType = mobTypeIds.wolf;
        }
        else {
            mobType = mobTypeIds.bandit;
        }
    }
    else if (civLimit >= civSizes.thorp.min_pop && civLimit < civSizes.village.min_pop) {
        // mostly wolves
        if (Math.random() < 0.75) {
            mobType = mobTypeIds.wolf;
        }
        else {
            mobType = mobTypeIds.bandit;
        }
    }
    else if (civLimit >= civSizes.village.min_pop && civLimit < civSizes.town.min_pop) {
        // wolf or bandit
        if (Math.random() < 0.5) {
            mobType = mobTypeIds.wolf;
        }
        else {
            mobType = mobTypeIds.bandit;
        }
    }
    else if (civLimit >= civSizes.town.min_pop && civLimit < civSizes.smCity.min_pop) {
        // mostly bandits
        if (Math.random() < 0.75) {
            mobType = mobTypeIds.bandit;
        }
        else {
            mobType = mobTypeIds.barbarian;
        }
    }
    else if (civLimit >= civSizes.smCity.min_pop && civLimit < civSizes.lgCity.min_pop) {
        // bandits or barbarians
        if (Math.random() < 0.5) {
            mobType = mobTypeIds.bandit;
        }
        else {
            mobType = mobTypeIds.barbarian;
        }
    }
    else if (civLimit >= civSizes.lgCity.min_pop && civLimit < civSizes.smNation.min_pop) {
        // mostly barbarians
        if (Math.random() < 0.75) {
            mobType = mobTypeIds.barbarian;
        }
        else {
            mobType = mobTypeIds.invader;
        }
    }
    else if (civLimit >= civSizes.smNation.min_pop && civLimit < civSizes.lgNation.min_pop) {
        // barbarians or invaders
        if (Math.random() < 0.5) {
            mobType = mobTypeIds.barbarian;
        }
        else {
            mobType = mobTypeIds.invader;
        }
    }
    else if (civLimit >= civSizes.lgNation.min_pop) {
        // mainly invaders 
        if (Math.random() < 0.25) {
            mobType = mobTypeIds.barbarian;
        }
        else {
            mobType = mobTypeIds.invader;
        }
    }
    return mobType;
}

export {
    isUnderAttack, resetRaiding, getPlayerCombatMods, spawnMob, invade, onInvade, plunder, getCombatants, getCasualtyMod,
    doFight, doWolves, doBandits, doBarbarians, doInvaders, doShades, doEsiege, doSiege, doRaid, doRaidCheck, doMobs
};