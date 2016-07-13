'use strict';
function noop() {
  // nothing
}

function isEmptyObject(obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      return false;
    }
  }
  return true;
}

function toArray(obj) {
  return [].slice.call(obj, 0);
}

function keys(obj, callback) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      callback.call(obj, obj[key], key);
    }
  }
}

function forEach(arr, callback) {
  for (var i = 0, max = arr.length; i < max; i++) {
    callback.call(arr, arr[i], i);
  }
}

function recurList(list, options) {
  options = options || {};
  var next = options.next || noop;
  var callback = options.callback || noop;

  if (list && list.length > 0) {
    var item = list.shift();
    next(item, function again() {
      recurList(list, options);
    });
  } else {
    callback();
  }
}