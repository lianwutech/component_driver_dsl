driver.name('TS35型温度传感器')
.version('0.0.1')
.desc('适用于通用空气温度监测，监测范围[-50~80]摄氏度')
.author('david')
.email("david@lianwutech.com")
.protocol("modbus");

driver.data_processor(function(device_id, device_type, component_id, timestamp, raw_data) {
  return {
    data: { 'temp': 39.5 }
  };
}).data({
  "temp": { "name": "温度", "type": "number", "decimals": 2, "unit": "°C" }
});
