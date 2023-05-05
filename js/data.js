
import {
    civData, civSizes, resourceData, buildingData, upgradeData, unitData, setIndexArrays, indexArrayByAttr, getReqText, getPrereqText,
    sentenceCase
} from "./index.js";

const data = {};

//========== SETUP (Functions meant to be run once on the DOM)

data.display = function () {
    let row, cell;
    let dataTable = document.getElementById("upgradeDataTable");

    console.log("upgradeData");
    // name, prereqs, require, effectText
    upgradeData.forEach(function (elem, i, arr) {
        row = dataTable.insertRow(-1);

        cell = row.insertCell(-1);
        cell.innerHTML = elem.name;

        cell = row.insertCell(-1);
        cell.innerHTML = getPrereqText(elem.prereqs);

        cell = row.insertCell(-1);
        cell.innerHTML = getReqText(elem.require);

        cell = row.insertCell(-1);
        cell.innerHTML = elem.effectText;

    });

    dataTable = document.getElementById("buildingDataTable");
    console.log("buildingData");
    // singular/plural, prereqs, require, effectText
    buildingData.forEach(function (elem, i, arr) {
        row = dataTable.insertRow(-1);

        cell = row.insertCell(-1);
        cell.innerHTML = sentenceCase(elem.getQtyName(1));

        cell = row.insertCell(-1);
        cell.innerHTML = getPrereqText(elem.prereqs);

        cell = row.insertCell(-1);
        cell.innerHTML = getReqText(elem.require);

        cell = row.insertCell(-1);
        cell.innerHTML = elem.effectText;

    });

    dataTable = document.getElementById("resourceDataTable");
    console.log("resourceData");
    // name, require
    resourceData.forEach(function (elem, i, arr) {
        row = dataTable.insertRow(-1);

        cell = row.insertCell(-1);
        cell.innerHTML = sentenceCase(elem.getQtyName(1));

        cell = row.insertCell(-1);
        cell.innerHTML = getReqText(elem.require);

    });

    dataTable = document.getElementById("unitDataTable");
    console.log("unitData");
    // singular/plural, prereqs, require, effectText
    unitData.forEach(function (elem, i, arr) {
        row = dataTable.insertRow(-1);

        cell = row.insertCell(-1);
        cell.innerHTML = sentenceCase(elem.getQtyName(1));

        cell = row.insertCell(-1);
        cell.innerHTML = getPrereqText(elem.prereqs);

        cell = row.insertCell(-1);
        cell.innerHTML = getReqText(elem.require);

        cell = row.insertCell(-1);
        cell.innerHTML = elem.effectText;

    });

    dataTable = document.getElementById("civSizeDataTable");
    // name, min_pop
    civSizes.forEach(function (elem, i, arr) {
        row = dataTable.insertRow(-1);

        cell = row.insertCell(-1);
        cell.innerHTML = elem.name;

        cell = row.insertCell(-1);
        cell.innerHTML = elem.min_pop;

    });

    dataTable = document.getElementById("colourDataTable");
    console.log("colourDataTable");
    // 123456789abcdef
    // 0369cf
    let colArr = ["0", "F"];
    let rgb;
    row = dataTable.insertRow(-1);
    for (let r = 0; r < colArr.length; r++) {
        for (let g = 0; g < colArr.length; g++) {
            for (let b = 0; b < colArr.length; b++) {
                rgb = "#" + colArr[r] + colArr[g] + colArr[b];
                cell = row.insertCell(-1);
                cell.style.backgroundColor = rgb;
                cell.innerHTML = rgb;
            }
        }
    }
    colArr = ["0", "8", "F"];
    row = dataTable.insertRow(-1);
    for (let r = 0; r < colArr.length; r++) {
        for (let g = 0; g < colArr.length; g++) {
            for (let b = 0; b < colArr.length; b++) {
                rgb = "#" + colArr[r] + colArr[g] + colArr[b];
                cell = row.insertCell(-1);
                cell.style.backgroundColor = rgb;
                cell.innerHTML = rgb;
            }
        }
    }
    colArr = ["0", "5", "A", "F"];
    row = dataTable.insertRow(-1);
    for (let r = 0; r < colArr.length; r++) {
        for (let g = 0; g < colArr.length; g++) {
            for (let b = 0; b < colArr.length; b++) {
                rgb = "#" + colArr[r] + colArr[g] + colArr[b];
                cell = row.insertCell(-1);
                cell.style.backgroundColor = rgb;
                cell.innerHTML = rgb;
            }
        }
        row = dataTable.insertRow(-1);
    }
    colArr = ["0", "3", "7", "B", "F"];
    row = dataTable.insertRow(-1);
    for (let r = 0; r < colArr.length; r++) {
        for (let g = 0; g < colArr.length; g++) {
            for (let b = 0; b < colArr.length; b++) {
                rgb = "#" + colArr[r] + colArr[g] + colArr[b];
                cell = row.insertCell(-1);
                cell.style.backgroundColor = rgb;
                cell.innerHTML = rgb;
            }
        }
        row = dataTable.insertRow(-1);
    }
    colArr = ["0", "3", "6", "9", "C", "F"];
    row = dataTable.insertRow(-1);
    for (let r = 0; r < colArr.length; r++) {
        for (let g = 0; g < colArr.length; g++) {
            for (let b = 0; b < colArr.length; b++) {
                rgb = "#" + colArr[r] + colArr[g] + colArr[b];
                cell = row.insertCell(-1);
                cell.style.backgroundColor = rgb;
                cell.innerHTML = rgb;
            }
        }
        row = dataTable.insertRow(-1);
    }





    // 360 023 045 068
    //row = dataTable.insertRow(-1);
    //let num;
    //for (let i = 0; i <= 8; i++) {
    //    num = Math.ceil((i + 1) * 45);
    //    if (num < 100) {
    //        num = num + "" + num + "" + num;
    //    }
    //    else if (num < 1000) {
    //        num = num + "" + num;
    //    }
    //    else {
    //        num = Math.ceil(num / 10);
    //        num = num + "" + num;
    //    }
    //    rgb = "#" + num;
    //    cell = row.insertCell(-1);
    //    cell.style.backgroundColor = rgb;
    //    cell.innerHTML = rgb;
    //}
};

data.setup = function () {
    setIndexArrays(civData);
    indexArrayByAttr(civSizes, "id");
};

data.setup();
// display the data
data.display();