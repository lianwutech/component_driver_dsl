class Action
  constructor: ->

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
    required_fields.forEach (field) =>
      @field_given[field] = false
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
    if typeof(desc) != 'string' || desc.length == 0
      this.addError "Please provide description for action #{name}"
    else if  typeof(fn) != 'function'
      this.addError "Please provide function body for action #{name}"
    else
      @actions[name] = {
        desc: desc
        func: fn
      }
    this

  getResult: ->
    field_errors = []
    for own field, given of @field_given
      if !given
        field_errors .push "Driver #{field}() is required"
    return {
      fields: @fields
      errors: field_errors.concat(@errors)
      actions: @actions
    }
module.exports = ComponentDriverDSL;
