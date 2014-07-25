describe("meta data", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    log = function(level, msg) { };
    spyOn(global, 'log');
    DSL = require('../dsl.js');
    driver = new DSL();
  });
  it("should check if driver name supplied", function() {
    var errMsg ='Driver name() is required';
    expect(driver).toHaveError(errMsg);
    driver.name("驱动名称");
    expect(driver).toHaveField('name');
    expect(driver).not.toHaveError(errMsg);
  });
  it("should check if driver desc supplied", function() {
    var errMsg ='Driver desc() is required';
    expect(driver).toHaveError(errMsg);
    driver.desc("驱动描述");
    expect(driver).toHaveField('desc');
    expect(driver).not.toHaveError(errMsg);
  });
  it("should check if driver version supplied", function() {
    var errMsg ='Driver version() is required';
    expect(driver).toHaveError(errMsg);
    driver.version("0.0.1");
    expect(driver).toHaveField('version');
    expect(driver).not.toHaveError(errMsg);
  });
  it("should check driver version format", function() {
    driver.version("这不是一个合法的版本号");
    expect(driver).not.toHaveField('version');
    expect(driver).toHaveError('Driver version is malformed');
  });
  it("should check if driver author supplied", function() {
    var errMsg ='Driver author() is required';
    expect(driver).toHaveError(errMsg);
    driver.author("邓大卫");
    expect(driver).toHaveField('author');
    expect(driver).not.toHaveError(errMsg);
  });
  it("should check if author\'s email supplied", function() {
    var errMsg ='Driver email() is required';
    expect(driver).toHaveError(errMsg);
    driver.email("david@lianwutech.com");
    expect(driver).toHaveField('email');
    expect(driver).not.toHaveError(errMsg);
  });
  it("should check email address format", function() {
    driver.email("这不是一个Email地址");
    expect(driver).not.toHaveField('email');
    expect(driver).toHaveError('Driver email is malformed');
  });
  it("meta data setter can be chained", function() {
    driver.name('DJ390型电磁阀')
    .version('0.0.1')
    .desc('宇宙第一好的驱动，但是有8个BUG')
    .author("邓大卫")
    .email("david@lianwutech.com");
    expect(driver).toHaveField('name');
    expect(driver).toHaveField('version');
    expect(driver).toHaveField('desc');
    expect(driver).toHaveField('author');
    expect(driver).toHaveField('email');
  });
});
