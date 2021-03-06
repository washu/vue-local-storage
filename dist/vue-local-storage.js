/**
 * vue-local-storage v0.4.1
 * (c) 2017 Alexander Avakov
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueLocalStorage = factory());
}(this, (function () { 'use strict';

var ls = window.localStorage;

var VueLocalStorage = function VueLocalStorage () {
  this._properties = {};
};

/**
 * Get value from localStorage
 *
 * @param {String} lsKey
 * @param {*} defaultValue
 * @returns {*}
 */
VueLocalStorage.prototype.get = function get (lsKey, defaultValue) {
    var this$1 = this;
    if ( defaultValue === void 0 ) defaultValue = null;

  if (ls[lsKey]) {
    var type = String;

    for (var key in this$1._properties) {
      if (key === lsKey) {
        type = this$1._properties[key].type;
        break
      }
    }

    return this._process(type, ls[lsKey])
  }

  return defaultValue !== null ? defaultValue : null
};

/**
 * Set localStorage value
 *
 * @param {String} lsKey
 * @param {*} value
 * @returns {*}
 */
VueLocalStorage.prototype.set = function set (lsKey, value) {
    var this$1 = this;

  for (var key in this$1._properties) {
    var type = this$1._properties[key].type;

    if ((key === lsKey) && [Array, Object].includes(type)) {
      ls.setItem(lsKey, JSON.stringify(value));

      return value
    }
  }

  ls.setItem(lsKey, value);

  return value
};

/**
 * Remove value from localStorage
 *
 * @param {String} lsKey
 */
VueLocalStorage.prototype.remove = function remove (lsKey) {
  return ls.removeItem(lsKey)
};

/**
 * Add new property to localStorage
 *
 * @param {String} key
 * @param {function} type
 * @param {*} defaultValue
 */
VueLocalStorage.prototype.addProperty = function addProperty (key, type, defaultValue) {
  type = type || String;

  this._properties[key] = { type: type };

  if (!ls[key] && defaultValue !== null) {
    ls.setItem(key, [Array, Object].includes(type) ? JSON.stringify(defaultValue) : defaultValue);
  }
};

/**
 * Process the value before return it from localStorage
 *
 * @param {String} type
 * @param {*} value
 * @returns {*}
 * @private
 */
VueLocalStorage.prototype._process = function _process (type, value) {
  switch (type) {
    case Boolean:
      return value === 'true'
    case Number:
      return parseInt(value, 10)
    case Array:
      try {
        var array = JSON.parse(value);

        return Array.isArray(array) ? array : []
      } catch (e) {
        return []
      }
    case Object:
      try {
        return JSON.parse(value)
      } catch (e) {
        return {}
      }
    default:
      return value
  }
};

var VueLocalStorage$1 = new VueLocalStorage();

var index = {
  /**
   * Install vue-local-storage plugin
   *
   * @param {Vue} Vue
   * @param {Object} options
   */
  install: function (Vue, options) {
    if ( options === void 0 ) options = {};

    if (typeof process !== 'undefined' &&
      (
        process.server ||
        process.SERVER_BUILD ||
        (process.env && process.env.VUE_ENV === 'server')
      )
    ) {
      return
    }

    try {
      var test = '__vue-localstorage-test__';

      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
    } catch (e) {
      console.error('Local storage is not supported');
    }

    var name = options.name || 'localStorage';

    Vue.mixin({
      created: function created () {
        var this$1 = this;

        if (this.$options[name]) {
          Object.keys(this.$options[name]).forEach(function (key) {
            var ref = [this$1.$options[name][key].type, this$1.$options[name][key].default];
            var type = ref[0];
            var defaultValue = ref[1];

            VueLocalStorage$1.addProperty(key, type, defaultValue);
          });
        }
      }
    });

    Vue[name] = VueLocalStorage$1;
    Vue.prototype[("$" + name)] = VueLocalStorage$1;
  }
};

return index;

})));
