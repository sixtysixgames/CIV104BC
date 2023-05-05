"use strict";
import {
    civData, curCiv, population, buildingType, unitType, resourceType,
    calculatePopulation, getNextPatient, getPietyEarnedBonus, getRandomPatient, getTotalByJob, getWonderBonus, healByJob, spreadPlague,
    updatePopulation, adjustMorale,
    gameLog, isValid, killUnit, rndRound
} from "../index.js";

// TODO: Need to improve 'net' handling.

function doFarmers() {
    //Farmers farm food
    let millMod = 1;
    if (population.current > 0) {
        millMod = population.living / population.current;
    }
    civData.food.net = (
        civData.farmer.owned
        * (1 + (civData.farmer.efficiency * curCiv.morale.efficiency))
        * ((civData.pestControl.timer > 0) ? 1.01 : 1)
        * getWonderBonus(civData.food)
        * (1 + civData.walk.rate / 120)
        * (1 + civData.mill.owned * millMod / 200)
    );
    civData.food.net -= population.living; //The living population eats food.
    let foodEarned = Math.min(civData.food.net, civData.food.limit - civData.food.owned); // can't make more than we can store
    civData.food.net = foodEarned;
    civData.food.owned += foodEarned;

    if (civData.skinning.owned && civData.farmer.owned > 0 && civData.skins.owned < civData.skins.limit) { //and sometimes get skins
        //let specialChance = civData.food.specialChance + (0.1 * civData.flensing.owned);
        //let skinsChance = specialChance * (civData.food.increment + ((civData.butchering.owned) * civData.farmer.owned / 20.0)) * getWonderBonus(civData.skins);
        let specialChance = civData.food.specialChance + (0.1 * skinMods());
        let skinsChance = specialChance * (civData.food.increment + (civData.farmer.owned / 20.0)) * getWonderBonus(civData.skins);
        let skinsEarned = rndRound(skinsChance);
        skinsEarned = Math.min(skinsEarned, civData.skins.limit - civData.skins.owned); // can't make more than we can store
        civData.skins.net += skinsEarned;
        civData.skins.owned += skinsEarned;
    }
}
function farmerMods(efficiency_base) {
    return efficiency_base + (0.1 * (
        + civData.farming.owned + civData.agriculture.owned + civData.wheel.owned
        + civData.ploughshares.owned + civData.irrigation.owned
        + civData.croprotation.owned + civData.selectivebreeding.owned + civData.fertilisers.owned
        + civData.blessing.owned));
}
function skinMods() {
    return civData.flensing.owned + civData.butchering.owned + civData.selectivebreeding.owned;
}

//function doFarmers() {
//    //Farmers farm food
//    let millMod = 1;
//    if (population.current > 0) {
//        millMod = population.living / population.current;
//    }
//    civData.food.net = (
//        civData.farmer.owned
//        * (1 + (civData.farmer.efficiency * curCiv.morale.efficiency))
//        * ((civData.pestControl.timer > 0) ? 1.01 : 1)
//        * getWonderBonus(civData.food)
//        * (1 + civData.walk.rate / 120)
//        * (1 + civData.mill.owned * millMod / 200) 
//    );
//    civData.food.net -= population.living; //The living population eats food.
//    let foodEarned = Math.min(civData.food.net, civData.food.limit - civData.food.owned); // can't make more than we can store
//    //civData.food.owned += civData.food.net;
//    civData.food.net = foodEarned;
//    if (civData.food.owned + foodEarned < civData.food.limit) {
//        civData.food.owned += foodEarned;
//    }

//    if (civData.skinning.owned && civData.farmer.owned > 0 && civData.skins.owned < civData.skins.limit) { //and sometimes get skins
//        let specialChance = civData.food.specialChance + (0.1 * civData.flensing.owned);
//        let skinsChance = specialChance * (civData.food.increment + ((civData.butchering.owned) * civData.farmer.owned / 15.0)) * getWonderBonus(civData.skins);
//        let skinsEarned = rndRound(skinsChance);
//        skinsEarned = Math.min(skinsEarned, civData.skins.limit - civData.skins.owned); // can't make more than we can store
//        civData.skins.net += skinsEarned;
//        civData.skins.owned += skinsEarned;
//    }
//}

function doWoodcutters() {
    //Woodcutters cut wood
    if (civData.wood.owned < civData.wood.limit) {
        //let efficiency = civData.woodcutter.efficiency + (0.1 * civData.woodcutter.efficiency * (civData.carpentry.owned + civData.coppicing.owned));
        let efficiency = civData.woodcutter.efficiency + (0.1 * civData.woodcutter.efficiency * woodcutterMods());
        civData.wood.net = civData.woodcutter.owned * (efficiency * curCiv.morale.efficiency) * getWonderBonus(civData.wood);
        let woodEarned = Math.min(civData.wood.net, civData.wood.limit - civData.wood.owned); // can't make more than we can store
        civData.wood.net = woodEarned;
        civData.wood.owned += woodEarned;
    }
    if (civData.harvesting.owned && civData.woodcutter.owned > 0 && civData.herbs.owned < civData.herbs.limit) { //and sometimes get herbs
        //let specialChance = civData.wood.specialChance + (0.1 * civData.reaping.owned);
        //let herbsChance = specialChance * (civData.wood.increment + ((civData.gardening.owned) * civData.woodcutter.owned / 5.0)) * getWonderBonus(civData.herbs);
        let specialChance = civData.wood.specialChance + (0.1 * herbMods());
        let herbsChance = specialChance * (civData.wood.increment + (civData.woodcutter.owned / 5.0)) * getWonderBonus(civData.herbs);
        let herbsEarned = rndRound(herbsChance);
        herbsEarned = Math.min(herbsEarned, civData.herbs.limit - civData.herbs.owned); // can't make more than we can store
        civData.herbs.net += herbsEarned;
        civData.herbs.owned += herbsEarned;
    }
}

function woodcutterMods() {
    return (civData.astronomy.owned + civData.wheel.owned + civData.carpentry.owned + civData.coppicing.owned);
}
function herbMods() {
    return (civData.reaping.owned + civData.gardening.owned + civData.croprotation.owned);
}

function doMiners() {
    //Miners mine stone
    if (civData.stone.owned < civData.stone.limit) {
        //let efficiency = civData.miner.efficiency + (0.1 * civData.miner.efficiency * civData.mining.owned);
        let efficiency = civData.miner.efficiency + (0.1 * civData.miner.efficiency * minerMods());
        civData.stone.net = civData.miner.owned * (efficiency * curCiv.morale.efficiency) * getWonderBonus(civData.stone);
        let stoneEarned = Math.min(civData.stone.net, civData.stone.limit - civData.stone.owned); // can't make more than we can store
        civData.stone.net = stoneEarned;
        civData.stone.owned += stoneEarned;
    }
    if (civData.prospecting.owned && civData.miner.owned > 0 && civData.ore.owned < civData.ore.limit) { //and sometimes get ore
        //let specialChance = civData.stone.specialChance + (civData.macerating.owned ? 0.1 : 0) + getMetalOreChance();
        //let oreChance = specialChance * (civData.stone.increment + ((civData.extraction.owned) * civData.miner.owned / 5.0)) * getWonderBonus(civData.ore);
        let specialChance = civData.stone.specialChance + (0.1 * oreMods()) + getMetalOreChance();
        let oreChance = specialChance * (civData.stone.increment + (civData.miner.owned / 5.0)) * getWonderBonus(civData.ore);
        let oreEarned = rndRound(oreChance);
        oreEarned = Math.min(oreEarned, civData.ore.limit - civData.ore.owned); // can't make more than we can store
        civData.ore.net += oreEarned;
        civData.ore.owned += oreEarned;
    }
}

function minerMods() {
    return (civData.mathematics.owned + civData.wheel.owned + civData.mining.owned);
}
function oreMods() {
    return civData.macerating.owned + civData.extraction.owned;
}
function getMetalOreChance() {
    // total cannot be 1 or greater
    let chance = 0.0001 * (civData.ironOre.owned + civData.coppOre.owned + civData.leadOre.owned + civData.tinOre.owned + civData.silvOre.owned
        + civData.mercOre.owned  + civData.goldOre.owned);
    // high grade upgrades
    chance += 0.001 * (civData.ironOre2.owned + civData.coppOre2.owned + civData.leadOre2.owned + civData.tinOre2.owned + civData.silvOre2.owned
        + civData.mercOre2.owned + civData.goldOre2.owned);
    return chance;
}
function doBlacksmiths() {
    if (civData.blacksmith.owned <= 0) { return; }
    // we don't want to use up ore if we aren't making metal
    if (civData.metal.owned < civData.metal.limit) {
        let efficiency = civData.blacksmith.efficiency + (0.1 * civData.blacksmith.efficiency * civData.mathematics.owned);
        let oreUsed = Math.min(civData.ore.owned, (civData.blacksmith.owned * efficiency * curCiv.morale.efficiency) * civData.metal.require.ore);
        if (oreUsed == 0) { return; }
        oreUsed = Math.min(oreUsed, (civData.metal.limit - civData.metal.owned) * civData.metal.require.ore); // can't use more than we can store
        civData.ore.net -= oreUsed;
        civData.ore.owned -= oreUsed;

        let metalEarned = oreUsed / civData.metal.require.ore * getWonderBonus(civData.metal);
        metalEarned = Math.min(metalEarned, civData.metal.limit - civData.metal.owned); // can't make more than we can store
        civData.metal.net += metalEarned;
        civData.metal.owned += metalEarned;
    }
}

function doTanners() {
    if (civData.tanner.owned <= 0) { return; }
    // we don't want to use up skins if we aren't making leather
    if (civData.leather.owned < civData.leather.limit) {
        let efficiency = civData.tanner.efficiency + (0.1 * civData.tanner.efficiency * civData.astronomy.owned);
        let skinsUsed = Math.min(civData.skins.owned, (civData.tanner.owned * efficiency * curCiv.morale.efficiency) * civData.leather.require.skins);
        if (skinsUsed == 0) { return; }
        skinsUsed = Math.min(skinsUsed, (civData.leather.limit - civData.leather.owned) * civData.leather.require.skins); // can't use more than we can store
        civData.skins.net -= skinsUsed;
        civData.skins.owned -= skinsUsed;

        let leatherEarned = skinsUsed / civData.leather.require.skins * getWonderBonus(civData.leather);
        leatherEarned = Math.min(leatherEarned, civData.leather.limit - civData.leather.owned); // can't make more than we can store
        civData.leather.net += leatherEarned;
        civData.leather.owned += leatherEarned;
    }
}

function doApothecaries() {
    if (civData.healer.owned <= 0) { return; }
    // we don't want to use up herbs if we aren't making potions
    if (civData.potions.owned < civData.potions.limit) {
        let efficiency = civData.healer.efficiency + (0.1 * civData.healer.efficiency * civData.medicine.owned);
        let herbsUsed = Math.min(civData.herbs.owned, (civData.healer.owned * efficiency * curCiv.morale.efficiency) * civData.potions.require.herbs);
        if (herbsUsed == 0) { return; }
        herbsUsed = Math.min(herbsUsed, (civData.potions.limit - civData.potions.owned) * civData.potions.require.herbs ); // can't use more than we can store
        civData.herbs.net -= herbsUsed;
        civData.herbs.owned -= herbsUsed;

        let potionsEarned = herbsUsed / civData.potions.require.herbs * getWonderBonus(civData.potions);
        potionsEarned = Math.min(potionsEarned, civData.potions.limit - civData.potions.owned); // can't make more than we can store
        civData.potions.net += potionsEarned;
        civData.potions.owned += potionsEarned;
    }
}

function doClerics() {
    let bonus = getPietyEarnedBonus();
    let pietyEarned = civData.cleric.owned * bonus;
    pietyEarned = Math.min(pietyEarned, civData.piety.limit - civData.piety.owned); // can't make more than we can store

    // lose piety for having temples but no clerics or population
    if (civData.cleric.owned === 0 && civData.temple.owned > 0 && civData.piety.owned > 0) { pietyEarned = -bonus; }

    civData.piety.net += pietyEarned;
    civData.piety.owned += pietyEarned;

    ui.find("#iconoclasm").disabled = (civData.piety.owned < 1000);
}

function doHealers() {
    if (civData.healer.owned <= 0 || civData.potions.owned <= 0 || population.totalSick <= 0) { return 0; } // we can't heal without potions

    let job, numHealed = 0;
    let numHealers = civData.healer.owned + (civData.cat.owned * civData.companion.owned);
    // How much healing can we do?
    civData.healer.cureCount += (numHealers * civData.healer.efficiency * curCiv.morale.efficiency);

    let cureCount = (numHealers * civData.healer.efficiency * curCiv.morale.efficiency);
    // We can't cure more sick people than there are
    civData.healer.cureCount = Math.min(civData.healer.cureCount, population.totalSick);
    // We can't cure more sick people than there are potions
    civData.healer.cureCount = Math.min(civData.healer.cureCount, civData.potions.owned);

    // Cure people until we run out of healing capacity or potions
    while (civData.healer.cureCount >= 1 && civData.potions.owned >= 1) {
        job = getNextPatient();
        if (!job) { break; }
        healByJob(job);
        --civData.healer.cureCount;
        --civData.potions.owned;
        --civData.potions.net;
        ++numHealed;
    }
    return numHealed;
}

function doCharcoalBurners() {
    let jobId = unitType.charBurner;
    let resourceId = resourceType.charcoal;
    let upgradeId = "coppicing";
    if (civData[jobId].owned <= 0) { return; }
    // we don't want to use up required resouce if we aren't producing
    if (civData[resourceId].owned < civData[resourceId].limit) {
        let efficiency = civData[jobId].efficiency + (0.1 * civData[jobId].efficiency * civData[upgradeId].owned);
        efficiency = efficiency * curCiv.morale.efficiency;
        let woodUsed = Math.min(civData.wood.owned, civData[jobId].owned * efficiency * civData[resourceId].require.wood);
        if (woodUsed == 0) { return; }
        woodUsed = Math.min(woodUsed, (civData[resourceId].limit - civData[resourceId].owned) * civData[resourceId].require.wood ); // don't use more than we can store
        civData.wood.net -= woodUsed;
        civData.wood.owned -= woodUsed;

        // we produce 1 per resources used
        woodUsed = woodUsed / civData[resourceId].require.wood;
        let earned = woodUsed * getWonderBonus(civData[resourceId]);

        earned = Math.min(earned, civData[resourceId].limit - civData[resourceId].owned); // can't make more than we can store
        civData[resourceId].net += earned;
        civData[resourceId].owned += earned;
    }
}

function doLimeBurners() {
    let jobId = unitType.limeBurner;
    let resourceId = resourceType.lime;
    let upgradeId = "limestone";
    if (civData[jobId].owned <= 0) { return; }
    // we don't want to use up required resouce if we aren't producing
    if (civData[resourceId].owned < civData[resourceId].limit) {
        let efficiency = civData[jobId].efficiency + (0.1 * civData[jobId].efficiency * civData[upgradeId].owned);
        efficiency = efficiency * curCiv.morale.efficiency;
        let woodUsed = Math.min(civData.wood.owned, civData[jobId].owned * efficiency * civData[resourceId].require.wood);
        let stoneUsed = Math.min(civData.stone.owned, civData[jobId].owned * efficiency * civData[resourceId].require.stone);

        if (woodUsed == 0 || stoneUsed == 0) { return; }

        woodUsed = Math.min(woodUsed, (civData[resourceId].limit - civData[resourceId].owned) * civData[resourceId].require.wood ); // don't use more than we can store
        civData.wood.net -= woodUsed;
        civData.wood.owned -= woodUsed;
        woodUsed = woodUsed / civData[resourceId].require.wood;

        stoneUsed = Math.min(stoneUsed, (civData[resourceId].limit - civData[resourceId].owned) * civData[resourceId].require.stone ); // don't use more than we can store
        civData.stone.net -= stoneUsed;
        civData.stone.owned -= stoneUsed;
        stoneUsed = stoneUsed / civData[resourceId].require.stone;

        let earned = ((woodUsed + stoneUsed) / 2) * getWonderBonus(civData[resourceId]);

        earned = Math.min(earned, civData[resourceId].limit - civData[resourceId].owned); // can't make more than we can store
        civData[resourceId].net += earned;
        civData[resourceId].owned += earned;
    }
}

function doMetalsmiths(jobId, resourceId, upgrade1Id, upgrade2Id) {
    
    if (civData[jobId].owned <= 0) { return; }
    // we don't want to use up resources if we aren't producing
    if (civData[resourceId].owned < civData[resourceId].limit) {
        let efficiency = civData[jobId].efficiency + (0.1 * civData[jobId].efficiency * (civData[upgrade1Id].owned + civData[upgrade2Id].owned));
        efficiency = efficiency * curCiv.morale.efficiency;
        let oreUsed = Math.min(civData.ore.owned, civData[jobId].owned * efficiency * civData[resourceId].require.ore);
        let charUsed = Math.min(civData.charcoal.owned, civData[jobId].owned * efficiency * civData[resourceId].require.charcoal);

        if (oreUsed == 0 || charUsed == 0) { return; }

        oreUsed = Math.min(oreUsed, (civData[resourceId].limit - civData[resourceId].owned) * civData[resourceId].require.ore ); // don't use more than we can store
        civData.ore.net -= oreUsed;
        civData.ore.owned -= oreUsed;

        charUsed = Math.min(charUsed, (civData[resourceId].limit - civData[resourceId].owned) * civData[resourceId].require.charcoal); // don't use more than we can store
        civData.charcoal.net -= charUsed;
        civData.charcoal.owned -= charUsed;

        oreUsed = oreUsed / civData[resourceId].require.ore;
        charUsed = charUsed / civData[resourceId].require.charcoal;

        // we produce 1 per resources used
        let earned = ((oreUsed + charUsed) / 2) * getWonderBonus(civData[resourceId]);
        earned = Math.min(earned, civData[resourceId].limit - civData[resourceId].owned); // can't make more than we can store
        civData[resourceId].net += earned;
        civData[resourceId].owned += earned;
    }
}
function doIronsmiths() {
    doMetalsmiths(unitType.ironsmith, resourceType.iron, "ironOre", "ironOre2");
}
function doCoppersmiths() {
    doMetalsmiths(unitType.coppsmith, resourceType.copper, "coppOre", "coppOre2");
}
function doLeadsmiths() {
    doMetalsmiths(unitType.leadsmith, resourceType.lead, "leadOre", "leadOre2");
}
function doTinsmiths() {
    doMetalsmiths(unitType.tinsmith, resourceType.tin, "tinOre", "tinOre2");
}
function doSilversmiths() {
    doMetalsmiths(unitType.silvsmith, resourceType.silver, "silvOre", "silvOre2");
}
function doMercurysmiths() {
    doMetalsmiths(unitType.mercsmith, resourceType.mercury, "mercOre", "mercOre2");
}
function doGoldsmiths() {
    doResourceWithTwoReqs(unitType.goldsmith, resourceType.gold, resourceType.ore, resourceType.mercury, "goldOre", "goldOre2");
}
function doResourceWithTwoReqs(jobId, resourceId, require1Id, require2Id, upgrade1Id, upgrade2Id) {
    
    if (civData[jobId].owned <= 0) { return; }
    // we don't want to use up resources if we aren't producing
    if (civData[resourceId].owned < civData[resourceId].limit) {
        let efficiency = civData[jobId].efficiency + (0.1 * civData[jobId].efficiency * (civData[upgrade1Id].owned + civData[upgrade2Id].owned));
        efficiency = efficiency * curCiv.morale.efficiency;
        let req1Used = Math.min(civData[require1Id].owned, civData[jobId].owned * efficiency * civData[resourceId].require[require1Id]);
        let req2Used = Math.min(civData[require2Id].owned, civData[jobId].owned * efficiency * civData[resourceId].require[require2Id]);

        if (req1Used == 0 || req2Used == 0) { return; }

        req1Used = Math.min(req1Used, (civData[resourceId].limit - civData[resourceId].owned) * civData[resourceId].require[require1Id] ); // don't use more than we can store
        civData[require1Id].net -= req1Used;
        civData[require1Id].owned -= req1Used;

        req2Used = Math.min(req2Used, (civData[resourceId].limit - civData[resourceId].owned) * civData[resourceId].require[require2Id]); // don't use more than we can store
        civData[require2Id].net -= req2Used;
        civData[require2Id].owned -= req2Used;

        req1Used = req1Used / civData[resourceId].require[require1Id];
        req2Used = req2Used / civData[resourceId].require[require2Id];

        // we produce 1 per resources used
        let earned = ((req1Used + req2Used) / 2) * getWonderBonus(civData[resourceId]);
        earned = Math.min(earned, civData[resourceId].limit - civData[resourceId].owned); // can't make more than we can store
        civData[resourceId].net += earned;
        civData[resourceId].owned += earned;
    }
}
//https://www.bbc.co.uk/bitesize/guides/z7r7hyc/revision/3
/*
 * An estimated 30% to 60% of the population of Europe died from the plague. This is often referred to as the 'mortality rate'.
 * victims of bubonic plague itself had a 50% chance of death.
 * */
function doPlague() {
    if (population.totalSick <= 0) { return false; }

    // there are 4 possibilities: die, survive, spread, nothing 
    let chance = 0.01;

    if (Math.random() < chance) {
        let victims = Math.ceil(population.totalSick / 2 * Math.random());

        if (victims <= 0) { return false; }
        let died = 0;
        let lastVictim = "citizen";
        for (let d = 1; d <= victims; d++) {
            let jobInfected = getRandomPatient();

            if (isValid(jobInfected)) {
                let unitInfected = civData[jobInfected];
                if (isValid(unitInfected) && unitInfected.ill > 0 && unitInfected.owned > 0) {
                    killUnit(unitInfected);
                    lastVictim = unitInfected.singular;
                    died++;
                }
            }
        }

        if (died == 1) {
            gameLog("A sick " + lastVictim + " died of the plague");
        }
        else if (died > 1) {
            gameLog(died + " plague victims died");
        }
        calculatePopulation();
        return true;
    }
    else if (Math.random() < chance) {
        // some sick victims recover naturally
        let survivors = Math.ceil(population.totalSick / 2 * Math.random());
        if (survivors <= 0) { return false; }
        let survived = 0;
        let lastJob = "citizen";
        for (let s = 1; s <= survivors; s++) {
            let job = getRandomPatient();

            if (isValid(job) && isValid(civData[job])) {
                healByJob(job);
                lastJob = civData[job].singular;
                survived++;
            }
        }
        if (survived == 1) {
            gameLog("A sick " + lastJob + " recovered");
        }
        else if (survived > 1) {
            gameLog(survived + " sick citizens recovered");
        }
        if (population.living > 1 && survived > 0) {
            //adjustMorale((survived / 100) / population.living);
            adjustMorale(1);
        }
        calculatePopulation();
        return true;
    } else if (Math.random() < chance && canSpreadPlague()) {
        // plague spreads
        // needs to be same odds as catching plague in doCorpses civData.corpses.owned
        let infected = Math.floor(population.healthy / 100 * Math.random());
        if (infected <= 0) { return false; }
        let num = spreadPlague(infected);
        if (num == 1) {
            gameLog("The plague spreads to another citizen");
        }
        else {
            gameLog("The plague infects another " + num + " citizens");
        }
        if (population.living > 1 && num > 0) {
            //adjustMorale((-num / 100) / population.living);
            adjustMorale(-1);
        }
        return true;
    }
    return false;
}

function doGraveyards() {
    if (civData.corpses.owned > 0 && curCiv.grave.owned > 0 && civData.piety.owned > 0) {
        //Clerics will bury corpses if there are graves to fill and corpses lying around
        for (let i = 0; i < civData.cleric.owned; i++) {
            if (civData.corpses.owned > 0 && curCiv.grave.owned > 0 && civData.piety.owned > 0) {
                civData.corpses.owned -= 1;
                curCiv.grave.owned -= 1;
            }
            else {
                // if criteria not met, no point continuing
                break;
            }
        }
        updatePopulation();
    }
}

//https://www.bbc.co.uk/bitesize/guides/z7r7hyc/revision/3
/*
 * An estimated 30% to 60% of the population of Europe died from the plague. This is often referred to as the 'mortality rate'.
 * victims of bubonic plague itself had a 50% chance of death.
 * other research show 50% chance of dying/surviving/catching plague
 * */
function doCorpses() {
    // Nothing happens if there are no corpses
    if (civData.corpses.owned <= 0) { return; }

    // if we have enough clerics to bury the dead, then do nothing
    // why 7?  Because after about 7 days corpses start decaying
    if (civData.corpses.owned <= civData.cleric.owned * 7 && curCiv.grave.owned > 0) { return; }

    // Corpses lying around will occasionally make people sick.
    // Infect up to 1% of the healthy population.
    // if there are sick already, then see doPlague()
    if (canSpreadPlague() && population.healthy > 0 && population.totalSick == 0) {
        let infected = Math.floor(population.healthy / 100 * Math.random());
        if (infected <= 0) { return; }

        infected = spreadPlague(infected);
        if (infected > 0) {
            calculatePopulation();
            //notify player
            if (infected == 1) {
                gameLog("A citizen caught the plague");
            } else {
                gameLog(infected + " citizens caught the plague");
            }
            if (population.living > 1 && infected > 0) {
                //adjustMorale((-infected / 100) / population.living);
                adjustMorale(-1);
            }
        }
    }

    // Corpses have a slight chance of decaying (at least there is a bright side)
    if (Math.random() < 1 / 100) {
        let gone = 1 + Math.floor((Math.random() * civData.corpses.owned / 100));
        civData.corpses.owned -= gone;
        let what = ((gone > 1) ? gone + " unburied corpses" : "An unburied corpse");
        let verb = ((gone > 1) ? " were" : " was");
        let action = " rotted away";
        if (Math.random() < 0.33) {
            action = verb + " eaten by vermin";
        } else if (Math.random() < 0.66) {
            action = verb + " devoured by scavengers";
        }
        gameLog(what + action);
    }
    if (civData.corpses.owned < 0) {
        civData.corpses.owned = 0;
    }
    else {
        // it's not good for morale to have unburied corpses around
        if (population.living > 1 && civData.corpses.owned > (population.living / 7)) {
            //adjustMorale((-civData.corpses.owned / 100) / population.living);
            gameLog("Citizens are unhappy with unburied corpses");
            adjustMorale(-1);
        }
    }
}

function canSpreadPlague() {
    // more corpses should mean more chance of disease
    let sickChance = (civData.corpses.owned / (1 + civData.feast.owned)) * Math.random();
    // increase percentage to reduce frequency
    let test = (population.healthy * (1 + civData.feast.owned)) * Math.random();

    return sickChance > test;
}
// sometime, for example, we have more tanners than we have tannerys
// usually because of buildings being sacked i.e. destroyed
// this is called in the main game loop
// 66g TODO: this could be improved.  maybe add id of worker to building type and loop
function dismissWorkers() {
    // we only lose a worker if an occupied building is destroyed
    dismissWorker(unitType.tanner, buildingType.tannery, 1);
    dismissWorker(unitType.blacksmith, buildingType.smithy, 1);
    dismissWorker(unitType.healer, buildingType.apothecary, 1);
    dismissWorker(unitType.cleric, buildingType.temple, 1);
    dismissWorker(unitType.limeBurner, buildingType.limeKiln, 1);
    dismissWorker(unitType.charBurner, buildingType.charKiln, 1);
    dismissWorker(unitType.ironsmith, buildingType.ironWorks, 1);
    dismissWorker(unitType.coppsmith, buildingType.coppWorks, 1);
    dismissWorker(unitType.leadsmith, buildingType.leadWorks, 1);
    dismissWorker(unitType.tinsmith, buildingType.tinWorks, 1);
    dismissWorker(unitType.silvsmith, buildingType.silvWorks, 1);
    dismissWorker(unitType.mercsmith, buildingType.mercWorks, 1);
    dismissWorker(unitType.goldsmith, buildingType.goldWorks, 1);

    // these buildings have 10 units
    dismissWorker(unitType.soldier, buildingType.barracks, 10);
    // cavalry 
    dismissWorker(unitType.cavalry, buildingType.stable, 10);
}

function dismissWorker(unitTypeId, buildingTypeId, limit) {
    let diff = 0;
    let total = 0;

    total = getTotalByJob(unitTypeId);
    if (total > 0 && total > civData[buildingTypeId].owned * limit) {
        diff = total - (civData[buildingTypeId].owned * limit);
        civData[unitTypeId].owned -= diff;
        civData.unemployed.owned += diff;
    }
}


export {
    doFarmers, doWoodcutters, doMiners, doBlacksmiths, doTanners, doApothecaries, doClerics, doHealers, doPlague, doGraveyards, doCorpses, canSpreadPlague,
    dismissWorkers, farmerMods, woodcutterMods, minerMods, doLimeBurners, doCharcoalBurners, doIronsmiths, doCoppersmiths, doLeadsmiths, doTinsmiths, doSilversmiths,
    doMercurysmiths, doGoldsmiths
};
