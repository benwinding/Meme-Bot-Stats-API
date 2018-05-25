const DEBUG = true;
const GoogleSpreadsheet = require('google-spreadsheet');

function getPrivateKey() {
    const key = process.env.private_key;
    const keyParsed = key.replace(/\\n/g, '\n');
    return keyParsed;
}

const creds_json = {
    client_email: process.env.client_email,
    private_key: getPrivateKey(),
};

const maxRows = 30;
const numCols = 2;

module.exports = {
    ReturnTable: ReturnTable,
    IncrementCounter: IncrementCounter,
    GetCount: GetCount,
};

const MemeTable = function () {

};

function ReturnTable() {
    return GetSpreadsheetDoc()
        .then((res) => Authenticate(res))
        .then((doc) => PrintInfo(doc))
        .then((doc) => GetSheetFromDoc(doc, 0))
        .then((sheet) => GetTableAsArray(sheet, maxRows, numCols))
        .then((table) => SimplifyTable(table))
        .then((sTable) => Promise.resolve(sTable))
        .catch((err) => Promise.reject("!GetTable failed: " + err));
}

function IncrementCounter(key) {
    return GetSpreadsheetDoc()
        .then((res) => Authenticate(res))
        .then((doc) => PrintInfo(doc))
        .then((doc) => GetSheetFromDoc(doc, 0))
        .then((sheet) => GetTableAsArray(sheet, maxRows, numCols))
        .then((table) => IncrementKey(table, key))
        .then((table) => SimplifyTable(table))
        .then((sTable) => Promise.resolve(sTable))
        .catch((err) => Promise.reject("!IncrementCounter failed: " + err));
}

function GetCount(key) {
    return GetSpreadsheetDoc()
        .then((res) => Authenticate(res))
        .then((doc) => PrintInfo(doc))
        .then((doc) => GetSheetFromDoc(doc, 0))
        .then((sheet) => GetTableAsArray(sheet, maxRows, numCols))
        .then((table) => SimplifyTable(table))
        .then((sTable) => Promise.resolve(sTable[key]))
        .catch((err) => Promise.reject("!GetCount failed: " + err));
}

function GetSpreadsheetDoc() {
    log("Making document object");
    const doc = new GoogleSpreadsheet(process.env.SheetKey);
    return Promise.resolve(doc);
}

function Authenticate(doc) {
    return new Promise((resolve, reject) => {
        doc.useServiceAccountAuth(creds_json, (err, res) => {
            if (err) {
                reject(err.toString());
                logErr("! Error Authenticate: " + err.toString());
                return;
            }
            log("Authentication successful!");
            resolve(doc);
        });
    });
}

function PrintInfo(doc) {
    return new Promise((resolve, reject) => {
        doc.getInfo((err, info) => {
            if (err) {
                reject(err.toString());
                logErr("! Error PrintInfo: " + err.toString());
                return;
            }
            log(`Loaded doc: ${info.title} by ${info.author.email}`);
            resolve(doc);
        });
    });
}

function GetSheetFromDoc(doc, sheetNum) {
    return new Promise((resolve, reject) => {
        doc.getInfo((err, info) => {
            if (err) {
                reject(err.toString());
                logErr("! Error GetSheetFromDoc: " + err.toString());
                return;
            }
            const sheet = info.worksheets[sheetNum];
            log(`Got sheet, name:${sheet.title}, size:${sheet.rowCount}x${sheet.colCount}`);
            resolve(sheet);
        });
    });
}

function GetTableAsArray(sheet, rowCount, colCount) {
    return new Promise((resolve, reject) => {
        sheet.getCells({'max-row': rowCount, 'max-col': colCount, 'return-empty': true}, (err, cells) => {
            if (err) {
                reject(err.toString());
                logErr("! Error GetTable: " + err.toString());
                return;
            }
            const table = [];
            for(let r=0; r< rowCount; r++) {
                const cellLeft = cells[r * 2];
                const cellRight = cells[r * 2 + 1];
                let row = {};
                row.name = cellLeft;
                row.counter = cellRight;
                table.push(row);
            }
            log("Got table from sheet");
            resolve(table);
        });
    });
}

function SimplifyTable(table) {
    log("simplifying table ...");
    const simpleTable = {};
    for (const row of table) {
        if (row.name.value)
            simpleTable[row.name.value] = row.counter.value;
    }
    return Promise.resolve(simpleTable);
}

function IncrementKey(table, name) {
    for (const row of table) {
        if (row.name && row.name.value === name) {
            row.counter.value = Number(row.counter.value) + 1;
            row.counter.save();
            log("Incrementing key: " +  name);
            return Promise.resolve(table);
        }
    }
    for (const row of table) {
        if (row.name.value)
            continue;
        row.name.value = name;
        row.name.save();
        row.counter.value = 1;
        row.counter.save();
        log("Adding new key: " + name);
        return Promise.resolve(table);
    }
    logErr("! Error IncrementKey, unable to add key: " + name);
    return Promise.reject(`! Error IncrementKey, unable to add key: '${name}'`);
}

function log(message) {
    if(DEBUG)
        console.log(message);
}

function logErr(message) {
    if(DEBUG)
        console.error(message);
}
