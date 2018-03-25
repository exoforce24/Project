var express = require('express');
var router = express.Router();

const restClient = require('superagent-bluebird-promise');
const path = require('path');
const url = require('url');
const util = require('util');
const Promise = require('bluebird');
const _ = require('lodash');
const querystring = require('querystring');
const securityHelper = require('../lib/security/security');
const crypto = require('crypto');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// ####################
// Setup Configuration
// ####################

// LOADED FRON ENV VARIABLE: public key from MyInfo Consent Platform given to you during onboarding for RSA digital signature
var _publicCertContent = process.env.MYINFO_CONSENTPLATFORM_SIGNATURE_CERT_PUBLIC_CERT;
// LOADED FRON ENV VARIABLE: your private key for RSA digital signature
var _privateKeyContent = process.env.MYINFO_APP_SIGNATURE_CERT_PRIVATE_KEY;
// LOADED FRON ENV VARIABLE: your client_id provided to you during onboarding
var _clientId = process.env.MYINFO_APP_CLIENT_ID;
// LOADED FRON ENV VARIABLE: your client_secret provided to you during onboarding
var _clientSecret = process.env.MYINFO_APP_CLIENT_SECRET;
// redirect URL for your web application
var _redirectUrl =  process.env.MYINFO_APP_REDIRECT_URL;
// default realm for your web application
var _realm = process.env.MYINFO_APP_REALM;

// URLs for MyInfo APIs
var _authLevel = process.env.AUTH_LEVEL;

var _authApiUrl =  process.env.MYINFO_API_AUTHORISE;
var _tokenApiUrl = process.env.MYINFO_API_TOKEN;
var _personApiUrl = process.env.MYINFO_API_PERSON;

var _attributes = "name,sex,race,nationality,dob,email,mobileno,regadd,housingtype,hdbtype,marital,edulevel,assessableincome,hanyupinyinname,aliasname,hanyupinyinaliasname,marriedname,cpfcontributions,cpfbalances";

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/../views/html/index.html'));
});

// callback function - directs back to home page
router.get('/callback', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/../views/html/index.html'));
});

// function for getting environment variables to the frontend
router.get('/getEnv', function(req, res, next) {
	if (_clientId == undefined || _clientId == null)
		res.jsonp({status: "ERROR", msg:"client_id not found"});
	else
		res.jsonp({status: "OK", clientId: _clientId, redirectUrl: _redirectUrl, authApiUrl: _authApiUrl, attributes: _attributes, authLevel: _authLevel});
});

// function for frontend to call backend
router.post('/getPersonData', function(req, res, next) {
	// get variables from frontend
	var code = req.body.code;

	var data;
    var request;
    
    // **** CALL TOKEN API ****
	request = createTokenRequest(code);
    request
        .buffer(true)
        .end(function (callErr, callRes) {
            if (callErr) {
                // ERROR
                res.jsonp({status: "ERROR", msg: callErr});
            } else {
                // SUCCESSFUL
                var data = {body: callRes.body, text: callRes.text};
                console.log("Response from Token API:");
                console.log(JSON.stringify(data.body));

                var accessToken = data.body.access_token;
                if (accessToken == undefined || accessToken == null) {
                    res.jsonp({status: "ERROR", msg: "ACCESS TOKEN NOT FOUND"});
                }

                // everything ok, call person API
                callPersonAPI(accessToken, res);
            }
        });
});
 
function callPersonAPI (accessToken, res) {
	// validate and decode token to get UINFIN
	var decoded = securityHelper.verifyJWS(accessToken, _publicCertContent);
	if (decoded == undefined || decoded == null) {
		res.jsonp({status: "ERROR", msg: "INVALID TOKEN"})
	}

	console.log("Decoded Access Token:");
	console.log(JSON.stringify(decoded));

	var uinfin = decoded.sub;
    if (uinfin == undefined || uinfin == null) {
	    res.jsonp({status: "ERROR", msg: "UINFIN NOT FOUND"});
    } 
	
    // **** CALL PERSON API ****
	var request = createPersonRequest (uinfin, accessToken);
	
	// Invoke asynchronous call
    request
        .buffer(true)
        .end(function (callErr, callRes) {
            if (callErr) {
                res.jsonp({status: "ERROR", msg: callErr});
            } else {
                // SUCCESSFUL
                var data = {body: callRes.body, text: callRes.text};
                console.log("Response from Person API:");
                console.log(JSON.stringify(data.text));
                var personJWS = data.text;
                if (personJWS == undefined || personJWS == null) {
                    res.jsonp({status: "ERROR", msg: "PERSON DATA NOT FOUND"});
                } else {
                    console.log("Person Data (JWS): "+ personJWS);

                    var personData = personJWS;
                    // verify signature & decode JWS to get the JSON
                    personData = securityHelper.verifyJWS(personJWS, _publicCertContent);
                    if (personData == undefined || personData == null)
                        res.jsonp({status: "ERROR", msg: "INVALID DATA OR SIGNATURE FOR PERSON DATA"});
                    personData.uinfin = uinfin; // add the uinfin into the data to display on screen

                    console.log("Person Data (Decoded): "+JSON.stringify(personData));
                    // successful. return data back to frontend
                    res.jsonp({status: "OK", text: personData});
                }
            }
        });
}

// function to prepare request for TOKEN API
function createTokenRequest(code) {
    var cacheCtl = "no-cache";
    var contentType = "application/x-www-form-urlencoded";
    var method = "POST";

    // assemble params for Token API
    var strParams = "grant_type=authorization_code" 
				+ "&code=" + code 
				+ "&redirect_uri=" + _redirectUrl
				+ "&client_id=" + _clientId
				+ "&client_secret=" + _clientSecret
				;
    var params = querystring.parse(strParams);

    
    // assemble headers for Token API
    var strHeaders = "Content-Type=" + contentType + "&Cache-Control=" + cacheCtl;
    var headers = querystring.parse(strHeaders);
    
    // Add Authorisation headers for connecting to API Gateway
    var authHeaders = null;
    if (_authLevel == "L0") {
        // No headers
    } else if (_authLevel == "L2") {
        authHeaders = securityHelper.generateAuthorizationHeader(
            _tokenApiUrl,
            params,
            method,
            contentType,
            _authLevel,
            _clientId,
            _privateKeyContent,
            _clientSecret,
            _realm
        );
    } else {
        throw new Error("Unknown Auth Level");
    }

    if(!_.isEmpty(authHeaders)) {
        _.set(headers, "Authorization", authHeaders);
    }

    console.log("Request Header for Token API: "+JSON.stringify(headers));

    var request = restClient.post(_tokenApiUrl);

    // Set headers
    if(!_.isUndefined(headers) && !_.isEmpty(headers)) 
    	request.set(headers);

    // Set Params
    if(!_.isUndefined(params) && !_.isEmpty(params))
        request.send(params);

	return request;
}

// function to prepare request for PERSON API
function createPersonRequest (uinfin, validToken) {
    var url = _personApiUrl+ "/" + uinfin + "/";
    var cacheCtl = "no-cache";
    var method = "GET";

    // assemble params for Person API
    var strParams = "client_id=" + _clientId
				+ "&attributes=" + _attributes;
    var params = querystring.parse(strParams);

    // assemble headers for Person API
    var strHeaders = "Cache-Control=" + cacheCtl ; 
    var headers = querystring.parse(strHeaders);
    
    // Add Authorisation headers for connecting to API Gateway
    var authHeaders = securityHelper.generateAuthorizationHeader(
    	url, 
    	params, 
    	method, 
    	"", // no content type needed for GET 
    	_authLevel,
    	_clientId,
    	_privateKeyContent,
    	_clientSecret,
    	_realm
    	);

    // NOTE: include access token in Authorization header as "Bearer " (with space behind)
    if(!_.isEmpty(authHeaders)) {
        _.set(headers, "Authorization", authHeaders + ",Bearer " + validToken);
    } else {
        _.set(headers, "Authorization", "Bearer " + validToken);
    }

	// invoke token API
    var request = restClient.get(url);

    // Set headers
    if(!_.isUndefined(headers) && !_.isEmpty(headers)) 
    	request.set(headers);

    // Set Params
    if(!_.isUndefined(params) && !_.isEmpty(params))
        request.query(params);

	return request;
}

module.exports = router;
