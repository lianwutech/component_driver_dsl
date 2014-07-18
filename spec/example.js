driver.name('iRobot型人形机器人')
.version('0.1')
.desc('初代版本')
.author('david')
.email('david@lianwutech.com');

driver.action('move', '移动', function(direction) {
})
.parameter('direction', '移动方向', 'enum', ['东', '南', '西', '北']);

driver.action('stop', '停下', function() {
});

driver.action('set_speed_range', '设置移动速度的范围', function(min, max) {
})
.parameter('min', '最低速度', 'number', {
  unit: 'km',
  min: 0,
  max: 95,
  step: 5
})
.parameter('max', '最高速度', 'number', {
  unit: 'km',
  min: 5,
  max: 100,
  step: 5
});

driver.state('moving', '移动中')
.permit('stop', 'set_speed_range');

driver.state('stopped', '已停止')
.permit('move', 'set_speed_range');

driver.data_processor(function(raw_data) {
  return {
    data: { direction: '东', speed: 12.5, raw: raw_data },
    state: 'moving'
  };
})
.return_data({
  "raw": { "type": "string" },
  "direction": { "type": "string" },
  "speed": { "type": "number", "decimals": 2, "unit": "km" },
});

if (typeof module !== 'undefined') { module.exports = driver; }
