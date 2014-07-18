from pyv8 import PyV8

driver = open('lib/dsl.js', 'r').read()
example = open('spec/example.js', 'r').read()
ctxt = PyV8.JSContext()
ctxt.enter()
ctxt.eval(driver)
ctxt.eval(example)
result = ctxt.eval("var result = driver.process_data(\"A4B83290DE\");");
print ctxt.locals.result.data.direction
print ctxt.locals.result.data.speed
print ctxt.locals.result.state
