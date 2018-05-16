var DEBUG = true;
var GoogleSpreadsheet = require('google-spreadsheet');
var creds_json = {
  client_email: process.env.client_email,
  private_key: process.env.private_key,
}

var totalRows = 14;

exports.GetTable = function (){
  return new Promise((resolve) => {
    GetSpreadsheetDoc()
    .then((res) => Authenticate(res))
    .then((doc) => PrintInfo(doc))
    .then((doc) => GetSheetFromDoc(doc, 0))
    .then((sheet) => GetTable(sheet,totalRows, 2))
    .then((table) => SimplifyTable(table))
    .then((sTable) => {
      resolve(sTable);
    })
  })
}

exports.SetCounter = function (key, newCount){
  GetSpreadsheetDoc()
  .then((res) => Authenticate(res))
  .then((doc) => PrintInfo(doc))
  .then((doc) => GetSheetFromDoc(doc, 0))
  .then((sheet) => GetTable(sheet,totalRows, 2))
  .then((table) => SetKey(table, key, newCount))
  .then((table) => SimplifyTable(table))
}

exports.IncrementCounter = function (key){
  return new Promise((resolve) => {
    GetSpreadsheetDoc()
    .then((res) => Authenticate(res))
    .then((doc) => PrintInfo(doc))
    .then((doc) => GetSheetFromDoc(doc, 0))
    .then((sheet) => GetTable(sheet,totalRows, 2))
    .then((table) => IncrementKey(table, key))
    .then((table) => SimplifyTable(table))
    .then((sTable) => {
      resolve(sTable);
    })
  });
}

exports.GetCount = function (key){
  return new Promise((resolve) => {
    GetSpreadsheetDoc()
    .then((res) => Authenticate(res))
    .then((doc) => PrintInfo(doc))
    .then((doc) => GetSheetFromDoc(doc, 0))
    .then((sheet) => GetTable(sheet,totalRows, 2))
    .then((table) => SimplifyTable(table))
    .then((sTable) => {
      resolve(sTable[key]);
    })
  });
}

function GetSpreadsheetDoc() {
  log("Making document object")
  var doc = new GoogleSpreadsheet(process.env.SheetKey);
  return Promise.resolve(doc);
}

function Authenticate(doc){
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds_json, (err, res) => {
      if (err) return reject(err);
      else 
      {
        log("Authentication done")
        resolve(doc);
      }
    });    
  });
}

function PrintInfo(doc){
  return new Promise((resolve, reject) => {
    doc.getInfo((err, info) => {
      if (err) return reject(err);
      else 
      {
        log('Loaded doc: '+info.title+' by '+info.author.email);
        resolve(doc);
      }
    });
  });
}

function GetSheetFromDoc(doc, sheetNum){
  return new Promise((resolve, reject) => {
    doc.getInfo((err, info) => {
      var sheet = info.worksheets[sheetNum];
      log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
      resolve(sheet);
    });
  });
}

function GetTable(sheet, rowCount, colCount){
  var tableObj = {};
  return new Promise(function (resolve, reject){
    sheet.getCells({'max-row': rowCount, 'max-col': colCount}, 
      function(err, cells) {
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
  var simpleTable = {};
  log("simplifying table ...");
  for(let key in table) {
    simpleTable[key] = table[key].value;
  }
  return Promise.resolve(simpleTable);
}

function SetKey(table, key, value) {
  return new Promise(function (resolve, reject){
    log("Setting key:" +  key + ", with value: " + value);
    table[key].value = value;
    log("Saving result");
    table[key].save();
    resolve(table);
  })
} 

function IncrementKey(table, key) {
  return new Promise(function (resolve, reject){
    log("Incrementing key:" +  key);
    if(!table[key])
      key = "meme";
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

