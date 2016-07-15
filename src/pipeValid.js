'use strict';
function PipeValid() {
  this.validers = {};
}

PipeValid.prototype = {
  define: function(key, fn) {
    PipeValid.define(key, fn);
    return this;
  },

  // pipe.check('age')
  // pipe.check('data.total');
  check: function(key) {
    if (isObject(key)) {
      return this.rule(key);
    } else {
      var valider = this.validers[key]
        || (this.validers[key] = new Item(this));
      valider.end();
      return valider;
    }
  },

  rule: function(obj) {
    var self = this;
    // args = ['min', 2, '最少两位']
    var addToChecker = function(checker, args) {
      checker[args[0]].apply(checker, args.slice(1));
    };

    keys(obj, function(key, arr) {
      if (isArray(arr)) {
        var checker = self.check(key);
        checker._reset();

        if (isArray(arr[0])) {
          forEach(arr, function(args) {
            addToChecker(checker, args);
          });
        } else {
          addToChecker(checker, arr);
        }
      }
    });

    return this;
  },

  /**
    * 启动验证
    * @param {Object} data，需要验证的数据
    * @param {Array?} restrict，指定哪些数据需要验证
    * @param {Boolean} isCheckAll，是否需要验证全部数据
    * @return {thenable object} 返回一个带有 then 回调的对象，如果验证内容，没有涉及异步，此对象的回调，将同步执行
   */
  start: function(data, restrict, isCheckAll) {
    data = data || {};

    if (!isArray(restrict)) {
      isCheckAll = restrict;
      restrict = [];
    }

    var thenable = new Thenable();
    var validList = this._obtainValidList(data, restrict);

    this._checkAll(validList, function callback(error) {
      thenable.pass = !error;
      if (error) {
        if (isCheckAll) {
          thenable.error = error;
        } else {
          extend(thenable, error);
        }
        thenable.reject(error);
      } else {
        thenable.resolve();
      }
    }, isCheckAll);

    return thenable;
  },

  _checkAll(validList, endFn, isCheckAll) {
    var self = this;
    var errorList = [];

    recurList(validList, {
      next: function(item, next) {
        var key = item.key;
        var value = item.value;
        var index = item.index;
        var valider = self.validers[key];

        valider.start(value, function callback(error) {
          if (error) {
            error.index = index;
            if (isCheckAll) {
              errorList.push(error);
              next();
            } else {
              endFn.call(self, error);
            }
          } else {
            next();
          }
        });
      },

      callback: function() {
        endFn.call(self, errorList.length > 0 ? errorList : false);
      }
    });
  },

  _obtainValidList(data, restrict) {
    var self = this;
    var validers = this.validers;
    var validList = [];
    var addToList = function(list) {
      validList.push.apply(validList, list);
    };

    if (restrict.length > 0) {
      forEach(restrict, function(key) {
        if (validers[key]) {
          addToList(self._explainAttrToList(data, key, false));
        }
      });
    } else {
      keys(validers, function(key, val) {
        addToList(self._explainAttrToList(data, key, true));
      });
    }

    return validList;
  },

  _explainAttrToList: function(data, key, ignorEmpty) {
    var list = [];
    forEach(compileToAttr(data, key), function(item, index) {
      var itemAdded = { key: key, value: item.value, index: index };
      if (item.nonexist) {
        if (!ignorEmpty) {
          list.push(itemAdded);
        }
      } else {
        list.push(itemAdded);
      }
    });
    return list;
  }
};

/**
  * 自定义一个验证函数
  * @param {String} name 验证函数名字
  * @param {Function} validFn 验证函数
 */
PipeValid.define = function(name, validFn) {
  Item.prototype[name] = addChecker(name, validFn);
};
