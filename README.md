component_driver_dsl
==============
The DSL for writing a component driver, see `spec/example.js` for details.

# Try PyV8 example
```sh
virtualenv venv
. venv/bin/activate
# for Max OS
pip install git+http://github.com/brokenseal/PyV8-OS-X#egg=pyv8
# for Linux
pip install -r requirements.txt
python PyV8-example.py
```

# Development
the DSL itself doesn't depend on 3rd library, but Node.JS is required to run tests.
```sh
npm install -g gulp
npm install
gulp test
```
