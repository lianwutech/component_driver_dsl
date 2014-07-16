driver.name('TS35型温度传感器')
.version('0.1')
.desc('适用于通用空气温度监测，监测范围[-50~80]摄氏度')
.author('david')
.email('david@lianwutech.com');

driver.data_handler(function(raw_data) {
  return {
    data: { 'temp': 39.5 }
  };
}).data_format({
  "temp": { "type": "number", "decimals": 2, "unit": "°C" }
});

if (module) { module.exports = driver; }
