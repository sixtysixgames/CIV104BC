﻿
import { Achievement, curCiv, civData, civSizes, deityDomains, getCurDeityDomain, population, neighbours  } from "../index.js";

function getAchievementData() {
    let data = [
        // Achievements
        //conquest
        new Achievement({
            id: "raiderAch", name: "Raider",
            test: function () { return curCiv.raid.victory; },
            effectText: "Succesfully conquer an enemy"
        }),
        //xxx Technically this also gives credit for capturing a siege engine.
        new Achievement({
            id: "engineerAch", name: "Engi&shy;neer",
            test: function () { return civData.siege.owned > 0; },
            effectText: "Buy or capture a siege engine"
        }),
        // If we beat the largest possible opponent, grant bonus achievement.
        new Achievement({
            id: "dominationAch", name: "Domin&shy;ation",
            test: function () { return curCiv.raid.victory && (curCiv.raid.last == civSizes[civSizes.length - 1].id); },
            effectText: "Successfully conquer an empire"
        }),
        // If we beat all neighbours.
        new Achievement({
            id: "conquerorAch", name: "World Con&shy;queror",
            test: function () {
                let conqd = neighbours.filter(n => n.size === "conquered");
                return conqd.length === neighbours.length;
                //return curCiv.raid.victory && (curCiv.raid.last == civSizes[civSizes.length - 1].id) && !neighbours.some(n => n.size === "empire");
            },
            effectText: "Successfully conquer all neighbouring empires"
        }),
        //new Achievement({
        //    id: "lnconquerorAch", name: "Large Nation Conqueror",
        //    test: function () {
        //        //const result = arrayToCount.filter(i => i === 2).length;
        //        let conqd = neighbours.filter(n => n.size === "largeNation");
        //        return conqd.length === neighbours.length;
        //        //console.log("curCiv.raid.victory=" + curCiv.raid.victory);
        //        //console.log("(curCiv.raid.last == largeNation)=" + curCiv.raid.last );
        //        //console.log("!neighbours.some(n => n.size === largeNation=" + !neighbours.some(n => n.size === "largeNation"));
        //        //return curCiv.raid.victory && (curCiv.raid.last == "largeNation") && !neighbours.some(n => n.size === "largeNation");
        //    },
        //    effectText: "Successfully conquer all neighbouring large nations"
        //}),
        //new Achievement({
        //    id: "nconquerorAch", name: "Nation Conqueror",
        //    test: function () {
        //        let conqd = neighbours.filter(n => n.size === "nation");
        //        return conqd.length === neighbours.length;
        //        //return curCiv.raid.victory && (curCiv.raid.last == "nation") && !neighbours.some(n => n.size === "nation");
        //    },
        //    effectText: "Successfully conquer all neighbouring nations"
        //}),
        //new Achievement({
        //    id: "snconquerorAch", name: "Small Nation Conqueror",
        //    test: function () {
        //        let conqd = neighbours.filter(n => n.size === "smallnation");
        //        return conqd.length === neighbours.length;
        //        //return curCiv.raid.victory && (curCiv.raid.last == "smallnation") && !neighbours.some(n => n.size === "smallnation");
        //    },
        //    effectText: "Successfully conquer all neighbouring small nations"
        //}),
        //Morale
        new Achievement({
            id: "hatedAch", name: "Hated",
            test: function () { return curCiv.morale.efficiency <= 0.5; },
            effectText: "Make your population angry"
        }),
        new Achievement({
            id: "lovedAch", name: "Loved",
            test: function () { return curCiv.morale.efficiency >= 1.5; },
            effectText: "Make your population blissful"
        }),
        //cats
        new Achievement({
            id: "catAch", name: "Cat!",
            test: function () { return civData.cat.owned >= 1; },
            effectText: "Own a cat"
        }),
        new Achievement({
            id: "glaringAch", name: "Glaring",
            test: function () { return civData.cat.owned >= 10; },
            effectText: "Own ten cats"
        }),
        new Achievement({
            id: "clowderAch", name: "Clowder",
            test: function () { return civData.cat.owned >= 100; },
            effectText: "Own one hundred cats"
        }),
        //other population
        //Plagued achievement requires sick people to outnumber healthy
        new Achievement({
            id: "plaguedAch", name: "Plagued",
            test: function () { return population.totalSick > population.healthy; },
            effectText: "Your sick civilians outnumber the healthy"
        }),
        new Achievement({
            id: "ghostTownAch", name: "Ghost Town",
            test: function () { return (population.living === 0 && population.limit >= 1000); },
            effectText: "Your population of at least 1,000 all died"
        }),
        //deities
        //xxx TODO: Should make this loop through the domains
        new Achievement({
            id: "battleAch", name: "Battle",
            test: function () { return getCurDeityDomain() == deityDomains.battle; },
            effectText: "Worship a deity of Battle"
        }),
        new Achievement({
            id: "fieldsAch", name: "Fields",
            test: function () { return getCurDeityDomain() == deityDomains.fields; },
            effectText: "Worship a deity of the Fields"
        }),
        new Achievement({
            id: "underworldAch", name: "Under&shy;world",
            test: function () { return getCurDeityDomain() == deityDomains.underworld; },
            effectText: "Worship a deity of the Underworld"
        }),
        new Achievement({
            id: "catsAch", name: "Cats",
            test: function () { return getCurDeityDomain() == deityDomains.cats; },
            effectText: "Worship a deity of Cats"
        }),
        //xxx It might be better if this checked for all domains in the Pantheon at once (no iconoclasming old ones away).
        new Achievement({
            id: "fullHouseAch", name: "Full House",
            test: function () { return civData.battleAch.owned && civData.fieldsAch.owned && civData.underworldAch.owned && civData.catsAch.owned; },
            effectText: "Worship all deities"
        }),
        //wonders
        new Achievement({
            id: "wonderAch", name: "Wonder",
            test: function () { return curCiv.curWonder.stage === 3; },
            effectText: "Build a Wonder"
        }),
        new Achievement({
            id: "sevenAch", name: "Seven!",
            test: function () { return curCiv.wonders.length >= 7; },
            effectText: "Build seven Wonders"
        }),
        //trading
        new Achievement({
            id: "merchantAch", name: "Merch&shy;ant",
            test: function () { return civData.coins.owned > 0; },
            effectText: "Sell to a trader"
        }),
        new Achievement({
            id: "rushedAch", name: "Rushed",
            test: function () { return curCiv.curWonder.rushed; },
            effectText: "Spend coins to speed the building of a Wonder"
        }),
        //other
        new Achievement({
            id: "neverclickAch", name: "Never&shy;click",
            test: function () {return curCiv.curWonder.stage === 3 && curCiv.resourceClicks <= 22;},
            effectText: "Build a Wonder with only 22 resource clicks"
        })
    ];

    return data;
}

export { getAchievementData };