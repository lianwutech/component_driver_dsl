try:
    from pyv8 import PyV8
except ImportError:
    import PyV8
import json


class Global(PyV8.JSClass):
    def log(self, level, msg):
        print "level %d: %s" % (level, msg)
ctxt = PyV8.JSContext(Global())
ctxt.enter()
driver = open('dsl.js', 'r').read()
ctxt.eval(driver)
example = open('spec/example.js', 'r').read()
ctxt.eval(example)

ctxt.eval("var meta_data = driver.validate()")
meta_data = PyV8.convert(ctxt.locals.meta_data)
print "meta data:"
print meta_data["fields"]
print "errors:"
print meta_data.get("errors")
print "actions:"
print meta_data["actions"]
print "states:"
print meta_data["states"]
print "data fields:"
print meta_data["data_fields"]

print "init:"
devices_dict = {'343dsadfas': {'device_type': 'adsfas'}}
ctxt.eval("var devices_dict = %s" % json.dumps(devices_dict))
ctxt.eval("log(10, JSON.stringify(devices_dict));")

print "fetch_data:"
ctxt.eval("var result = driver.fetch_data();")
print PyV8.convert(ctxt.locals.result)

print "process_data:"
ctxt.eval("var result = driver.process_data('8D4B6F_1', 1101, '2014-07-25 09:41:43', '00');")
print PyV8.convert(ctxt.locals.result)

print "translate_action:"
result = ctxt.eval("driver.translate_action('move')")
print PyV8.convert(result)

print "log:"
ctxt.eval("driver.action('test', 'test', function() { debug('debug msg') });")
ctxt.eval("driver.validate()")
result = ctxt.eval("driver.translate_action('test')")
