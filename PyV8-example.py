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

ctxt.eval("var meta_data = JSON.stringify(driver.validate())")
meta_data = json.loads(ctxt.locals.meta_data)
print "meta data:"
print meta_data["fields"]
print "errors:"
print meta_data.get("errors")
print "actions:"
print meta_data["actions"]
print "states:"
print meta_data["states"]

print "init:"
devices_dict = {'343dsadfas': {'device_type': 'adsfas'}}
ctxt.eval("var devices_dict = %s" % json.dumps(devices_dict))
ctxt.eval("log(10, JSON.stringify(devices_dict));")

print "process_data:"
result = ctxt.eval("var result = JSON.stringify(driver.process_data('8D4B6F_1', 1101, '2014-07-25 09:41:43', '00'));")
print json.loads(ctxt.locals.result)

print "translate_action:"
result = ctxt.eval("driver.translate_action('move')")
print result

print "log:"
ctxt.eval("driver.action('test', 'test', function() { debug('debug msg') });")
ctxt.eval("JSON.stringify(driver.validate())")
result = ctxt.eval("driver.translate_action('test')")
