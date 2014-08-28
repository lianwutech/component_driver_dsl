/*
组件驱动程序撰写模板
*/

driver.name('新的组件类型') // 会用作组件类型名称，不能与别的组件驱动重复
.desc('初代版本') // 任意文字，用于对该驱动的具体描述
.version('0.0.1') // 驱动版本，按照语义化版本标准(http://semver.org/lang/zh-CN/)，任何改动都必须增加版本号
.author('david')
.email('david@lianwutech.com')
.protocol('standard'); // 与插件配合，以确定参数

/*
组件可以做的操作
*/

driver.action('move', '移动', function(direction) {
  return "MOVE";
})
// 对应于函数的参数，类型只能是enum, string和number
.parameter('direction', '移动方向', 'enum', ['东', '南', '西', '北']);

// 当然，操作也可以没有参数
driver.action('stop', '停下', function() {
  return "STOP";
});

driver.action('set_speed_range', '设置移动速度的范围', function(min, max) {
  return "SET_SPEED_RANGE";
})
// number类型的参数，必须加上以下四个类型说明
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

// 如果设备不会自动上报数据，可以指定data_fetcher，定期去取，返回发往插件的命令即可
// 有data_fetcher的组件，可以设置fetch_interval
driver.data_fetcher(function() { return '49ED'; });

// 设备上报的数据，经过该函数翻译。翻译结果作为组件数据保存
driver.data_processor(function(device_id, device_type, timestamp, raw_data) {
  if (typeof devices_dict[device_id] === Undefined) {
    error("no device_id " + device_id + " found");
  }
  return {
    data: { direction: '东', speed: 12.5, raw: raw_data },
    state: 'moving'
  };
})
.data({
  "raw": { "name": "原始数据", "type": "string" },
  "direction": { "name": "方向", "type": "string" },
  "speed": { "name": "速度", "type": "number", "decimals": 2, "unit": "km" },
})
.state('moving', '移动中', ['stop', 'set_speed_range'])
.state('stopped', '已停止', ['move', 'set_speed_range']);
