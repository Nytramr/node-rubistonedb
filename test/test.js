var path = require('path');
var fs = require('fs');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var should = chai.should(); //Init should assert chai style

var db = require('../lib/rubistonedb');
var dbdriver = require('../lib/rubistonedb-json');

var testConfig = {
  jsondbfile: path.join(__dirname, './temp/json.json')
}

describe ('Rubistone DB', function () {
  var mydb;
  before(function(){
    fs.unlinkSync(testConfig.jsondbfile);
    mydb = db();
  });
  
  describe('Model', function () {
    before(function(){
      mydb.defineModel('m1', {num1:'number'});
    });
    
    it('Should have a method save', function () {
      var m1 = mydb.getModel('m1');
      m1.should.have.property('save');
      (m1.save).should.be.Function;
    });
    
    it('Should have an attribute fields', function () {
      var m1 = mydb.getModel('m1');
      m1.should.have.property('fields');
      (m1.fields).should.be.Object;
    });
    
    it('Should have a function attribute entity', function () {
      var m1 = mydb.getModel('m1');
      m1.should.have.property('entity');
      (m1.entity).should.be.Function;
    });
  });
  
  describe('A second Model', function () {
    before(function(){
      mydb.defineModel('m2', {num3:'number'});
    });
    
    it('Should be different from the first Model', function () {
      var m1 = mydb.getModel('m1');
      var m2 = mydb.getModel('m2');
      m1.should.not.be.eql(m2);
    });
  });
  
  describe('Entity', function () {
    var entity;
    before(function(){
      var m1 = mydb.getModel('m1');
      entity = m1.entity;
    });
    
    it('Should be an object', function () {
      var e1 = new entity();
      (e1).should.be.an.Object;
    });
    
    it('Should have a method save', function () {
      var e1 = new entity();
      e1.should.have.property('save').that.is.a.Function;
    });
    
    it('Should have a property num1', function () {
      var e1 = new entity();
      e1.should.have.property('num1');
    });
    
    it('Should have a property modelName which is the of its creator', function () {
      var m1 = mydb.getModel('m1');
      var e1 = new m1.entity();
      e1.should.have.property('_modelName').that.is.equals(m1.name);
    });
    
    it('Should admit new values', function () {
      var e1 = new entity();
      e1.num1 = 200;
      e1.should.have.property('num1', 200);
    });
    
    it('Should support independent instances', function () {
      var e1 = new entity();
      var e2 = new entity();
      e1.num1 = 200;
      e1.should.have.property('num1', 200);
      e2.should.have.property('num1', 0);
    });
    
    it('Should be initialized as {num1: 100} using the method init', function () {
      var e1 = new entity();
      
      e1.init({num1: 100});
      (e1._data).should.be.eql({num1: 100});
    });
    
    it('Should be stringified directly', function () {
      var e1 = new entity();
      
      e1.init({num1: 100});
      (JSON.stringify(e1)).should.be.eql('{"num1":100}');
    });
  });
  
  describe ('Rubistone JSON driver', function () {
    var driver = null;
    var entity = null;
    
    before(function () {
      driver = new dbdriver({fileName: testConfig.jsondbfile});
      var m1 = mydb.getModel('m1');
      entity = m1.entity;
    });
    
    it('Should initialize the json data file', function () {
      return driver.init().should.eventually.not.be.rejectedWith(Error);
    });
    
    it('Should insert the first entity', function () {
      var e1 = new entity();
      
      e1.init({num1: 100});
      return driver.insert(e1).should.eventually.not.be.rejectedWith(Error);
    });
    
    after(function (){
      console.log('after');
      return driver.close();
    });
    
  });
//  after(function () {
//    console.log('FINISH');
//  });
  
});