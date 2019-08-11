/**
 * Created by msarabia on 6/28/16.
 */
var _ = require('lodash');
var includeAll = require('include-all');

module.exports = function (options, cb) {
  options.replaceVals = options.replaceVals || '';

  // Excluide system directories
  if (!options.excludeDirs) {
    options.excludeDirs = /^\.(git|svn)$/;
  }

  var files = includeAll(options);

  var dictionary= {};

  // Iterate through each module in the set
  _.each(files, function(module, filename) {

    // Build the result object by merging all of the target modules
    // Note: Each module must export an object in order for this to work
    // (e.g. for building a configuration object from a set of config files)
    if (options.aggregate) {

      // Check that source module is a valid object
      if ( !_.isPlainObject(module) ) {
        return cb(new Error('Invalid module:' + module));
      }

      // Merge module into dictionary
      _.merge(dictionary, module);

      return;
    }

    // Keyname is how the module will be identified in the returned module tree
    var keyName = filename;

    // If a module is found but marked as `undefined`,
    // don't actually include it (since it's probably unusable)
    if (typeof module === 'undefined') {
      return;
    }

    // Unless the `identity` option is explicitly disabled,
    // (or `dontLoad` is set)
    if (!options.dontLoad && options.identity !== false) {

      // If no `identity` property is specified in module, infer it from the filename
      if (!module.identity) {
        if (options.replaceExpr) {
          module.identity = filename.replace(options.replaceExpr, options.replaceVal);
        }
        else module.identity = filename;
      }

      // globalId is the name of the variable for this module
      // that will be exposed globally in Sails unless configured otherwise

      // Generate `globalId` using the original value of module.identity
      if (!module.globalId) {module.globalId = module.identity;}

      // `identity` is the all-lowercase version
      module.identity = module.identity.toLowerCase();

      // Use the identity for the key name
      keyName = options.useGlobalIdForKeyName ? module.globalId : module.identity;
    }

    // Save the module's contents in our dictionary object
    // (this will actually just be `true` if the `dontLoad` option is set)
    dictionary[keyName] = module;
  });

  dictionary = dictionary || {};


  return dictionary;

};



