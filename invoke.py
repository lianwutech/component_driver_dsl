from pyv8 import PyV8

driver = open('lib/dsl.js', 'r').read()
example = open('spec/example.js', 'r').read()
ctxt = PyV8.JSContext()
ctxt.enter()
ctxt.eval(driver)
ctxt.eval(example)
result = ctxt.eval("var result = driver.process_data(\"A4B83290DE\");");
print "raw = " + ctxt.locals.result.data.raw
print "direction = " + ctxt.locals.result.data.direction
print "speed = %f" % ctxt.locals.result.data.speed
print "state = " + ctxt.locals.result.state
