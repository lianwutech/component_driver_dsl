from pyv8 import PyV8
import json

driver = open('lib/dsl.js', 'r').read()
example = open('spec/example.js', 'r').read()
ctxt = PyV8.JSContext()
ctxt.enter()
ctxt.eval(driver)
ctxt.eval(example)
ctxt.eval("var meta_data = JSON.stringify(driver.getResult())")

meta_data = json.loads(ctxt.locals.meta_data)
print "meta data:"
print meta_data["fields"]
print "errors:"
print meta_data["errors"]
print "actions:"
print meta_data["actions"]
print "states:"
print meta_data["states"]

result = ctxt.eval("JSON.stringify(driver.process_data(\"A4B83290DE\"));")
print json.loads(result)

result = ctxt.action("driver.execute('move')")
print result
