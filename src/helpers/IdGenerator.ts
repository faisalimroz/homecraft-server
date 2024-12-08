export const generateSixDigitId = () => {
    const timestamp = Date.now();
    const sixDigitId = timestamp % 1000000;
    const sixDigitIdString = sixDigitId.toString().padStart(6, '0');
    return sixDigitIdString;
  }
