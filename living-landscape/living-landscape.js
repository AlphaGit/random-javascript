function rgbFromTemperature(kelvinTemperature) {
  // copied from https://github.com/neilbartlett/color-temperature/

  var temperature = kelvinTemperature / 100.0;
  var red, green, blue;

  /* Calculate red */
  if (temperature < 66.0) {
    red = 255;
  } else {
    // a + b x + c Log[x] /.
    // {a -> 351.97690566805693`,
    // b -> 0.114206453784165`,
    // c -> -40.25366309332127
    //x -> (kelvin/100) - 55}
    red = temperature - 55.0;
    red = 351.97690566805693+ 0.114206453784165 * red - 40.25366309332127 * Math.log(red);
    if (red < 0) red = 0;
    if (red > 255) red = 255;
  }

  /* Calculate green */
  if (temperature < 66.0) {
    // a + b x + c Log[x] /.
    // {a -> -155.25485562709179`,
    // b -> -0.44596950469579133`,
    // c -> 104.49216199393888`,
    // x -> (kelvin/100) - 2}
    green = temperature - 2;
    green = -155.25485562709179 - 0.44596950469579133 * green + 104.49216199393888 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  } else {
    // a + b x + c Log[x] /.
    // {a -> 325.4494125711974`,
    // b -> 0.07943456536662342`,
    // c -> -28.0852963507957`,
    // x -> (kelvin/100) - 50}
    green = temperature - 50.0;
    green = 325.4494125711974 + 0.07943456536662342 * green - 28.0852963507957 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  }

  /* Calculate blue */
  if (temperature >= 66.0) {
    blue = 255;
  } else {
    if (temperature <= 20.0) {
      blue = 0;
    } else {
      // a + b x + c Log[x] /.
      // {a -> -254.76935184120902`,
      // b -> 0.8274096064007395`,
      // c -> 115.67994401066147`,
      // x -> kelvin/100 - 10}
      blue = temperature - 10;
      blue = -254.76935184120902 + 0.8274096064007395 * blue + 115.67994401066147 * Math.log(blue);
      if (blue < 0) blue = 0;
      if (blue > 255) blue = 255;
    }
  }

  return { red: Math.round(red) || 0, blue: Math.round(blue) || 0, green: Math.round(green) || 0, temperature: kelvinTemperature };
}

var mixWith_replaceWithBlack = { red: 0   , green: 0   , blue: 0   , method: 'replace'                                                            };
var mixWith_blackIntoRed     = { red: 226 , green: 65  , blue: 0   , method: 'noTempLinear', initialRed: 0  , initialGreen: 0  , initialBlue: 0   };
var mixWith_fadeIntoPurple   = { red: 80  , green: 0   , blue: 100 , method: 'fadeIn'                                                             };
var mixWith_purpleToBlack    = { red: 0   , green: 0   , blue: 0   , method: 'noTempLinear', initialRed: 80 , initialGreen: 0  , initialBlue: 100 };

var temperatureRanges = [
  { fromTime: 0   /* 12 AM */, toTime: 180 /*  5 AM */, fromTemp: 0    , toTemp: 1    , mixWith: mixWith_replaceWithBlack },
  { fromTime: 180 /*  5 AM */, toTime: 216 /*  6 AM */, fromTemp: 1    , toTemp: 3000 , mixWith: mixWith_blackIntoRed     },
  { fromTime: 216 /*  6 AM */, toTime: 324 /*  9 AM */, fromTemp: 3000 , toTemp: 30000, mixWith: null                     },
  { fromTime: 324 /*  9 AM */, toTime: 432 /* 12 PM */, fromTemp: 30000, toTemp: 40000, mixWith: null                     },
  { fromTime: 432 /* 12 PM */, toTime: 612 /*  5 PM */, fromTemp: 40000, toTemp: 30000, mixWith: null                     },
  { fromTime: 612 /*  5 PM */, toTime: 648 /*  6 PM */, fromTemp: 30000, toTemp: 20000, mixWith: mixWith_fadeIntoPurple   },
  { fromTime: 648 /*  6 PM */, toTime: 720 /*  8 PM */, fromTemp: 1000 , toTemp: 3000 , mixWith: mixWith_purpleToBlack    },
  { fromTime: 720 /*  8 PM */, toTime: 864 /* 12 AM */, fromTemp: 1    , toTemp: 0    , mixWith: mixWith_replaceWithBlack }
];

function findTemperatureRangeForTime(hundredsOfSecondsSinceMidnight) {
  var i = 0;

  var tempRange;
  do {
    tempRange = temperatureRanges[i];
    if (tempRange.fromTime <= hundredsOfSecondsSinceMidnight && hundredsOfSecondsSinceMidnight <= tempRange.toTime)
      break;
    i++;
  } while (i < temperatureRanges.length);

  return (i < temperatureRanges.length) ? tempRange : null;
}

function calculateProportionalTemperatureForRange(tempRange, hundredsOfSecondsSinceMidnight) {
  // my middle school math notes, hehe...
  //       250
  // 216 ----- 324
  // 1000 ---- 30000
  //        temp
  // tempDiff = (30000 - 1000) = 29000
  // timeDiff = (324 - 216) = 108
  // actualTimeDiff = (250 - 216) = 34
  // 108...29000
  // 34... ? --> tempOffset
  // tempOffset = 34*29000 / 108 = 9129k
  // finalTemp = tempOffset + 1000

  var tempDiff = tempRange.toTemp - tempRange.fromTemp;
  var timeDiff = tempRange.toTime - tempRange.fromTime;
  var actualTimeDiff = hundredsOfSecondsSinceMidnight - tempRange.fromTime;
  var tempOffset = actualTimeDiff * tempDiff / timeDiff;
  return tempOffset + tempRange.fromTemp; 
}

function weightedAverage(firstValue, secondValue, indexFromFirstToSecond) {
  return Math.round(firstValue * (1 - indexFromFirstToSecond) + secondValue * indexFromFirstToSecond);
}

function colorForTime(secondsSinceMidnight) {
  var hundredsOfSeconds = secondsSinceMidnight / 100;

  var tempRange = findTemperatureRangeForTime(hundredsOfSeconds);
  var currentTemperature = calculateProportionalTemperatureForRange(tempRange, hundredsOfSeconds);

  var currentTemperatureColor = rgbFromTemperature(currentTemperature);
  if (tempRange.mixWith == null) {
    return currentTemperatureColor;
  }

  switch(tempRange.mixWith.method) {
    case 'replace': 
      return {
        red: tempRange.mixWith.red,
        green: tempRange.mixWith.green,
        blue: tempRange.mixWith.blue,
        temperature: currentTemperature
      };
    case 'fadeIn':
      // 0 to 1: closest to 1 => closest to final temp
      var closenessToFinalTemp = (currentTemperature - tempRange.fromTemp) / (tempRange.toTemp - tempRange.fromTemp);

      var mixedRed = weightedAverage(currentTemperatureColor.red, tempRange.mixWith.red, closenessToFinalTemp);
      var mixedGreen = weightedAverage(currentTemperatureColor.green, tempRange.mixWith.green, closenessToFinalTemp);
      var mixedBlue = weightedAverage(currentTemperatureColor.blue, tempRange.mixWith.blue, closenessToFinalTemp);

      return {
        red: tempRange.mixWith.red == null ? currentTemperatureColor.red : mixedRed,
        green: tempRange.mixWith.green == null ? currentTemperatureColor.green : mixedGreen,
        blue: tempRange.mixWith.blue == null ? currentTemperatureColor.blue : mixedBlue,
        temperature: currentTemperature
      };
    case 'fadeOut':
      // 0 to 1: closest to 1 => closest to initial temp
      var closenessToInitialTemp = (currentTemperature - tempRange.fromTemp) / (tempRange.toTemp - tempRange.fromTemp);

      var mixedRed = weightedAverage(tempRange.mixWith.red, currentTemperatureColor.red, closenessToInitialTemp);
      var mixedGreen = weightedAverage(tempRange.mixWith.green, currentTemperatureColor.green, closenessToInitialTemp);
      var mixedBlue = weightedAverage(tempRange.mixWith.blue, currentTemperatureColor.blue, closenessToInitialTemp);

      return {
        red: tempRange.mixWith.red == null ? currentTemperatureColor.red : mixedRed,
        green: tempRange.mixWith.green == null ? currentTemperatureColor.green : mixedGreen,
        blue: tempRange.mixWith.blue == null ? currentTemperatureColor.blue : mixedBlue,
        temperature: currentTemperature
      };      
    case 'average':
      var mixedRed = weightedAverage(tempRange.mixWith.red, currentTemperatureColor.red, 0.5);
      var mixedGreen = weightedAverage(tempRange.mixWith.green, currentTemperatureColor.green, 0.5);
      var mixedBlue = weightedAverage(tempRange.mixWith.blue, currentTemperatureColor.blue, 0.5);

      return {
        red: tempRange.mixWith.red == null ? currentTemperatureColor.red : mixedRed,
        green: tempRange.mixWith.green == null ? currentTemperatureColor.green : mixedGreen,
        blue: tempRange.mixWith.blue == null ? currentTemperatureColor.blue : mixedBlue,
        temperature: currentTemperature
      };
    case 'noTempLinear':
      var closenessToFinalTime = (hundredsOfSeconds - tempRange.fromTime) / (tempRange.toTime - tempRange.fromTime);

      var mixedRed = weightedAverage(tempRange.mixWith.initialRed, tempRange.mixWith.red, closenessToFinalTime);
      var mixedGreen = weightedAverage(tempRange.mixWith.initialGreen, tempRange.mixWith.green, closenessToFinalTime);
      var mixedBlue = weightedAverage(tempRange.mixWith.initialBlue, tempRange.mixWith.blue, closenessToFinalTime);

      return {
        red: mixedRed,
        green: mixedGreen,
        blue: mixedBlue,
        temperature: null
      };
  }
}
