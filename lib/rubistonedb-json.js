var path = require('path');
var fs = require('fs');
var Promise = require('promise');

function fetchData (file) {
  return new Promise(function (resolve, reject){
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }else{
        resolve(JSON.parse(data));
      }
    });
  });
};

function saveData (file, data) {
  return new Promise(function (resolve, reject){
    console.log(data);
    var strfy = JSON.stringify(data);
    console.log(strfy);
    fs.writeFile(
      file,
      strfy,
      {
        encoding: 'utf8',
        mode: 438,
        flag: 'w'
      },
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
  );
  });
};

var RubistonedbJSON = function (dbconfig) {
  var dbfile = dbconfig.fileName;
  var internalData = undefined;
  var operations = 0;
  
  var _operationComplete = function (data){
    operations++;
    if (operations > 10) {
      return saveData(dbfile, internalData).then(function(){
        return data;
      });
    }
    return Promise.resolve(data);
  };
  
  this.init = function () {
    if (internalData !== undefined) {
      return Promise.resolve(internalData);
    }
    return fetchData(dbfile).then(function (data){
      internalData = data;
    }, function (err) {
      if (err.code === 'ENOENT') {
        //File doesn't exist, create
        return saveData(dbfile, {tables: {}}).then(function (data){
          internalData = data;
          return data;
//          resolve(data);
        }, function (err) {
          throw err;
        });
      }
    });
  };
  
  this.close = function () {
    
    return saveData(dbfile, internalData).then(function (data) {
      internalData = undefined;
      return 'Datababe successfuly closed';
    });
  };
  
  this.selectOne = function () {
    
  };
  
  this.insert = function (entity){
    return this.init().then(function(data){
      var table = data.tables[entity._modelName] || (data.tables[entity._modelName] = []);
      entity._id = table.length ? table[table.length]._id + 1 : 1;
      console.log(JSON.stringify(entity));
      table.push(entity);
      return _operationComplete(entity._id);
    });
  };
};

module.exports = RubistonedbJSON;