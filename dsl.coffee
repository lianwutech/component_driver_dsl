CRITICAL = 50
ERROR = 40
WARNING = 30
INFO = 20
DEBUG = 10

if !log? then log = () ->
critical = (msg) -> log(CRITICAL, msg)
error = (msg) -> log(ERROR, msg)
warning = (msg) -> log(WARNING, msg)
info = (msg) -> log(INFO, msg)
debug = (msg) -> log(DEBUG, msg)

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
        options: options,
        sequence: @parameter_names.indexOf(name)
      }

    return this

  validate: ->
    all_errors = [].concat @errors
    for name, index in @parameter_names
      if !@parameters[name]?
        all_errors.push "Parameter '#{name}' not defined for action '#{@name}'"
    retval = { parameters: @parameters }
    if all_errors.length > 0 then retval.errors = all_errors

    return retval

class RawDataProcessor
  constructor: (@fn)->
    @states = {}
    @errors = []

  process: (device_id, device_type, timestamp, raw_data) ->
    @fn(device_id, device_type, timestamp, raw_data)

  data: (@data_format) ->
    @will_return_data = true
    this

  state: (name, desc, permitted_actions) ->
    if typeof(name) != 'string' || name.trim().length == 0 ||
       typeof(desc) != 'string' || desc.trim().length == 0 ||
       !Array.isArray(permitted_actions) || permitted_actions.length == 0
      @errors.push "Please call state(name, desc, permitted_actions)"
    else
      @states[name] = {name: name, desc: desc, permitted_actions: permitted_actions}

    @will_return_state = true
    this

  validate: ->
    retval = {}
    checkType = (item)=>
        switch item.type
          when "number"
            if typeof(item.unit) != 'string' || item.unit.trim().length == 0
              @errors.push "data type 'number' should have unit"
            else
              if !item.decimals? then item.decimals = 0
              if typeof(item.decimals) != 'number' ||
                    item.decimals % 1 != 0 ||
                    !(0 <= item.decimals <= 9)
                @errors.push "decimals of data type 'number' should within range [0..9]"
          when "boolean"
            if typeof(item["true"]) != 'string' || item["true"].trim().length == 0 ||
               typeof(item["false"]) != 'string' || item["false"].trim().length == 0
              @errors.push "should specify meaning for 'true' and 'false' of boolean type"
          when "string"
            null
          else
            @errors.push "allowed return data types are 'number', 'string' and 'boolean'"

    if !@will_return_data && !@will_return_state
      @errors.push "data_processor should have data() or state(), or both"
    else
      if @will_return_data
        retval.will_return_data = true
        retval.data_format = @data_format
      for own key, item of @data_format
        if typeof(item.name) != 'string' || item.name.trim().length == 0
          @errors.push "returned data '#{key}' should have name"
        else if typeof(item.type) != 'string' || item.type.trim().length == 0
          @errors.push "returned data '#{key}' should have type"
        else checkType(item)
      retval.will_return_state = !!@will_return_state
    retval.states = @states
    if @errors.length > 0 then retval.errors = @errors
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

  translate_action: (name, parameters) ->
    action = @actions[name]
    if !action?
      error "Action #{name} doesn't exist"
    else
      real_params = []
      for param_name, value of parameters
        param = action.parameters[param_name]
        if param? then real_params[param.sequence] = value
      result = action.fn.apply(null, real_params)

      result_array = []
      if typeIsArray(result)
        for item in result
          if 'device_id' not in item.keys() ||
             'ctrl_msg' not in item.keys()
            error "action '#{name}' should return array of {device_id, ctrl_msg}"
          else
            result_array.push(item)
      else if typeof(result) == 'string'
        for device_id of devices_dict
          result_array.push({device_id: device_id, ctrl_msg: result})
      else
        error "action '#{name}' should return array or string"

      result_array

  data_processor: (fn) ->

    arrayEquals = (s, o) ->
      return true if s is o
      return false if s.length isnt o.length
      for i in [0..s.length]
        return false if s[i] isnt o[i]
      true

    required_params = ['device_id', 'device_type', 'timestamp', 'raw_data']
    params = getParamNames(fn)
    if (arrayEquals(params, required_params))
      @raw_data_processor = new RawDataProcessor(fn)
    else
      error "data_processor should have exactly 4 parameters: #{required_params}"

  validate: ->
    all_errors = [].concat @errors

    for own field, given of @field_given
      if !given
        all_errors.push "Driver #{field}() is required"

    valid_actions = {}
    for own name, action of @actions
      action = action.validate()
      if action.errors?
        all_errors = all_errors.concat(action.errors)
      else
        valid_actions[name]= action

    retval = {
      fields: @fields
      actions: valid_actions
    }

    if !@raw_data_processor?
      all_errors.push "data_processor() not provided"
    else
      processor = @raw_data_processor.validate()
      if processor.errors
        all_errors = all_errors.concat(processor.errors)

      valid_states = {}
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
      for own name, state of processor.states
        valid_states[name] = state if isValidState(name, state)

      retval.data_processor = processor
      retval.states = valid_states

    if all_errors.length > 0
      retval.errors = all_errors
      for err in all_errors
        error err
    return retval

  process_data: (device_id, device_type, timestamp, raw_data) ->
    @raw_data_processor.process(device_id, device_type, timestamp, raw_data)

if module?
  module.exports = ComponentDriverDSL;
else
  driver = new ComponentDriverDSL();
