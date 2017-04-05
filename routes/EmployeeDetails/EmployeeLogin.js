/**
 * Created by Balkishan on 4/4/2017.
 */

var TAG = "EmployeeLogin.js - ";
var dbConfig = require('../../Environment/mongoDatabase.js');
var inputConfig = require('./config/input.js');
var underscore = require('underscore');
var crypto = require('crypto');

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

exports.upsertUser = function (req, callback) {
    console.log("fun",req.body);
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
        employee.password = crypto.createHash('md5').update(employee.password).digest('hex');

        generateEmployeeId(function (error,result) {
            if(error){
                return callback(true,outputResult(500,"Internal Server Error."))
            }
            else{
                var year = (new Date().getFullYear()).toString().slice(-2);
                employee.employeeId = "EMP" + year + ('00' + result).slice(-6);
                var db = dbConfig.mongoDbConn;

                var empCred = db.collection('EmployeeCredentials');

                var updateQuery = {
                    "userEntity.username":employee.username,
                    "userEntity.password":employee.password,
                    "userEntity.mobileNumber":employee.mobileNumber,
                    "userEntity.emailId":employee.emailId
                };
                console.log(JSON.stringify(updateQuery))

                employee.password = crypto.createHash('md5').update(employee.password).digest('hex');
                var setQuery = {
                    "userEntity":employee
                };
                console.log(JSON.stringify(setQuery))

                empCred.update(updateQuery,setQuery,{upsert : true}, function (error, result) {
                    if(error){
                        return callback(true,outputResult(500,"Internal Server Error."))
                    }
                    else{
                        var db = dbConfig.mongoDbConn;
                        var empCred = db.collection('EmployeeCredentials');

                        var username = req.body.username;
                        //var password = req.body.password;
                        var password = crypto.createHash('md5').update(req.body.password).digest('hex');
                        var findOneQuery = {
                            "userEntity.username":username,
                            "userEntity.password":password
                        };

                        console.log(JSON.stringify(findOneQuery))

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
                        });
                    }
                })

            }
        });
    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }
};

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