"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VuicButton = void 0;
var _react = _interopRequireDefault(require("react"));
var _VuicContext = _interopRequireDefault(require("./VuicContext"));
var _excluded = ["buttonText"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var VuicButton = exports.VuicButton = function VuicButton(_ref) {
  var _ref$buttonText = _ref.buttonText,
    buttonText = _ref$buttonText === void 0 ? 'Record' : _ref$buttonText,
    props = _objectWithoutProperties(_ref, _excluded);
  var vuic = (0, _VuicContext["default"])();
  var handleButtonClick = function handleButtonClick() {
    if (vuic) {
      vuic.startVoiceRecording();
    }
  };
  return /*#__PURE__*/_react["default"].createElement("button", _extends({
    onClick: handleButtonClick
  }, props), buttonText);
};