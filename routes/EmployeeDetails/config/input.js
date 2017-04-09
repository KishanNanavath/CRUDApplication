/**
 * Created by Balkishan on 4/4/2017.
 */
exports.employeeModel = function(){
    this.username = "";
    this.password = 0;
    this.firstName = "";
    this.lastName = "";
    this.mobileNumber = "";
    this.emailId = "";
    this.department = "";
    this.salary = "";
    this.joiningDate = "";
    this.status = "active";
};

exports.leaveModel = function(){
    this.employeeId="";
    this.fromDate="";
    this.toDate="";
    this.noOfDays=0;
    this.remarks="";
    this.status="Pending";
    this.leaveId = 0;
};