/**
 * Created by Balkishan on 4/4/2017.
 */

var TAG = "EmployeeLogin.js - ";
var dbConfig = require('../../Environment/mongoDatabase.js');
var inputConfig = require('./config/input.js');
var underscore = require('underscore');
var crypto = require('crypto');
var async = require('async');

exports.login = function login(req, callback) {

    //console.log(new inputConfig.employeeModel())
    //console.log(typeof req.body.password);

    if(!(!req.body ||
        !req.body.username ||
        req.body.username.toString().trim().length === 0 ||
        !req.body.password ||
        req.body.password.toString().trim().length === 0)){

        var db = dbConfig.mongoDbConn;
        var empCred = db.collection('EmployeeCredentials');

        var username = req.body.username;
        //var password = req.body.password;
        var password = crypto.createHash('md5').update(req.body.password).digest('hex');
        var findOneQuery = {
            "userEntity.username":username,
            "userEntity.password":password
        };

        empCred.findOne(findOneQuery,{"_id":0}, function (error, result) {
            if(error){
                return callback(true,outputResult(500,"Internal Server Error."))
            }
            else{
                if(!result){
                    return callback(true,outputResult(404,"User not found."))
                }
                else{
                    req.session.userEntity = result.userEntity;
                    return callback(false,outputResult(200,result))
                }
            }
        })
    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }
};

exports.register = function (req, callback) {
    console.log("Entering register");
//    console.log("fun",req.body);
    if(!(!req.body ||
        !req.body.username ||
        req.body.username.toString().trim().length === 0 ||
        !req.body.password ||
        req.body.password.toString().trim().length === 0 ||
        !req.body.mobileNumber ||
        req.body.mobileNumber.toString().trim().length === 0 ||
        !req.body.emailId ||
        req.body.emailId.toString().trim().length === 0 )){

        validateUser(req, function (error,result) {
            if(error){
                return callback(true,result);
            }
            else{
                req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');

                upsertUser(req, function (error, result) {
                    return callback(false,result);
                })
            }
        });
    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }
};

function validateUser(req,callback){
    console.log("Entering validateUser");

    var username = req.body.username;
    var emailId = req.body.emailId;

    var db = dbConfig.mongoDbConn;
    var empCred = db.collection('EmployeeCredentials');

    async.parallel({
        "username":function (asyncCallback) {
            var countQuery = {
                "userEntity.username":username
            };

            console.log("countQuery : "+JSON.stringify(countQuery));

            empCred.count(countQuery,function (error, count) {
                if(error){
                    return asyncCallback(true);
                }
                else{
                    console.log(count);
                    if(count > 0){
                        return asyncCallback(false,true);
                    }
                    else{
                        return asyncCallback(false,false);
                    }
                }
            })
        },
        "emailId":function (asyncCallback) {
            var countQuery = {
                "userEntity.emailId":emailId
            };
            console.log("countQuery : "+JSON.stringify(countQuery));

            empCred.count(countQuery,function (error, count) {
                if(error){
                    return asyncCallback(true);
                }
                else{
                    console.log(count);
                    if(count > 0){
                        return asyncCallback(false,true);
                    }
                    else{
                        asyncCallback(false,false);
                    }
                }
            })
        }
    }, function (error, result) {
        if(error){
            return callback(true,outputResult(500,"Internal Server Error."))
        }
        else{
            if(result.username && result.emailId){
                return callback(true,outputResult(401,"Username and Email Id Already Exists"))
            }
            else if(result.username){
                return callback(true,outputResult(401,"Username Already Exists"))
            }
            else if(result.emailId){
                return callback(true,outputResult(401,"Email Id Already Exists"))
            }
            else{
                return callback(false)
            }
        }
    });
}

function upsertUser(req, callback) {
    console.log("Entering upsertUser");
    if(!(!req.body ||
        !req.body.username ||
        req.body.username.toString().trim().length === 0 ||
        !req.body.password ||
        req.body.password.toString().trim().length === 0 ||
        !req.body.mobileNumber ||
        req.body.mobileNumber.toString().trim().length === 0 ||
        !req.body.emailId ||
        req.body.emailId.toString().trim().length === 0 )){

        var employee = new inputConfig.employeeModel();
        employee = underscore.extend(employee,req.body);

        var newEmpId = "";
        async.series([
            function (asyncCallback) {
                if(!employee.employeeId || employee.employeeId.toString().trim().length === 0){
                    generateEmployeeId(function (error,result) {
                        if(error){
                            return asyncCallback(true);
                        }
                        else{
                            var year = (new Date().getFullYear()).toString().slice(-2);
                            newEmpId = "EMP" + year + ('00' + result).slice(-6);
                            return asyncCallback(false);
                        }
                    });
                }
                else{
                    newEmpId = employee.employeeId;
                    return asyncCallback(false);
                }
            },
            function (asyncCallback) {
                employee.employeeId = newEmpId;
                var db = dbConfig.mongoDbConn;

                var empCred = db.collection('EmployeeCredentials');

                var updateQuery = {
                    "userEntity.username":employee.username,
                    //"userEntity.password":employee.password,
                    //"userEntity.mobileNumber":employee.mobileNumber,
                    "userEntity.emailId":employee.emailId
                };
                console.log(JSON.stringify(updateQuery));

                var setQuery = {
                    "userEntity":employee
                };
                console.log(JSON.stringify(setQuery));

                empCred.update(updateQuery,setQuery,{upsert : true}, function (error, result) {
                    if(error){
                        return asyncCallback(true,outputResult(500,"Internal Server Error."))
                    }
                    else{
                        return asyncCallback(false,outputResult(200,"Successfully Updated"));
                    }
                })

            }
        ], function (error, result) {
            if(error){
                return callback(true,outputResult(500,"Internal Server Error."))
            }
            else{
                req.session.userEntity = employee;
                return callback(false,outputResult(200,{"userEntity":employee}))
            }
        });

    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }
};

exports.upsertUser = upsertUser;

exports.deleteEmployee = function (req, callback) {

    if(!(!req.params ||
        !req.params.empId ||
        req.params.empId.toString().trim().length === 0)){

        var employeeId = req.params.empId;

        var updateQuery = {
            "userEntity.employeeId":employeeId,
            "userEntity.status":{$nin:["inactive"]}
        };

        var setQuery = {
            $set:{
                "userEntity.status":"inactive"
            }
        };

        var db = dbConfig.mongoDbConn;
        var empCred = db.collection('EmployeeCredentials');

        empCred.update(updateQuery,setQuery, function (error, result) {
            if(error){
                return callback(true,outputResult(500,"Internal Server Error."))
            }
            else{
                if(result.result.n>0){
                    return callback(false,outputResult(200,"Employee : "+employeeId+" deleted Successfully..."))
                }
                else{
                    return callback(false,outputResult(404,"Unable to delete Employee : "+employeeId))
                }
            }
        })
    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }
}

exports.viewProfile = function (req, callback) {
    console.log(JSON.stringify(req.body));
    if(!(!req.body ||
        !req.body.empId ||
        req.body.empId.toString().trim().length === 0)){

        var db = dbConfig.mongoDbConn;
        var empCred = db.collection('EmployeeCredentials');

        var findOneQuery = {
            "userEntity.employeeId":req.body.empId,
            "userEntity.status":"active"
        };

        empCred.findOne(findOneQuery,{"_id":0,"userEntity":1},function (error, result) {
            if(!result){
                return callback(true,outputResult(404,"User not found."))
            }
            else{
                return callback(false,outputResult(200,result))
            }
        })
    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }

};

exports.listEmployees = function (req, callback) {
    var db = dbConfig.mongoDbConn;
    var empCred = db.collection('EmployeeCredentials');

    empCred.find({"userEntity.status":"active"},{"_id":0,"userEntity":1}).toArray(function (error, result) {
        if(error){
            return callback(true,outputResult(500,"Internal Server Error."))
        }
        else{
            return callback(false,outputResult(200,result))
        }
    })
};

exports.logout = function (req,callback){
    req.session.userEntity = undefined;
    return callback(false,outputResult(200,"Logout Successfully..."))
};

function generateEmployeeId(callback){
    var db = dbConfig.mongoDbConn;
    var counters = db.collection('counters');
    counters.findAndModify({ countId: 'employeeId'},null, { $inc: { seq: 1 } }, {new: true}, function(err, result){
        if (err) {
            callback(true);
        } else {
            callback(false, result.value.seq);
        }
    });
}

//Utility Functions
function outputResult(code,result) {
    var result = {
        "http_code": code,
        "message": result
    };
    return result;
}