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

  return { red: Math.round(red), blue: Math.round(blue), green: Math.round(green), temperature: kelvinTemperature };
}

var thousandKColor = rgbFromTemperature(1000);
function colorForTime(secondsSinceMidnight) {
  var hundredsOfSeconds = secondsSinceMidnight / 100;

  var temperatureRanges = [
    { fromTime: 0   /* 12 AM */, toTime: 180 /*  5 AM */, fromTemp: 0    , toTemp: 1    , fadeToR: 0    , fadeToG: 0   , fadeToB: 0    },
    { fromTime: 180 /*  5 AM */, toTime: 216 /*  6 AM */, fromTemp: 1    , toTemp: 3000 , fadeToR: 0    , fadeToG: 0   , fadeToB: 0    },
    { fromTime: 216 /*  6 AM */, toTime: 324 /*  9 AM */, fromTemp: 3000 , toTemp: 30000, fadeToR: null , fadeToG: null, fadeToB: null },
    { fromTime: 324 /*  9 AM */, toTime: 432 /* 12 PM */, fromTemp: 30000, toTemp: 40000, fadeToR: null , fadeToG: null, fadeToB: null },
    { fromTime: 432 /* 12 PM */, toTime: 612 /*  5 PM */, fromTemp: 40000, toTemp: 30000, fadeToR: null , fadeToG: null, fadeToB: null },
    { fromTime: 612 /*  5 PM */, toTime: 648 /*  6 PM */, fromTemp: 30000, toTemp: 3000 , fadeToR: null , fadeToG: null, fadeToB: null },
    { fromTime: 648 /*  6 PM */, toTime: 720 /*  8 PM */, fromTemp: 3000 , toTemp: 1    , fadeToR: 0    , fadeToG: 0   , fadeToB: 0    },
    { fromTime: 720 /*  8 PM */, toTime: 864 /* 12 AM */, fromTemp: 1    , toTemp: 0    , fadeToR: 0    , fadeToG: 0   , fadeToB: 0    }
  ];

  var i = 0;

  do {
    var tempRange = temperatureRanges[i++];
    if (tempRange.fromTime <= hundredsOfSeconds && hundredsOfSeconds <= tempRange.toTime)
      break;
  } while (i < temperatureRanges.length);

  // my middle school math notes, hehe...
  //       250
  // 216 ----- 324
  // 1000 ---- 30000
  //        temp
  // tempDiff = (30000 - 1000) = 29000
  // timeDiff = (324 - 216) = 108
  // actualTimeDiff = (250 - 216) = 34
  // 108...29000
  // 34... ?
  // tempOffset = 34*29000 / 108 = 9129k
  // finalTemp = tempOffset + 1000

  var tempDiff = tempRange.toTemp - tempRange.fromTemp;
  var timeDiff = tempRange.toTime - tempRange.fromTime;
  var actualTimeDiff = hundredsOfSeconds - tempRange.fromTime;
  var tempOffset = actualTimeDiff * tempDiff / timeDiff;
  var temperatureInKelvin = tempOffset + tempRange.fromTemp;

  var currentTemperatureColor = rgbFromTemperature(temperatureInKelvin);
  if (tempRange.fadeToR == null && tempRange.fadeToG == null && tempRange.fadeToB == null) {
    return currentTemperatureColor;
  } else {
    var maxTempForRange = Math.max(tempRange.fromTemp, tempRange.toTemp);
    // TODO mix considering fadeToR, fadeToG, fadeToB
    return {
      red: Math.round(currentTemperatureColor.red * (temperatureInKelvin / maxTempForRange)),
      green: Math.round(currentTemperatureColor.green * (temperatureInKelvin / maxTempForRange)),
      blue: Math.round(currentTemperatureColor.blue * (temperatureInKelvin / maxTempForRange)),
      temperature: temperatureInKelvin
    };
  }
}

// TODO remove
for (var hour = 4; hour < 21; hour++) {
  for (var minute = 0; minute < 60; minute += 15) {
    var secondsSinceMidnight = 60 * minute + 3600 * hour;
    var color = colorForTime(secondsSinceMidnight);
    var rgb = "rgb(" + color.red + ", " + color.green + ", " + color.blue + ")";
    document.write('<p style="background-color: ' + rgb + ';">Time: ' + hour + ":" + (minute || "00") + " [" + color.red + ", " + color.green + ", " + color.blue + "] ("+ color.temperature +"K)</p>");
  }
}