# -*- coding:utf-8 -*-
from pyv8 import PyV8
import json
import threading
import time


class Global(PyV8.JSClass):
    def log(self, level, msg):
        print "level %d: %s" % (level, msg)


class ComponentDriver (threading.Thread):
    def __init__(self, threadID, name, counter):
        threading.Thread.__init__(self)
        self.name = name

    def run(self):
        mydata = threading.local()
        mydata.locker = PyV8.JSLocker()
        mydata.locker.enter()
        mydata.ctxt = PyV8.JSContext(Global())
        mydata.ctxt.enter()
        mydata.unlocker = PyV8.JSUnlocker()

        with open('dsl.js', 'r') as dsl_file,\
                open('spec/example.js', 'r') as driver_file:

            print "*************%s PyV8 Begins*************" % self.name
            mydata.ctxt.eval(dsl_file.read(), 'dsl')
            mydata.ctxt.eval(driver_file.read(), 'driver')
            mydata.ctxt.eval("var meta_data = driver.validate()", 'validate')
            meta_data = PyV8.convert(mydata.ctxt.locals.meta_data)
            print "meta data:"
            print meta_data["fields"]["name"]
            print meta_data["fields"]["version"]
            print "\nerrors:"
            print meta_data.get("errors")
            print "\nactions:"
            print meta_data["actions"]
            print "\nstates:"
            print meta_data["states"]

            devices_dict = {'343dsadfas': {'device_type': 'adsfas'}}
            mydata.ctxt.eval("var devices_dict = %s" % json.dumps(devices_dict))
            mydata.ctxt.eval("log(10, 'devices_dict = ' + JSON.stringify(devices_dict));")

            print "\nlog:"
            mydata.ctxt.eval("driver.action('test', 'test', function() { debug('debug msg') });")
            mydata.ctxt.eval("driver.validate()")
            mydata.ctxt.eval("driver.translate_action('test')")
            print "*************%s __init__.locker.leave()*************" % self.name

            print "*************%s start for real work*************" % self.name
            while True:
                print "*************%s.locker.enter()*************" % self.name
                print "%s process_data returns:" % self.name
                result = mydata.ctxt.eval(
                    "var result = driver.process_data('8D4B6F_1', 1101, 1, '2014-07-25 09:41:43', '00');",
                    'process_data')
                print PyV8.convert(mydata.ctxt.locals.result)

                print "\ntranslate_action:"
                result = mydata.ctxt.eval("driver.translate_action('move')", 'translate_action')
                print PyV8.convert(result)
                print "*************%s.locker.leave()*************" % self.name

                print "%s wait for data..........." % self.name
                mydata.unlocker.enter()
                time.sleep(1)
                mydata.unlocker.leave()

            mydata.ctxt.leave()
            mydata.locker.leave()
            print "**************%s PyV8 Ends**************" % self.name

thread1 = ComponentDriver(1, "Thread-1", 1)
thread1.start()

thread2 = ComponentDriver(2, "Thread-2", 2)
thread2.start()

thread3 = ComponentDriver(3, "Thread-3", 3)
thread3.start()
