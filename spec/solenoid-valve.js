driver.name('SV35型电磁阀')
.version('0.0.1')
.desc('适用于各类液体管路的自动开关控制')
.author('david')
.email("david@lianwutech.com")
.protocol("modbus");

driver.action('open', '打开阀门', function() {
  this.state = 'open';
});

driver.action('close', '关闭阀门', function() {
  this.state = 'close';
});

driver.state('open', '已打开').permit('close');

driver.state('closed', '已关闭').permit('open');

driver.data_processor(function(device_id, device_type, component_id, timestamp, raw_data) {
  return {
    state: this.state
  };
});
