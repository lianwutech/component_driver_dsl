try:
    from pyv8 import PyV8
except ImportError:
    import PyV8
import json


class Global(PyV8.JSClass):
    def log(self, level, msg):
        print "level %d: %s" % (level, msg)

contexts = []
for i in range(3):
    contexts.append(PyV8.JSContext(Global()))
for ctxt in contexts:
    ctxt.enter()
    driver = open('dsl.js', 'r').read()
    ctxt.eval(driver)
    example = open('spec/example.js', 'r').read()
    ctxt.eval(example)
    ctxt.leave()

for i in range(3):
    contexts[i].enter()
    print "init:"
    devices_dict = {str(i): {'device_type': 'adsfas'}}
    contexts[i].eval("var devices_dict = %s" % json.dumps(devices_dict))
    contexts[i].eval("log(10, JSON.stringify(devices_dict));")
    contexts[i].leave()

for i in range(3):
    contexts[i].enter()
    print "fetch_data:"
    print PyV8.convert(contexts[i].eval("driver.fetch_data();"))

    for j in range(3):
        print "process_data:"
        print PyV8.convert(contexts[j].eval("driver.process_data('" + str(j) + "', 1101, '2014-07-25 09:41:43', '" + str(i*100 + j) + "');"))

        print "translate_action:"
        result = contexts[j].eval("driver.translate_action('move')")
        print PyV8.convert(result)
    contexts[i].leave()
