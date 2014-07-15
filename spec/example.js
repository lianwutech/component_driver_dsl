driver.name('DJ390型电磁阀')
.version('0.1')
.desc('宇宙第一好的驱动，但是有8个BUG')
.author('david')
.email('david@lianwutech.com')
.data_handler(function(raw_data) {
  return decoded_data;
})
.get_state(function() {
  // ...
  return computed_state;
});

driver.action('open', '打开水阀', function() {
});

driver.action('close', '关闭水阀', function() {
});

driver.action('set_threshold', '设置上下限', function(min, max) {
})
.parameter('min', 'XX下限', 'number', {
    min: 0,
    max: 95,
    step: 5
  })
.parameter('max', 'XX上限', 'number', {
  min: 5,
  max: 100,
  step: 5
});

driver.action('set_emotion', '设置表情', function(emotion) {
})
.parameter('emotion', '表情', 'enum', ['笑', '哭']
);

driver.state('open', '已打开')
.permit('close', 'set_threshold', 'set_emotion');

driver.state('closed', '已关闭')
.permit('open', 'set_threshold', 'set_emotion');

if (module) { module.exports = driver; }
