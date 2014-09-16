$(document).ready(function() {
  app.setup();
});

var app = app || {};

app.setup = function() {
  app.setupMap();
  app.populateEvents('/resource/vw6y-z8j6');
};

app.populateEvents = function(url, params) {
  var conditions = [
    app.q.notNull('opened'),
    app.q.eq('status', 'open'),
    app.q.greaterThan('opened', app.utils.daysAgoISO(2)),
  ];

  var params = {
    '$order': app.q.desc('opened'),
    '$where': app.q.and(conditions),
  };

  $.getJSON(url, params, function(geojson) {
    app.featureLayer.setGeoJSON(geojson).eachLayer(app.bindPopup);
  });
};

app.bindPopup = (function() {
  var popupProperty = _.template("<li><strong><%= name %></strong>: <%= value %></li>");
  var popup = _.template("<ul><%= list.join('') %></ul>");

  return function(layer) {
    var list = _.map(layer.feature.properties, function(value, name) {
      return popupProperty({name: name, value: value});
    });

    layer.bindPopup(popup({list: list}));
  };
})()

app.setupMap = function() {
  var options = {
    zoom: 12,
    center: [37.7577, -122.4376],
    tileLayer: { detectRetina: true },
  };

  L.mapbox.accessToken = 'pk.eyJ1IjoiY29kZWZvcmFtZXJpY2EiLCJhIjoiSTZlTTZTcyJ9.3aSlHLNzvsTwK-CYfZsG_Q';
  var map = app.map = L.mapbox.map('map', 'codeforamerica.inb9loae', options);
  app.featureLayer = L.mapbox.featureLayer().addTo(map);
};

app.utils = {
  daysAgoISO: function(count) {
    var date = (function(d) {
      d.setDate(d.getDate() - count);
      return d;
    })(new Date());

    return date.toISOString();
  },
};

app.q = (function() {
  var quote = function(v) {
    return "'"+v+"'";
  };

  var AND = ' AND ';
  var OR = ' OR ';

  return {
    and: function(conds) {
      return conds.join(AND);
    },
    or: function(conds) {
      return conds.join(OR);
    },
    asc: function(attr) { 
      return attr+' ASC';
    },
    desc: function(attr) {
      return attr+' DESC';
    },
    eq: function(attr, value) {
      return attr+' = '+quote(value);
    },
    isNull: function(attr) {
      return attr+' IS NULL';
    },
    notNull: function(attr) {
      return attr+' IS NOT NULL';
    },
    greaterThan: function(attr, value) {
      return attr+' >= '+quote(value);
    },
    lessThan: function(attr, value) {
      return attr+' <= '+quote(value);
    },
  };
})();
