driver.name('MS35型湿度传感器')
.version('0.0.1')
.desc('适用于通用空气湿度监测')
.author('david')
.email('david@lianwutech.com')
.protocol('standard');

driver.data_processor(function(device_id, device_type, timestamp, raw_data) {
  return {
    data: { 'mois': 65 }
  };
}).data({
  "mois": { "name": "湿度", "type": "number", "unit": "％" }
});
