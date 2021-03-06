/**
 * Created by Balkishan on 4/5/2017.
 */
var TAG = "holidays.js - ";
var dbConfig = require('../../Environment/mongoDatabase.js');
var inputConfig = require('./config/input.js');
var underscore = require('underscore');

function applyLeave(req,callback){
    console.log("Entering applyLeave");

    if(!(!req.body ||
        !req.body.employeeId ||
        req.body.employeeId.toString().trim().length === 0 ||
        !req.body.fromDate ||
        req.body.fromDate.toString().trim().length === 0 ||
        !req.body.toDate ||
        req.body.toDate.toString().trim().length === 0 ||
        //!req.body.noOfDays ||
        //req.body.noOfDays.toString().trim().length === 0 ||
        !req.body.type ||
        req.body.type.toString().trim().length === 0
        )){
        var db = dbConfig.mongoDbConn;
        var leavesHistoryColl = db.collection('EmployeeLeaveHistory');

        var leaveModel = new inputConfig.leaveModel();
        leaveModel = underscore.extend(leaveModel,req.body);

        generateLeaveId(function (error, result) {
            if(error){
                return callback(true,outputResult(500,"Internal Server Error."))
            }
            else{
                leaveModel.leaveId = result;
                leavesHistoryColl.insert(leaveModel,function (error, result) {
                    if(error){
                        return callback(true,outputResult(500,"Internal Server Error."))
                    }
                    else{
                        return callback(false,outputResult(200,"Added successfully..."))
                    }
                })
            }
        });

    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }
}

exports.applyLeave = applyLeave;

//Function to get inquiry List for Suppliers.
exports.listHolidays = function (req, callback) {
    console.log(JSON.stringify(req.session.userEntity));

    var db = dbConfig.mongoDbConn;
    var holiColl = db.collection('holidays');

    holiColl.find({}).toArray(function (error, result) {
        if(error){
            return callback(true,outputResult(500,"Internal Server Error."))
        }
        else{
            if(result.length>0){
                return callback(false,outputResult(200,result))
            }
            else{
                return callback(true,outputResult(404,"No holidays listed"))
            }
        }
    })
};

//Function to get inquiry List for Suppliers.
exports.listLeaves = function (req, callback) {
    if(!(!req.body ||
        !req.body.empId ||
        req.body.empId.toString().trim().length === 0)){

        var db = dbConfig.mongoDbConn;
        var leavesHistoryColl = db.collection('EmployeeLeaveHistory');

        var findQuery = {
            "employeeId": req.body.empId
        };

        leavesHistoryColl.find(findQuery).toArray(function (error, result) {
            if(error){
                return callback(true,outputResult(500,"Internal Server Error."))
            }
            else{
                if(result.length>0){
                    return callback(false,outputResult(200,result))
                }
                else{
                    return callback(true,outputResult(404,"No Leaves Found for EmpId : "+req.body.empId))
                }
            }
        })
    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }

};

function deleteLeave(req,callback){
    if(!(!req.body ||
        !req.body._id ||
        req.body._id.toString().trim().length === 0)){

        var db = dbConfig.mongoDbConn;
        var leavesHistoryColl = db.collection('EmployeeLeaveHistory');

        var removeQuery = {
            "leaveId": req.body.leaveId,
            "employeeId":req.body.employeeId
        };
        console.log(JSON.stringify(removeQuery));
        leavesHistoryColl.remove(removeQuery,1,function(error, result) {
            if(error){
                return callback(true,outputResult(500,"Internal Server Error."))
            }
            else{
                return callback(false,outputResult(200,"Leave Successfully Deleted"))
            }
        })
    }
    else{
        return callback(true,outputResult(400,"Bad or ill-formed request.."))
    }
}

exports.deleteLeave = deleteLeave;

function generateLeaveId(callback){
    var db = dbConfig.mongoDbConn;
    var counters = db.collection('counters');
    counters.findAndModify({ countId: 'leaveId'},null, { $inc: { seq: 1 } }, {new: true}, function(err, result){
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