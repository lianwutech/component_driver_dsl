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
    @errors = {}
    required_fields.forEach (field) =>
      @errors[field] = true
    @fields = {}
    @actions = []
    @states = {}
  name: (str) ->
    @fields.name = str
    @errors.name = false
    this

  action: (name, desc, fn) ->
    @actions.push(arguments);
    this

module.exports = ComponentDriverDSL;
