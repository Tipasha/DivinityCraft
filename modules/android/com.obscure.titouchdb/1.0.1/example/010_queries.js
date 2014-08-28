require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
  
  describe('query (general)', function() {
    var db, view, query;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test01');
      view = db.getView('test');
      view.setMap(function(doc) { emit(doc.id, null); }, '1');
      query = view.createQuery();
    });
    
    it('must have a database property', function() {
      should(query).have.property('database', db);
    });
    
    it('must have a descending property', function() {
      should(query).have.property('descending');
      query.descending.should.be.a.Boolean;
    });
    
    it('must have an endKey property', function() {
      should(query).have.property('endKey');
    });
    
    it('must have an endKeyDocID property', function() {
      should(query).have.property('endKeyDocID');
    });
    
    it('must have a groupLevel property', function() {
      should(query).have.property('groupLevel');
      query.groupLevel.should.be.a.Number;
    });
    
    it('must have an allDocsMode property', function() {
      should(query).have.property('allDocsMode');
      query.allDocsMode.should.be.a.Number;
    });
    
    it('must have an indexUpdateMode property', function() {
      should(query).have.property('indexUpdateMode');
      query.indexUpdateMode.should.be.a.Number;
    });
    
    it('must have a keys property', function() {
      should(query).have.property('keys');
    });

    it('must have a limit property', function() {
      should(query).have.property('indexUpdateMode');
      query.indexUpdateMode.should.be.a.Number;
    });
    
    it('must have a mapOnly property', function() {
      should(query).have.property('mapOnly');
      query.mapOnly.should.be.a.Boolean;
    });
    
    it('must have a prefetch property', function() {
      should(query).have.property('prefetch');
      query.prefetch.should.be.a.Boolean;
    });
    
    it('must have a skip property', function() {
      should(query).have.property('skip');
      query.skip.should.be.a.Number;
    });
    
    it('must have a startKey property', function() {
      should(query).have.property('startKey');
    });
    
    it('must have a startKeyDocID property', function() {
      should(query).have.property('startKeyDocID');
    });
    
    it('must have a run function', function() {
      should(query.run).be.a.Function;
    });
    
    it.skip('must have a runAsync function', function() {
      should(query.runAsync).be.a.Function;
    });
    
    it.skip('must have a toLiveQuery function', function() {
      should(query.toLiveQuery).be.a.Function;
    });
    
    
  });
  
  describe('query (subsets)', function() {
    var db, view;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = utils.install_elements_database(manager);
      view = db.getView('docs_by_atno');
      view.setMap(function(doc) { emit(doc.atomic_number, doc.name); }, '1');
    });
    
    it('must return the correct number of rows when limit is set', function() {
      var q = view.createQuery();
      q.limit = 5;
      var e = q.run();
      e.count.should.eql(5);
      
      e.getRow(0).key.should.eql(1);
      e.getRow(1).key.should.eql(2);
      e.getRow(2).key.should.eql(3);
      e.getRow(3).key.should.eql(4);
      e.getRow(4).key.should.eql(5);
    });
    
    it('must return the correct starting row when skip is set', function() {
      var q = view.createQuery();
      q.skip = 8;
      var e = q.run();
      e.getRow(0).key.should.eql(9);
    });
    
    it('must return the correct subset of rows when skip and limit are set', function() {
      var q = view.createQuery();
      q.limit = 4;
      q.skip = 8;
      var e = q.run();
      e.count.should.eql(4);
      e.getRow(0).key.should.eql(9);
      e.getRow(3).key.should.eql(12);
    });
    
    it('must return the correct rows for startKey and endKey', function() {
      var q = view.createQuery();
      q.startKey = 41;
      q.endKey = 55;
      var e = q.run();
      e.count.should.eql(15);
      e.getRow(0).key.should.eql(41);
      e.getRow(14).key.should.eql(55);
    });
    
    it('must return the correct rows for startKeyDocID and endKeyDocID', function() {
      var single_key_view  = db.getView('single_key_view');
      single_key_view.setMap(function(doc) { emit(1, null); }, '1');
      var q = single_key_view.createQuery();
      q.startKey = 1;
      q.endKey = 1;
      q.startKeyDocID = 'Ti';
      q.endKeyDocID = 'Zn';
      var e = q.run();
      e.count.should.eql(14);
      if (Ti.Platform.osname != 'android') {
        // Android doesn't return row in order
        e.getRow(0).documentID.should.eql('Ti');
        e.getRow(13).documentID.should.eql('Zn');
      }
    });
    
    it('must return specified rows when keys are set', function() {
      var q = view.createQuery();
      q.keys = [11, 8, 1, 17, 19];
      var e = q.run();
      e.count.should.eql(5);
      e.getRow(0).key.should.eql(1);
      e.getRow(1).key.should.eql(8);
      e.getRow(2).key.should.eql(11);
      e.getRow(3).key.should.eql(17);
      e.getRow(4).key.should.eql(19);
    });
  });  
  
  describe('query (ordering)', function() {
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = utils.install_elements_database(manager);
      view = db.getView('docs_by_atno');
      view.setMap(function(doc) { emit(doc.atomic_number, doc.name); }, '1');
    });

    it('must return keys in descending order', function() {
      var q = view.createQuery();
      q.descending = true;
      var e = q.run();
      e.getRow(0).key.should.eql(118);
      e.getRow(1).key.should.eql(117);
      e.getRow(2).key.should.eql(116);
    });
    
    it('must subset and return keys in descending order', function() {
      var q = view.createQuery();
      q.descending = true;
      q.startKey = 35;
      q.endKey = 28;
      var e = q.run();
      e.count.should.eql(8);
      e.getRow(0).key.should.eql(35);
      e.getRow(1).key.should.eql(34);
      e.getRow(2).key.should.eql(33);
      e.getRow(3).key.should.eql(32);
      e.getRow(4).key.should.eql(31);
      e.getRow(5).key.should.eql(30);
      e.getRow(6).key.should.eql(29);
      e.getRow(7).key.should.eql(28);
    });
  });
  
  describe('query (grouping)', function() {
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = utils.install_elements_database(manager);
    });
    
    it('must query by complex key', function() {
      var view = db.getView('electrons_maponly');
      view.setMap(function(doc) { emit(doc.electrons, doc.atomic_weight); }, '1');
      var q = view.createQuery();
      var e = q.run();
      e.count.should.eql(118);
      e.getRow(0).key.should.eql([1]);
      e.getRow(81).key.should.eql([2, 8, 18, 32, 18, 4]);
    });

    it('must group rows', function() {
      // couchbase-lite-java-core 1.0.0 issue 225
      if (Ti.Platform.osname == 'android') {
        return;
      }
      
      var view = db.getView('electrons_mapreduce');
      view.setMapReduce(function(doc) { emit(doc.electrons, doc.atomic_weight); }, '_count', '1');
      var q = view.createQuery();
      q.groupLevel = 2;
      var e = q.run();
      e.count.should.eql(10);
      e.getRow(0).key.should.eql([1]);
      e.getRow(1).key.should.eql([2]);
      e.getRow(2).key.should.eql([2, 1]);
      e.getRow(3).key.should.eql([2, 2]);
      e.getRow(4).key.should.eql([2, 3]);
      e.getRow(5).key.should.eql([2, 4]);
      e.getRow(6).key.should.eql([2, 5]);
      e.getRow(7).key.should.eql([2, 6]);
      e.getRow(8).key.should.eql([2, 7]);
      e.getRow(9).key.should.eql([2, 8]);
    });
    
    it('must ignore reduce when mapOnly is set', function() {
      var view = db.getView('electrons_mapreduce_2');
      view.setMapReduce(function(doc) { emit(doc.electrons, doc.atomic_weight); }, '_count', '1');
      
      var q = view.createQuery();
      q.mapOnly = true;
      var e = q.run();
      should.exist(e);
      e.count.should.eql(118);
    });
  });
  
  describe('query (misc)', function() {
    var db;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test010_misc');
      var docs = utils.create_test_documents(db, 15);
    });
    
    it('must prefetch documents', function() {
      var view = db.getView('simple');
      view.setMap(function(doc) { emit(doc.atomic_number, null); }, '1');
      
      var q = view.createQuery();
      q.prefetch = true;
      var e = q.run();
      var r = e.getRow(0);
      r.documentProperties.should.have.properties(['_id', '_rev', 'testName', 'sequence']);
    });
    
  });
  
};