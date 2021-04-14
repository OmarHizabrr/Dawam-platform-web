"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _firebase = _interopRequireDefault(require("firebase"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDkuD1pybozNjFg2yMRQI4grHEjJ-podLQ",
  authDomain: "dawam-cd62b.firebaseapp.com",
  databaseURL: "https://dawam-cd62b-default-rtdb.firebaseio.com",
  projectId: "dawam-cd62b",
  storageBucket: "dawam-cd62b.appspot.com",
  messagingSenderId: "657847978617",
  appId: "1:657847978617:web:e3fc0c622b2ee0036be2a8"
}; // Initialize Firebase

_firebase["default"].initializeApp(firebaseConfig);

var _default = _firebase["default"];
exports["default"] = _default;