/**
 * Created by Balkishan on 4/5/2017.
 */
var TAG = "holidays.js - ";
var dbConfig = require('../../Environment/mongoDatabase.js');

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

//Utility Functions
function outputResult(code,result) {
    var result = {
        "http_code": code,
        "message": result
    };
    return result;
}