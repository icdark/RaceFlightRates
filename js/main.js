var rotate_timeout;

$(document).ready(function() {
  render_rates();
  $("input").change(render_rates);
});

function render_rates() {

  $('#chart').remove();
  $('#chartContainer').append('<canvas id="chart" width="400" height="400"></canvas>');

  rcrate = parseFloat($("#rcrate").val());
  rate = parseFloat($("#rate").val()) * 100 * rcrate;
  acro = parseInt($("#acro").val());
  expo = parseInt($("#expo").val());

  lookupPitchRollRC = generatePitchRollCurve(expo);

  var result = calc_rate(rate, acro, 500);
  $("h1").text(result + " deg/s, " + Math.round(result/360.0 * 10.0)/10.0 + " flips/second");

  table = [];
  labels = [];
  for (i = 0; i <= 50; i++) {
    table[i] = calc_rate(rate, acro, i*10);
    labels[i] = i*2 + "%";
  }

  time_for_flip = points2time(table[table.length-1]);
  clearTimeout(rotate_timeout);
  rotation(time_for_flip);

  var data = {
    labels: labels,
    datasets: [
    {
      label: "Calucalted DPS",
      fill: false,
      data: table
    }
    ],
    options: {
      xAxes: [{
        display: false
      }]
    }
  };

  var ctx = $('#chart');
  var myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      xAxes: [{
        display: false
      }],
      onClick: chartClick,
    },
  });
}

function chartClick(e) {
  el = this.getElementAtEvent(e);
  if (el[0]) {
    index = el[0]._index;
    value = el[0]._chart.config.data.datasets[0].data[index];
    rotation(points2time(value));
  }
}

function calc_rate(rate, acro, rc_cmd) {
  tmp2 = parseInt(rc_cmd/20);
  rc_cmd = lookupPitchRollRC[tmp2] + (rc_cmd - tmp2 * 20) * (lookupPitchRollRC[tmp2 + 1] - lookupPitchRollRC[tmp2]) / 20;

  if (acro > 0) {
    wow_factor = (rc_cmd/500.0) * acro/100.0;
    factor = (wow_factor * rc_cmd) + rc_cmd;
    degs = ((rate + 20) * factor) / 50;
  } else {
    degs = (rate + 20) * rc_cmd / 50;
  }
  return Math.round(degs*100)/100;
}

function generatePitchRollCurve(expo)
{
  lookupPitchRollRC = new Array();
  var j = 0.0;
  for (i = 0; i < 31; i++) {
    lookupPitchRollRC[i] = (2500 + expo * (j * j - 25)) * j * 100 / 2500;
    j += 0.2;
  }
  return lookupPitchRollRC;
}

function rotation(duration){
  rotate_timeout = setTimeout( function() {
    $("#rotate img").rotate({
      angle:0,
      animateTo:360,
      callback: rotation,
      duration: duration,
      easing: function(x, t, b, c, d) { return b+(t/d)*c ; },
    });
  }, 1000);
}

function points2time(p) {
  return 1/(p/360) * 1000;
}
