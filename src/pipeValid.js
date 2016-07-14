'use strict';
// TODO pipe.check('data.total'), 如果 data.total 字段不存在，但是我们的验证机制，是不存在，就不验证啊
//    或者，认为需要提供一个开关，去控制这种点的表达式，需要需要去验证下去
// var pipe = new PipeValid();
// pipe.check('age');
function PipeValid() {
  this.validers = {};
}

PipeValid.prototype = {
  /**
    * 自定义一个验证函数
    * @param {String} name 验证函数名字
    * @param {Function} validFn 验证函数
   */
  define: function(name, validFn) {
    checkers[name] = validFn;
    Item.prototype[name] = addChecker(name, validFn);
    return this;
  },

  // pipe.check('age')
  // pipe.check('data.total');
  // TODO 如果可以拓展，用于验证数组，就棒棒的 pipe.check('list[0].name') 或 pipe.check('list[].name')
  check: function(key) {
    var valider = this.validers[key]
      || (this.validers[key] = new Item(key));
    valider.end();
    return valider;
  },

  /**
    * 启动验证
    * @param {Object} data，需要验证的数据
    * @param {Array?} restrict，指定哪些数据需要验证
    * @param {Boolean} checkAll，是否需要验证全部数据
    * @return {thenable object} 返回一个带有 then 回调的对象，如果验证内容，没有涉及异步，此对象的回调，将同步执行
   */
  start: function(data, restrict, isCheckAll) {
    if (!isArray(restrict)) {
      isCheckAll = restrict;
      restrict = [];
    }

    var validers = this.validers;
    var validList = [];
    keys(validers, function(key, val) {
      if (key in data) {
        validList.push({ key: key, value: data[key] });
      }
    });

    var thenable = new Thenable();

    this._checkAll(validList, function callback(error) {
      thenable.pass = !error;
      if (error) {
        if (isCheckAll) {
          thenable.error = error;
        } else {
          thenable.error = error.error;
          thenable.key = error.key;
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
        var valider = self.validers[key];
        valider.start(value, function callback(error) {
          if (error) {
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
  }
};
