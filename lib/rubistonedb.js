'use strict';

var objectAssign = require('object-assign');

var defineConstProperty = function (obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value,
    enumerable: true
  });
};


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
}

/**
  * Entity
  */

var Entity = function(){
  
};

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



var rbdb = function (driver) {
  //Private
  var modelDefinitions = {};
  
  var app = {};
  
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