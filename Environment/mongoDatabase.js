/**
 * Created by Balkishan on 4/4/2017.
 */
var TAG = 'mongoDatabase.js';
var mongoClient =  require('mongodb').MongoClient;

var env = require('./env.js').env;
console.log(TAG + " " +"Deployment Environment is: " + env);


var dbConfig = {
    "prd":
    {
        "type": "",
        "user": "",
        "pwd": "",
        "mongod": [],
        "database": ""
    },

    "stg":
    {
        "type": "",
        "user": "",
        "pwd": "",
        "mongod": [],
        "database": ""
    },

    "dev":
    {
        "type" : "",
        "user": "",
        "pwd": "",
        "mongod":[],
        "database": ""
    },
    "demo":
    {
        "type" : "",
        "user": "",
        "pwd": "",
        "mongod":[],
        "database": ""
    },

    "loc":
    {
        "type": "singleInstance",
        "user": "",
        "pwd": "",
        "mongod": ["127.0.0.1:27017"],
        "database": "crudMongoDB"
    }
};

var connParams = null;
if (env === 'prd') {
    connParams = dbConfig.prd;
} else if ( env === 'stg') {
    connParams = dbConfig.stg;
} else if ( env === 'dev') {
    connParams = dbConfig.dev;
}else if ( env === 'demo') {
    connParams = dbConfig.demo;
} else {
    connParams = dbConfig.loc;
}
var mongod = connParams.mongod;

var databaseURL = null;
var mongoDbConn = null;

var hosts = null;
for (var i=0; i<mongod.length; i++){
    if (i === 0) {
        hosts = mongod[0];
    }else {
        hosts = hosts + ',' + mongod[i];
    }
}

var dbConnUrl = null;
if (!( connParams.user === "" && connParams.pwd === "")) {
    dbConnUrl = 'mongodb://' + connParams.user + ':' + connParams.pwd + '@' + hosts + '/' + connParams.database;
    // dbConnUrl = 'mongodb://' + connParams.user + ':' + connParams.pwd + '@' + hosts + '/' + connParams.database + '?replicaSet=msupply&connectTimeoutMS=300000&socketTimeoutMS=300000';
    console.log(dbConnUrl);
} else {
    dbConnUrl = 'mongodb://' + hosts + '/' + connParams.database ;
}


exports.createMongoConn = function(callback) {

    mongoClient.connect(dbConnUrl,function (err, database) {
        if (err) {
            console.log('Connection lost to: ', dbConnUrl);
            callback(err);
        } else {
            console.log('Connection established to: ', dbConnUrl);
            exports.mongoDbConn = database;
            callback(false);
        }
    });
}

//Export the connection
//module.exports = mongoDbConn;