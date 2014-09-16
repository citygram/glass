$(document).ready(function() {
  app.setup();
});

var app = app || {};

app.setup = function() {
  app.setupMap();
  app.populateEvents('/resource/vw6y-z8j6');
};

app.populateEvents = function(url, params) {
  var oneWeekAgo = (function(date) {
    date.setDate(date.getDate() - 7);
    return date;
  })(new Date());

  var conditions = [
    app.q.notNull('opened'),
    // app.q.greaterThan('opened', oneWeekAgo.toISOString()),
  ];

  var params = {
    '$limit': 100,
    '$order': 'opened DESC',
    '$where': conditions.join(app.q.and),
  };

  $.getJSON(url, params, function(geojson) {
    app.featureLayer.setGeoJSON(geojson);
  });
};

app.setupMap = function() {
  var options = {
    zoom: 13,
    center: [37.7577, -122.4376],
    tileLayer: { detectRetina: true },
  };

  L.mapbox.accessToken = 'pk.eyJ1IjoiY29kZWZvcmFtZXJpY2EiLCJhIjoiSTZlTTZTcyJ9.3aSlHLNzvsTwK-CYfZsG_Q';
  var map = app.map = L.mapbox.map('map', 'codeforamerica.inb9loae', options);
  app.featureLayer = L.mapbox.featureLayer().addTo(map);
};

app.q = {
  and: ' AND ',
  or: ' OR ',
  asc: function(attr) { return attr+' ASC'; },
  desc: function(attr) { return attr+' DESC'; },
  isNull: function(attr) { return attr+' IS NULL'; },
  notNull: function(attr) { return attr+' IS NOT NULL'; },
  greaterThan: function(attr, val) { return attr+' >= '+val; },
  lessThan: function(attr, val) { return attr+' <= '+val },
};
