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
        self.ctxt = PyV8.JSContext(Global())
        self.locker = PyV8.JSLocker()
        with open('dsl.js', 'r') as dsl_file,\
                open('spec/example.js', 'r') as driver_file:

            print "*************%s PyV8 Begins*************" % self.name
            self.ctxt.enter()
            print "*************%s __init__.locker.enter()*************" % self.name
            self.locker.enter()
            self.ctxt.eval(dsl_file.read(), 'dsl')
            self.ctxt.eval(driver_file.read(), 'driver')
            self.ctxt.eval("var meta_data = driver.validate()", 'validate')
            meta_data = PyV8.convert(self.ctxt.locals.meta_data)
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
            self.ctxt.eval("var devices_dict = %s" % json.dumps(devices_dict))
            self.ctxt.eval("log(10, 'devices_dict = ' + JSON.stringify(devices_dict));")

            print "\nlog:"
            self.ctxt.eval("driver.action('test', 'test', function() { debug('debug msg') });")
            self.ctxt.eval("driver.validate()")
            self.ctxt.eval("driver.translate_action('test')")
            print "*************%s __init__.locker.leave()*************" % self.name
            self.locker.leave()

    def run(self):

            print "*************%s start for real work*************" % self.name
            while True:
                print "*************%s.locker.enter()*************" % self.name
                self.locker.enter()
                print "%s process_data returns:" % self.name
                result = self.ctxt.eval(
                    "var result = driver.process_data('8D4B6F_1', 1101, '2014-07-25 09:41:43', '00');",
                    'process_data')
                print PyV8.convert(self.ctxt.locals.result)

                print "\ntranslate_action:"
                result = self.ctxt.eval("driver.translate_action('move')", 'translate_action')
                print PyV8.convert(result)
                print "*************%s.locker.leave()*************" % self.name
                self.locker.leave()

                print "%s wait for data..........." % self.name
                time.sleep(1)
                print "**************%s PyV8 Ends**************" % self.name

            self.ctxt.leave()

thread1 = ComponentDriver(1, "Thread-1", 1)
thread1.start()

thread2 = ComponentDriver(2, "Thread-2", 2)
thread2.start()

thread3 = ComponentDriver(3, "Thread-3", 3)
thread3.start()
