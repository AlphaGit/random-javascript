function getHourTemplate(hour, minute, colorSpec) {
  var rgb = "rgb(" + colorSpec.red + ", " + colorSpec.green + ", " + colorSpec.blue + ")";
  var timeText = hour + ":" + (minute || "00");

  var html = '<div style="background-color: ' + rgb + ';">';
  html += '<p>'
  html += timeText;
  html += ' [' + colorSpec.red + ', ' + colorSpec.green + ', ' + colorSpec.blue + '] ('+ Math.round(colorSpec.temperature*1000)/1000 +'K)';
  html += '</p></div>';

  return html;
}

function getPixelTemplate(colorSpec) {
  var rgb = "rgb(" + colorSpec.red + ", " + colorSpec.green + ", " + colorSpec.blue + ")";
  var html = '<div style="background-color: ' + rgb + ';" class="pixel"></div>';
  return html;
}

function clearCurrentDisplay() {
  var allDisplayedElements = document.querySelectorAll('div');
  for (var i = 0; i < allDisplayedElements.length; i++) {
    var el = allDisplayedElements[i];
    el.remove();
  }
}

function show15MinuteIntervals() {
  clearCurrentDisplay();
  var body = document.querySelector('body');

  for (var hour = 3; hour < 21; hour++) {
    for (var minute = 0; minute < 60; minute += 15) {
      var secondsSinceMidnight = 60 * minute + 3600 * hour;
      var color = colorForTime(secondsSinceMidnight);
      
      var template = getHourTemplate(hour, minute, color);
      var templateElement = parseOutermostElementFromTemplate(template);
      body.appendChild(templateElement);
    }
  }  
}

function goToDemoPage() {
  window.location.href = 'demo.html';
}

function show1MinuteIntervals() {
  clearCurrentDisplay();
  var body = document.querySelector('body');

  for (var hour = 0; hour < 24; hour++) {
    for (var minute = 0; minute < 60; minute++) {
      var secondsSinceMidnight = 60 * minute + 3600 * hour;
      var color = colorForTime(secondsSinceMidnight);

      var template = getPixelTemplate(color);
      var templateElement = parseOutermostElementFromTemplate(template);
      body.appendChild(templateElement);
    }
  }
}

function attachEvents() {
  var btnShow15MinuteIntervals = document.getElementById('btnShow15MinuteIntervals');
  var btnShow1MinuteIntervals = document.getElementById('btnShow1MinuteIntervals');
  var btnSeeItInAction = document.getElementById('btnSeeItInAction');

  btnShow15MinuteIntervals.addEventListener('click', show15MinuteIntervals);
  btnShow1MinuteIntervals.addEventListener('click', show1MinuteIntervals);
  btnSeeItInAction.addEventListener('click', goToDemoPage);
}

function parseOutermostElementFromTemplate(str) {
  var tmpDoc = document.implementation.createHTMLDocument();
  tmpDoc.body.innerHTML = str;
  return tmpDoc.body.children[0];
}

ready(attachEvents);
ready(show15MinuteIntervals)