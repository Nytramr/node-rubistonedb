/***
 * TODOs
 * 
 *  Create indexes
 */

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
//    console.log('operation complete');
    operations++;
    if (operations > 10) {
      return saveData(dbfile, internalData).then(function(){
        return data;
      });
    }
    return Promise.resolve(data);
  };
  
  
  var _lookForIndexById = function (array, entityId) {
    //TODO: Maybe, because how entities are inserted, ids are stored in ascendent order
    //  Therefore implement dichotomic search
    
    var i = array.length - 1;
    while (i >= 0 && array[i]._id !== entityId) {
      i--;
    }
    return i;
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
  
  this.getIds = function (tableName, quantity, offset) {
    if (!tableName){
      //Error, tableName is mandatory
      return Promise.reject(new Error('tableName must by provided'));
    }
    //Init parameters
    quantity = quantity || 1;
    offset = offset || 0;
    
    return this.init().then(function (data) {
      var table = data.tables[tableName].slice();
      var i, ids = [];
      
      for (i = offset; i < quantity; i++) {
        ids.push(table[i]._id);
      }

      return Promise.resolve(ids);
    });
  };
  
  this.getById = function (tableName) {
    if (arguments.length < 2){
      //Error, too few arguments
      return Promise.reject(new Error('getById must receive at least 2 arguments (tableName, ids [, ...])'));
    }
    
    if (!tableName){
      //Error, tableName is mandatory
      return Promise.reject(new Error('tableName must by provided'));
    }
    
    var i = 1;
    var entitiesId = [];
    while ( i < arguments.length) {
      if (arguments[i].constructor == Array) {
        entitiesId.concat(arguments[i]);
      } else {
        entitiesId.push(arguments[i]);
      }
      i++;
    }
    
    return this.init().then(function(data){
      var table = data.tables[tableName];
      var entities = entitiesId.map(function (e){
        var index = _lookForIndexById(table, e);
        if (index >= 0) {
          return table[index];
        }
        return null;
      });

      return Promise.resolve(entities);
    });
  };
  
  this.selectOne = function () {
    
  };
  
  this.insert = function (entity){
    if (entity._id !== undefined){
      //Error, can not insert an identified entity
      return Promise.reject(new Error('Cannot insert: duplicate id ' + entity._id));
    }
    return this.init().then(function(data){
      var table = data.tables[entity._modelName] || (data.tables[entity._modelName] = []);
      entity._id = table.length ? table[table.length-1]._id + 1 : 1;
      table.push(entity);
      return _operationComplete(entity);
    });
  };
  
  this.update = function (entity){
    if (entity._id === undefined){
      //Error, can not update
      return Promise.reject(new Error('Cannot update: id is not present'));
    }
    return this.init().then(function(data){
      var table = data.tables[entity._modelName];
      var index = _lookForIndexById(table, entity._id);
      if (index < 0) {
        return Promise.reject(new Error('Cannot update: id is not present'));
      }
      table[index] = entity;
      return _operationComplete(entity);
    });
  };
};

module.exports = RubistonedbJSON;