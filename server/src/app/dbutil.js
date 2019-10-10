const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

module.exports = (function() {
  let db = {};
  return {
    dbInit: function(filename, defaultValue) {
        console.log('dbInit; filename:', filename);
        if(!filename) {
            filename = 'db.json';
        }
        if(!defaultValue) {
            defaultValue = {};
        }

        db = low(new FileSync(filename, { defaultValue: defaultValue }));
    },

    dbSave: function(key, value) {
        console.log('saving db entry with key:', key, 'value', value);

        db.set(key, value).write();

      console.log('saved db entry with key:', key);
    },

    dbGet: function(key) {
      return db.get(key).value();
    }
  };
})();
