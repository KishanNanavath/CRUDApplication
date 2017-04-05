/**
 * Created by Balkishan on 4/4/2017.
 */
var express = require('express');
var app = express();

var EmployeeLogin = require('./EmployeeLogin.js');
var holidays = require('./holidays');
var fs = require('fs');
var path = require('path');

//post request for login by supplier.
app.post('/api/v1.0/login', function(req, res){
    EmployeeLogin.login(req, function(err, regres){
        res.statusCode =  regres.http_code;
        req.body.supplierSession  = regres.message;
        res.json(regres);
    });
});

//post request for login by supplier.
app.post('/api/v1.0/register', function(req, res){
    console.log("reg",JSON.stringify(req.body));
    EmployeeLogin.upsertUser(req, function(err, regres){
        res.statusCode =  regres.http_code;
        res.json(regres);
    });
});

//post request for login by supplier.
app.post('/api/v1.0/updateDetails', function(req, res){
    if(req.session.userEntity){
        EmployeeLogin.upsertUser(req, function(err, regres){
            res.statusCode =  regres.http_code;
            res.json(regres);
        });
    }
    else{
        var regres = {
            "http_code": 401,
            "message": "No active session found."
        };
        res.statusCode =  regres.http_code;
        res.json(regres);
    }
});

//post request for login by supplier.
app.delete('/api/v1.0/deleteEmployee/:empId', function(req, res){
    console.log(JSON.stringify(req.params));
    EmployeeLogin.deleteEmployee(req, function(err, regres){
        res.statusCode =  regres.http_code;
        res.json(regres);
    });
});

//post request for login by supplier.
app.post('/api/v1.0/employeeList', function(req, res){
    EmployeeLogin.listEmployees(req, function(err, regres){
        res.statusCode =  regres.http_code;
        res.json(regres);
    });
});

//post request for login by supplier.
app.get('/api/v1.0/listHolidays', function(req, res){
    if(req.session.userEntity){
        holidays.listHolidays(req, function(err, regres){
            res.statusCode =  regres.http_code;
            res.json(regres);
        });
    }
    else{
        var regres = {
            "http_code": 401,
            "message": "No active session found."
        };
        res.statusCode =  regres.http_code;
        res.json(regres);
    }
});

//post request for login by supplier.
app.post('/api/v1.0/listLeaves', function(req, res){
    if(req.session.userEntity){
        holidays.listLeaves(req, function(err, regres){
            res.statusCode =  regres.http_code;
            res.json(regres);
        });
    }
    else{
        var regres = {
            "http_code": 401,
            "message": "No active session found."
        };
        res.statusCode =  regres.http_code;
        res.json(regres);
    }
});

//post request for login by supplier.
app.get('/api/v1.0/logout', function(req, res){
    if(req.session.userEntity){
        EmployeeLogin.logout(req, function(err, regres){
            res.statusCode =  regres.http_code;
            res.json(regres);
        });
    }
    else{
        var regres = {
            "http_code": 401,
            "message": "No active session found."
        };
        res.statusCode =  regres.http_code;
        res.json(regres);
    }
});

//post request for login by supplier.
app.post('/api/v1.0/viewProfile', function(req, res){
    console.log("ki",JSON.stringify(req.body));
    if(req.session.userEntity){
        EmployeeLogin.viewProfile(req, function(err, regres){
            res.statusCode =  regres.http_code;
            res.json(regres);
        });
    }
    else{
        var regres = {
            "http_code": 401,
            "message": "No active session found."
        };
        res.statusCode =  regres.http_code;
        res.json(regres);
    }
});

module.exports = app;