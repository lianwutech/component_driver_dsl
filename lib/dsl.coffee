STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
ARGUMENT_NAMES = /([^\s,]+)/g;
getParamNames = (func) ->
  fnStr = func.toString().replace(STRIP_COMMENTS, '')
  result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  result = [] if !result?
  return result

class Action
 constructor: (@name, @desc, @fn)->
    @errors = []
    @parameters = {}
    @parameter_names = getParamNames(@fn)

  parameter: (name, desc, type, options)->
    checkType = =>
      switch type
        when 'string' then return true
        when 'integer'
          return true if options? and 
                         typeof(options['min']) == 'integer' and
                         typeof(options['max']) == 'integer' and
                         typeof(options['step']) == 'integer'
          @errors.push "Options 'min', 'max' and 'step' required for integer parameter"
          return false
        when 'enum'
          return true if options? and options['enum']? and
                         options['enum'].isArray() and
                         options['enum'].length > 0
          @errors.push "Option 'enum' required for enum parameter"
          return false
        else 
          @errors.push "Valid parameter type: 'string', 'integer', 'enum'"
          return false

    if name not in @parameter_names
      @errors.push "Action '#{@name}' has no parameter '#{name}'"
    else if !desc? || desc.trim() == ''
      @errors.push "Please call parameter(name, desc, type, options)"
    else if !type?
      @errors.push "Please call parameter(name, desc, type, options)"
    else if checkType()
      @parameters[name] = {
        desc: desc
        type: type
        options: options
      }

    return this

  getResult: ->
    all_errors = [].concat @errors
    for name in @parameter_names
      if name not in @parameters
        all_errors.push "Parameter '#{name}' not defined"

    return {
      parameters: @parameters
      errors: all_errors
    }

class State
  constructor: ->

class ComponentDriverDSL
  required_fields = [
    'name'
    'version'
    'desc'
    'author'
    'email'
  ]

  constructor: ->
    @field_given = {}
    @field_given[field] = false for field in required_fields
    @fields = {}
    @actions = {}
    @states = {}
    @errors = []

  addError:  (msg) ->
    @errors.push(msg);

  name: (str) ->
    @fields.name = str
    @field_given.name = true
    this

  desc: (str) ->
    @fields.desc = str
    @field_given.desc = true
    this

  version: (str) ->
    FORMAT = /\d\.\d/
    if str.match FORMAT
      @fields.version = str
      @field_given.version = true
    else
      this.addError 'Driver version is malformed'
    this

  author: (str) ->
    @fields.author = str
    @field_given.author = true
    this

  email: (str) ->
    FORMAT = ///
    [\w\.]+
    @
    [\w]+
    \.
    [a-zA-Z]+
    ///
    if str.match FORMAT
      @fields.email = str
      @field_given.email = true
    else
      this.addError 'Driver email is malformed'
    this

  action: (name, desc, fn) ->
    if typeof(name) != 'string' || name.length == 0 ||
       typeof(desc) != 'string' || desc.length == 0 ||
       typeof(fn) != 'function'
      this.addError "Please call action(name, desc, fn)"
    else
      @actions[name] = new Action(name, desc, fn)

  getResult: ->
    all_errors = [].concat @errors
    valid_actions = {}

    for own field, given of @field_given
      if !given
        all_errors.push "Driver #{field}() is required"

    for own name, action of @actions
      action = action.getResult()
      if action.errors.length > 0
        all_errors = all_errors.concat(action.errors)
      else
        valid_actions[name]= @actions[name]

    return {
      fields: @fields
      errors: all_errors.concat(@errors)
      actions: valid_actions
    }

if module?
  module.exports = ComponentDriverDSL;
