# ref http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
ARGUMENT_NAMES = /([^\s,]+)/g;
getParamNames = (func) ->
  fnStr = func.toString().replace(STRIP_COMMENTS, '')
  result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  result = [] if !result?
  return result

typeIsArray = Array.isArray ||
(value) -> return {}.toString.call( value ) is '[object Array]'

class Action
  constructor: (@name, @desc, @fn)->
    @errors = []
    @parameters = {}
    @parameter_names = getParamNames(@fn)

  parameter: (name, desc, type, options)->
    checkType = =>
      switch type
        when 'string' then return true
        when 'number'
          return true if options? and
                         typeof(options['min']) == 'number' and
                         typeof(options['max']) == 'number' and
                         typeof(options['step']) == 'number'
          @errors.push "Options 'min', 'max' and 'step' required for number parameter"
          return false
        when 'enum'
          return true if options? and typeIsArray(options) and options.length > 0
          @errors.push "Option 'enum' required for enum parameter"
          return false
        else 
          @errors.push "Valid parameter type: 'string', 'number', 'enum'"
          return false

    if name not in @parameter_names
      @errors.push "Action '#{@name}' has no parameter '#{name}'"
    else if !desc? || desc.trim() == ''
      @errors.push "Please call parameter(name, desc, type, options)"
    else if !type? || type.trim() == ''
      @errors.push "Please call parameter(name, desc, type, options)"
    else if checkType()
      @parameters[name] = {
        desc: desc
        type: type
        options: options
      }

    return this

  validate: ->
    all_errors = [].concat @errors
    for name in @parameter_names
      if !@parameters[name]?
        all_errors.push "Parameter '#{name}' not defined for action '#{@name}'"

    return {
      parameters: @parameters
      errors: all_errors
    }

class State
  constructor: ->
    @permitted_actions = []

  permit: ->
    for action in arguments
      @permitted_actions.push(action)
    return this

class RawDataProcessor
  constructor: (@fn)->

  process: (raw_data) ->
    @fn(raw_data)

  data: (@data_format) ->
    @will_return_data = true
    this

  state: ->
    @will_return_state = true
    this

  validate: ->
    errors = []
    retval = {}
    checkType = (item)=>
        switch item.type
          when "number"
            if typeof(item.unit) != 'string' || item.unit.trim().length == 0
              errors.push "data type 'number' should have unit"
            else
              if !item.decimals? then item.decimals = 0
              if typeof(item.decimals) != 'number' ||
                    item.decimals % 1 != 0 ||
                    !(0 <= item.decimals <= 9)
                errors.push "decimals of data type 'number' should within range [0..9]"
          when "boolean"
            if typeof(item["true"]) != 'string' || item["true"].trim().length == 0 ||
               typeof(item["false"]) != 'string' || item["false"].trim().length == 0
              errors.push "should specify meaning for 'true' and 'false' of boolean type"
          when "string"
            null
          else
            errors.push "allowed return data types are 'number', 'string' and 'boolean'"

    if !@will_return_data && !@will_return_state
      errors.push "data_processor should data() or state(), or both"
    else
      if @will_return_data
        retval.will_return_data = true
        retval.data_format = @data_format
      for own key, item of @data_format
        if typeof(item.name) != 'string' || item.name.trim().length == 0
          errors.push "returned data '#{key}' should have name"
        else if typeof(item.type) != 'string' || item.type.trim().length == 0
          errors.push "returned data '#{key}' should have type"
        else checkType(item)
      retval.will_return_state = !!@will_return_state
    retval.errors = errors
    return retval;

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
    @field_given.name = true
    @fields.name = str
    this

  desc: (str) ->
    @field_given.desc = true
    @fields.desc = str
    this

  version: (str) ->
    @field_given.version = true
    FORMAT = /^\d\.\d\.\d$/
    if str.match FORMAT
      @fields.version = str
    else
      this.addError 'Driver version is malformed'
    this

  author: (str) ->
    @field_given.author = true
    @fields.author = str
    this

  email: (str) ->
    @field_given.email = true
    FORMAT = ///
      [\w\.]+
      @
      [\w]+
      \.
      [a-zA-Z]+
    ///
    if str.match FORMAT
      @fields.email = str
    else
      this.addError 'Driver email is malformed'
    this

  action: (name, desc, fn) ->
    if typeof(name) != 'string' || name.trim().length == 0 ||
       typeof(desc) != 'string' || desc.trim().length == 0 ||
       typeof(fn) != 'function'
      this.addError "Please call action(name, desc, fn)"
    else
      @actions[name] = new Action(name, desc, fn)

  state: (name, desc) ->
    if typeof(name) != 'string' || name.trim().length == 0 ||
       typeof(desc) != 'string' || desc.trim().length == 0
      this.addError "Please call state(name, desc)"
    else
      @states[name] = new State(name, desc)

  execute: (name, parameters...) ->
    @actions[name].fn(parameters)

  data_processor: (fn) ->
    @raw_data_processor = new RawDataProcessor(fn)

  validate: ->
    all_errors = [].concat @errors
    valid_actions = {}
    valid_states = {}

    for own field, given of @field_given
      if !given
        all_errors.push "Driver #{field}() is required"

    for own name, action of @actions
      action = action.validate()
      if action.errors.length > 0
        all_errors = all_errors.concat(action.errors)
      else
        valid_actions[name]= action

    isValidState = (name, state)=>
      if state.permitted_actions.length == 0
        all_errors.push "State '#{name}' has no permitted action"
        return false
      else
        for action in state.permitted_actions
          if  !valid_actions[action]?
            all_errors.push "State '#{name}': can\'t permit nonexist action '#{action}'"
            return false
      return true

    for own name, state of @states
      valid_states[name] = state if isValidState(name, state)

    retval = {
      fields: @fields
      actions: valid_actions
      states: valid_states
    }

    if !@raw_data_processor?
      all_errors.push "data_processor() not provided"
    else
      processor = @raw_data_processor.validate()
      if  processor.errors.length > 0
        all_errors = all_errors.concat(processor.errors)
      else
        retval.data_processor = processor

    retval.errors = all_errors
    return retval

  process_data: (hex_raw_data) ->
    @raw_data_processor.process(hex_raw_data)

if module?
  module.exports = ComponentDriverDSL;
else
  driver = new ComponentDriverDSL();
