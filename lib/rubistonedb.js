'use strict';

var objectAssign = require('object-assign');

var defineConstProperty = function (obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value,
    enumerable: true
  });
};

var rbdb = function (driver) {
  //Private
  var modelDefinitions = {};
  var app = {};
  
  /**
  * Field Types
  */

  var fieldTypes = {
    'number': function (obj, name, value){
      obj._data[name] = value;
      Object.defineProperty(obj, name, {
        get: function() { return this._data[name]; },
        set: function(newValue) { this._data[name] = newValue; },
        enumerable: true
      })
    }
  };

  /**
    * Entity
    * This is empty because every entity is filled on instantiation
    */
  
  var Entity = function(){

  };

  /**
    * init
    * @param {Object} initial data
    */

  Object.defineProperty(Entity.prototype, 'init', {
    value:function (data) {
      for (var key in data){
        this[key] = data[key];
      }
    }
  });

  Object.defineProperty(Entity.prototype, 'save', {
    value:function () { }
  });

  Object.defineProperty(Entity.prototype, 'fetch', {
    value:function () { }
  });

  /**
    * EntityCollection
    * This is empty because every entity is filled on instantiation
    */

  var EntityCollection = function(){

  };

  /**
    * Model
    */

  var Model = function(name, fields){
    defineConstProperty(this, 'name', name);
    defineConstProperty(this, 'fields', fields);

    var entity = function(data){
      Object.defineProperty(this, '_data', {
        value: {}
      });

      for (var field in fields) {
        fieldTypes[fields[field]](this, field, 0);
      }

      this.init(data);
    };

    entity.prototype = Object.create(Entity.prototype);
    defineConstProperty(entity.prototype, '_modelName', name);

    defineConstProperty(this, 'entity', entity);
  };

  Object.defineProperty(Model.prototype, 'save', {
    value:function () {}
  });
  
  Object.defineProperty(Model.prototype, 'get', {
    value:function () {
      var offset = 0;
      var quantity = 1;
      if (arguments.length == 1){
        quantity = arguments[0];
      }

      if (arguments.length == 2){
        offset = arguments[0];
        quantity = arguments[1];
      }
      
      
    }
  });
  
  //Public
  
  /**
    * defineModel
    * @param {String} Name
    * @param {Object} Fields that defines the internal structure of a Model
    */
  app.defineModel = function (name, fields) {
    if (modelDefinitions[name]) {
      throw 'Error: model ' + name + ' is already defined';
    }

    var m1 = new Model(name, fields);
    
    modelDefinitions[name] = m1;
    
    return app;
  };
  
  //Transform each model in a property of app :D
  app.getModel = function (name) {
    //return a model instance
    return modelDefinitions[name];
  };
  
  app.getSchema = function () {
    
  };
  
  return app;
};

module.exports = rbdb;

