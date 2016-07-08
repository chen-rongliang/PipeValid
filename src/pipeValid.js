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
    Item.prototype[name] = addChecker(name, validFn);
    return this;
  },

  // pipe.check('age')
  // pipe.check('data.total');
  // TODO 如果可以拓展，用于验证数组，就棒棒的 pipe.check('list[0].name') 或 pipe.check('list[].name')
  check: function(key) {
    return this.validers[key]
      || (this.validers[key] = new Item(key));
  },

  /**
    * 启动验证
    * @param {Object} data，需要验证的数据
    * @param {Array?} restrict，指定哪些数据需要验证
    * @param {Boolean} checkAll，是否需要验证全部数据
    * @return {thenable object} 返回一个带有 then 回调的对象，如果验证内容，没有涉及异步，此对象的回调，将同步执行
   */
  start: function(data, restrict, checkAll) {

    return {
      then: function(resolve, reject) {
        // resolve(true);
        // reject([error1, [error2...]?]);
      }
    };
  },
};
