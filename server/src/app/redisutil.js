let redis = require('redis');

module.exports = function () {
  let redisClient = {};
  return {
    redisSave: function (key, value) {
      redisClient.set(key, JSON.stringify(value), function (err, res) {
        console.log("saveProxy err " + err);
        console.log("saveProxy res " + res);
      });
    },

    redisInit: function (host, port) {
      redisClient = redis.createClient({"host": host, "port": port});

      redisClient.on("error", function (err) {
        console.log("Redis error " + err);
      });
      return this.redisClient;
    },

    redisGet: function (key) {
      return new Promise(function (resolve, reject) {
        redisClient.get(key, function (err, res) {
          resolve(JSON.parse(res));
        });
      });
    },

    getToolProxy: function () {
      return new Promise(function (resolve, reject) {
        redisClient.keys("*-*", function (err, replies) {
          console.log(replies.length + " replies:");
          replies.forEach(function (reply, i) {
            console.log("    " + i + ": " + reply);
          });
          redisClient.mget(replies, function (err, results) {
            resolve(results);
          });
        });
      });
    }
  };
}();