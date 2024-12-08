"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSixDigitId = void 0;
const generateSixDigitId = () => {
    const timestamp = Date.now();
    const sixDigitId = timestamp % 1000000;
    const sixDigitIdString = sixDigitId.toString().padStart(6, '0');
    return sixDigitIdString;
};
exports.generateSixDigitId = generateSixDigitId;
