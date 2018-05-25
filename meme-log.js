const DEBUG = true;
const GoogleSpreadsheet = require('google-spreadsheet');
const creds_json = {
    client_email: process.env.client_email,
    private_key: process.env.private_key,
};

const totalRows = 14;

module.exports = {
    ReturnTable: ReturnTable,
    IncrementCounter: IncrementCounter,
    GetCount: GetCount,
};

function ReturnTable() {
    return GetSpreadsheetDoc()
        .then((res) => Authenticate(res))
        .then((doc) => PrintInfo(doc))
        .then((doc) => GetSheetFromDoc(doc, 0))
        .then((sheet) => GetTable(sheet, totalRows, 2))
        .then((table) => SimplifyTable(table))
        .then((sTable) => Promise.resolve(sTable))
        .catch((err) => Promise.reject("!GetTable failed: " + err));
}

function IncrementCounter(key) {
    return GetSpreadsheetDoc()
        .then((res) => Authenticate(res))
        .then((doc) => PrintInfo(doc))
        .then((doc) => GetSheetFromDoc(doc, 0))
        .then((sheet) => GetTable(sheet, totalRows, 2))
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
        .then((sheet) => GetTable(sheet, totalRows, 2))
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
            log(`sheet 1: ${sheet.title} ${sheet.rowCount}x${sheet.colCount}`);
            resolve(sheet);
        });
    });
}

function GetTable(sheet, rowCount, colCount) {
    const tableObj = {};
    return new Promise((resolve, reject) => {
        sheet.getCells({'max-row': rowCount, 'max-col': colCount}, (err, cells) => {
            if (err) {
                reject(err.toString());
                logErr("! Error GetTable: " + err.toString());
                return;
            }
            for(let r=0; r< rowCount; r++) {
                let rowKey = cells[r * 2].value;
                let rowValue = cells[r * 2 + 1];
                tableObj[rowKey] = rowValue;
            }
            log("Got table from sheet");
            resolve(tableObj);
        });
    });
}

function SimplifyTable(table) {
    const simpleTable = {};
    log("simplifying table ...");
    for(let key in table) {
        simpleTable[key] = table[key].value;
    }
    return Promise.resolve(simpleTable);
}

function IncrementKey(table, key) {
    return new Promise((resolve, reject) => {
        log("Incrementing key:" +  key);
        if(!table[key]) {
            reject(`No key named: '${key}'`);
            logErr("! Error IncrementKey, no key named: " + key);
            return;
        }
        table[key].value = Number(table[key].value) + 1;
        log("Saving result");
        table[key].save();
        resolve(table);
    })
}

function log(message) {
    if(DEBUG)
        console.log(message);
}

function logErr(message) {
    if(DEBUG)
        console.error(message);
}
