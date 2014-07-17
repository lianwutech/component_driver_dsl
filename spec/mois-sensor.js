driver.name('MS35型湿度传感器')
.version('0.1')
.desc('适用于通用空气湿度监测')
.author('david')
.email('david@lianwutech.com');

driver.data_processor(function(raw_data) {
  return {
    data: { 'mois': 65 }
  };
}).return_data({
  "mois": { "type": "integer", "unit": "％" }
});

if (module) { module.exports = driver; }
