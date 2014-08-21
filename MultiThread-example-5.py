# -*- coding:utf-8 -*-
from pyv8 import PyV8
import json
import threading
import time


class Global(PyV8.JSClass):
    def log(self, level, msg):
        print "level %d: %s" % (level, msg)


def runner(name):
    locker = PyV8.JSLocker()
    locker.enter()
    ctxt = PyV8.JSContext(Global())
    locker.leave()
    with open('dsl.js', 'r') as dsl_file,\
            open('spec/example.js', 'r') as driver_file:

        while True:
            locker.enter()
            ctxt.enter()
            print "*************%s PyV8 Begins*************" % name
            ctxt.eval(dsl_file.read(), 'dsl')
            ctxt.eval(driver_file.read(), 'driver')
            ctxt.eval("var meta_data = driver.validate()", 'validate')
            devices_dict = {'343dsadfas': {'device_type': 'adsfas'}}
            ctxt.eval("var devices_dict = %s" % json.dumps(devices_dict))
            ctxt.eval("log(10, 'devices_dict = ' + JSON.stringify(devices_dict));")

            print "*************%s start for real work*************" % name
            print '\n***************' + name
            print "process_data returns:"
            result = ctxt.eval(
                "var result = driver.process_data('8D4B6F_1', 1101, '2014-07-25 09:41:43', '00');",
                'process_data')
            print PyV8.convert(ctxt.locals.result)

            print "\ntranslate_action:"
            result = ctxt.eval("driver.translate_action('move')", 'translate_action')
            print PyV8.convert(result)

            with PyV8.JSUnlocker():
                print "%s wait for data..........." % name
                time.sleep(1)
            ctxt.leave()
            locker.leave()
        print "**************%s PyV8 Ends**************" % name


class ComponentDriver (threading.Thread):
    def __init__(self, threadID, name, counter):
        threading.Thread.__init__(self)
        self.name = name

    def run(self):
        runner(self.name)

thread1 = ComponentDriver(1, "Thread-1", 1)
thread2 = ComponentDriver(2, "Thread-2", 2)
thread3 = ComponentDriver(3, "Thread-3", 3)

thread1.start()
thread2.start()
thread3.start()
runner("Main")
