"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HOST_SERVER_STORAGE = exports.HOST_SERVER_NAME = void 0;
var offline = false;
var server = "";

if (offline) {
  server = "http://dawam.com";
} else {
  server = "https://api.alhikma-ye.com";
}

var HOST_SERVER_NAME = server + '/api/';
exports.HOST_SERVER_NAME = HOST_SERVER_NAME;
var HOST_SERVER_STORAGE = server + '/storage/';
exports.HOST_SERVER_STORAGE = HOST_SERVER_STORAGE;