driver_checker
==============
The DSL for writing a component driver, see `spec/example.js` for details.

# Try PyV8 example
```sh
virtualenv venv
. venv/bin/activate
pip install -r requirements.txt
python invoke.py
```

# Development
the DSL itself doesn't depend on 3rd library, but Node.JS is required to run tests.
```sh
npm install -g gulp
npm install
gulp test
```
