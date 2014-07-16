driver.name('MS35型湿度传感器')
.version('0.1')
.desc('适用于通用空气湿度监测')
.author('david')
.email('david@lianwutech.com');

driver.data_handler(function(raw_data) {
  return {
    data: { 'mois': 65 }
  };
}).data_format({
  "mois": { "type": "integer", "unit": "％" }
});

if (module) { module.exports = driver; }
