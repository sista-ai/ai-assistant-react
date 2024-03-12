"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useVuic = exports.VuicContext = void 0;
var _react = require("react");
var VuicContext = exports.VuicContext = /*#__PURE__*/(0, _react.createContext)(null);
var useVuic = exports.useVuic = function useVuic() {
  return (0, _react.useContext)(VuicContext);
};