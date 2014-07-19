from pyv8 import PyV8
import json

ctxt = PyV8.JSContext()
ctxt.enter()
driver = open('lib/dsl.js', 'r').read()
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

print "process_data:"
result = ctxt.eval("JSON.stringify(driver.process_data(\"A4B83290DE\"));")
print json.loads(result)

print "translate_action:"
result = ctxt.eval("driver.translate_action('move')")
print result
