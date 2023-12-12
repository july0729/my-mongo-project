
#### 1  mac 启动mongodb服务 
brew services start mongodb-community
##### 停止mongodb服务
brew services stop mongodb-community

查看服务启动在哪个端口  一般默认是27017
lsof -iTCP -sTCP:LISTEN | grep mongod

例如:输出
mongod    59913 july    9u  IPv4 0xc2a1f91f6882aa5f      0t0  TCP localhost:27017 (LISTEN)
mongod    59913 july   10u  IPv6 0xc2a1f92439185a67      0t0  TCP localhost:27017 (LISTEN)

#### 2  连接服务器
①在node连接mongodb数据库先安装对应依赖  mongoose
 npm i mongoose
②编辑脚本、运行脚本
 node app.js

``` js
// Mongoose 可以通过Node来操作MongoDB数据库的一个模块
const mongoose = require('mongoose')
//在mongoose中 schma 是一个特定的结构，与js中的object对象最简单的区别是，他有一些内置的默认字段
const connectDb = async () => {
  await mongoose.connect('mongodb://localhost:27017')
}
connectDb()

// 数据库连接成功
mongoose.connection.once('open', () => {
  console.log("数据库连接成功");
})

// 数据库断开
mongoose.connection.once('close', () => {
  console.log("数据库断开");
})
```

#### 使用 mongoose 内置的 schema  创建模型

``` js
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
// 创建模式  类似构造函数
const stuSchema = new Schema({ name:{type:'String',unique:true}})
// 创建模型  
const stuModel = mongoose.model('student', stuSchema)
//  创建实例
 const student1 = new stuModel({ name: 'student1' });

``` 
**文档校验**

【required】：数据必填        new Schema({name:{type:'String',required:true}})
【default】：默认值           new Schema({age:{type:'Number',default:20}})
【min】【max】：最小/大值      new Schema({age:{type:'Number',min:18,max:60}})
【match】：正则匹配           new Schema({age:{type:'Number',match:/01/}})
【enum】：枚举匹配            new Schema({sex:{type:'String',enum:[’男‘，’女‘]}})
【validate】：自定义匹配      new Schema({sex:{type:'String',validate:valfn}})    //valfn必须返回true |false

#### methods和statics、query、virtuals
```js
const kittySchma = new mongoose.Schema({name: String, type: String}, {
  // 添加方法1 通过实例.方法名（）调用

  methods: {  //是添加到文档的实例方法
    speak() {
      console.log('miao~~');
    }
  },
  statics: {  //是添加到模型的静态方法
    staticFn() {
      console.log('staticFn~~~');
    }
  }，
  query: { //在查询上添加方法。
    byName(name) {
      return this.where({name: new RegExp(name, 'i')});  //i 表示不区分大小写
    }
  }，
   virtuals: {  //主要用途是创建计算属性。
    fullname: {
      get() {
        return 'full' + this.name;
      }, 
      set(newname) {
        return this.name = newname
      }
    }
  }
})

// 2创建模型
const KittyModel = mongoose.model('kittenModel', kittySchma)
// 3创建实例
const kitty = new KittyModel({name: 'tom'})

kitty.speak()           //用实例调用
KittyModel.staticFn()   //用model调用

//在查询上调用方法
KittyModel.find().byName('tom').then((res) => {
  console.log('res: ', res);
})

kitty.fullname = 'abc'
console.log(kitty.fullname);

```

methods是添加到文档的实例方法，这意味着你可以在一个特定的文档实例上调用这些方法
statics是添加到模型的静态方法，这意味着你可以在模型上，而不是在文档实例上调用这些方法
query是添加到查询（Query）的自定义方法，这意味着你可以在一个查询上调用这些方法
virtuals不会被保存到MongoDB数据库中，但可以用于计算和设置模型的其他属性。

#### alias 别名
```js
const childSchema = new Schema({
  n: {
    type: String,
    alias: 'name'    //n的别名是name
  }
}, { _id: false });

const parentSchema = new Schema({
  c: childSchema,
  name: {
    f: {
      type: String,
      alias: 'name.first'   //如果是嵌套结构  那么alias得写成：父级.别名
    }
  }
});

```

#### options

```JS
new Schema({ /* ... */ }, options);

```

#### 操作符
可以在查询条件中使用

| 比较操作符           | 逻辑操作符  | 元素操作符          |数组操作符               |字符串操作符           |
| :---------------:  | :--------:| :-----------------:|:---------------------:| :------------------:|
| $eq：等于           | $or：逻辑或 | $exists：字段是否存在|$all：匹配数组中所有的值  | $regex：正则表达式匹配 | 
| $ne：不等于         | $and：逻辑与| $type：字段类型      |$elemMatch：匹配数组满足条件的|                 |
| $gt：大于           | $not：逻辑非 |                   |$size：匹配数组的长度        |                 |
| $gte：大于或等于     | $nor：既不也不|                   |                          |                 |
| $lt：小于           |              |                   |                         |                 |
| $lte：小于或等于     |              |                   |                         |                 |
| $in：在指定的数组中   |              |                   |                         |                 |
| $nin：不在指定的数组中 |             |                   |                         |                 |

```js
stuModel.deleteOne({age: { $gt: 20 } })  //删除年龄大于20的

```
#### 简单查询  --增删改查
下述的方法的返回类型均为promise 可以通过async await 或者then、catch接受和捕获

##### 【增】creact 和save 的区别
create  创建并立即保存到数据库中
save   保存到数据库

```js
//创建并立即保存到数据库中
// 直接在模型上调用
stuModel.create({ name: 'July', age: '20',addr: 'china'}).then((res) => {
  console.log('创建成功:', res);
})

// save  通过模型的实例调用
const student = new stuModel({ name: 'July',age: '20',ddr: 'china'})
student.save().then((res) => {
console.log('保存成功: ', res);
})
```
##### 【删】 deleteOne 和 deleteMany
  stuModel.deleteOne({条件})           //移除第一个匹配到的
  stuModel.deleteMany({条件})          //移除所有满足匹配条件的

```js
stuModel.deleteOne({name: 'July'}).then((res) => {
  // console.log('移除成功:', res);     res: {acknowledged: true, deletedCount: 1}   
}).catch((err) => {
  console.log('移除失败:', err);
})
```

##### 【改-更新】 updateOne 和 updateMany
  stuModel.updateOne(条件, 更新的内容)   //更新第一个匹配到的
  stuModel.updateMany(条件, 更新的内容)  //更新所有满足匹配的 
```js
stuModel.updateOne({name: 'July'}, {name: 'Tom'})
stuModel.updateMany({name:{ $eq: 'July' }},{name: 'Tom'}).then(res=> {
    console.log("查询结果", docs); 
    //res { acknowledged: true, modifiedCount: 1, upsertedId: null, upsertedCount: 0, matchedCount: 1}
  }).catch(err => {
    console.error(err);
  });
```

##### 【改-替换】 replaceOne 和 replaceMany
stuModel.replaceOne(条件, 完全替换为的内容)     //替换第一个匹配到的
stuModel.replaceMany (条件, 完全替换为的内容)   //替换所有满足匹配的 

```js
stuModel.replaceMany({ age: { $lt: 20 } }, { age: 20 }).then(res => {
    console.log('替换成功:', res);
  })
 
```
update和replace的区别
如果只是更新某个字段其他字段不做变化   则使用updateOne/updateMany
如果想替换整个文档，没被重新声明的字段会被删除   则使用 replaceOne/replaceMany


##### 【查】find、findOne、findById
find(条件)    // 没有匹配将返回[]  什么都不写 就是查所有
findOne(条件)  //没有匹配将返回null
findById(id)    //没有匹配将返回null

```js
stuModel.find().then(docs => {   
  console.log("查询结果", docs);
})

stuModel.findOne({ name: 'July' }).then(doc => {
    console.log('查询结果:', doc);
  })

stuModel.findById('5f8d04f7c8aabc3a048b4567').then(doc => {
    console.log('查询结果:', doc);
  })
```

#### 聚合操作
聚合操作将来自多个文档的值合并在一起，并且可以对分组数据执行各种操作后返回
**三种聚合方法**
聚合管道
map-reduce function 
单一目的的聚合方法

##### 聚合管道
**一些常用的聚合管道(Aggregation Pipeline)**
>> \$match：过滤数据，只输出符合条件的文档。
>> \$group：将数据按指定的字段分组，然后进行某种统计，如求和、平均、计数等。
>> \$sort：将数据排序。
>> \$limit：限制聚合管道返回的文档数。
>> \$lookup：实现左连接，可以将其他集合的文档合并到当前的文档中。

```js
stuModel.aggregate([
  //匹配年龄大于18的
  {$match: {age: {$gt: 18}}},  
  //按照name字段来分组  total: {$sum: 1} 计算累加值  和js中total+=1 意思相同
  {$group: {_id: '$name', total: {$sum: 1}}}, 
   //按照降序排序  -1 降序  1升序
  {$sort: {total: -1}}   
]) 
.then(res => {
    console.log('聚合结果:', res);  
    //res : [ { _id: 'Tom', total: 1 }, { _id: 'July', total: 1 } ]
  })

```

##### map-reduce function 





