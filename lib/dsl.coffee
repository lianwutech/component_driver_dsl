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
    @actions = []
    @states = {}

  name: (str) ->
    @fields.name = str
    @field_given.name = true

  desc: (str) ->
    @fields.desc = str
    @field_given.desc = true

  version: (str) ->
    FORMAT = /v\d\.\d/
    if str.match(FORMAT)
      @fields.version = str
      @field_given.version = true
    else
      addError 'Driver version is malformed'

  author: (str) ->
    @fields.author = str
    @field_given.author = true

  email: (str) ->
    FORMAT = ///
    [\w\.]+
    @
    [\w]+
    \.
    [a-zA-Z]+
    ///
    if str.match(FORMAT)
      @fields.email = str
      @field_given.email = true
    else
      addError 'Driver author\'s email is malformed'

  action: (name, desc, fn) ->
    @actions.push(arguments);
    this

module.exports = ComponentDriverDSL;
