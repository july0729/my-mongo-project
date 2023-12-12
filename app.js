// Mongoose 可以通过Node来操作MongoDB数据库的一个模块
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

//在mongoose中 schma 是一个特定的结构，与js中的object对象最简单的区别是，他有一些内置的默认字段
// mongoose.connect(str,连接选项)   
// mongoose推荐选项 用于消除一些废弃的MongoDB驱动程序的警告。{ useNewUrlParser: true, useUnifiedTopology: true }
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

//创建 schema对象
const stuSchema = new Schema({
  name: {type: String, unique: true},
  age: Number,
  gender: {
    type: String,
    default: 'male'
  },
  addr: String
})

const stuModel = mongoose.model('student', stuSchema)

// //保存到数据库
// const student = new stuModel({
//   name: 'July',
//   age: '20',
//   addr: 'china'
// })
// student.save().then((res) => {
//   console.log('保存成功: ', res);
// })

//向schma插入数据
// stuModel.create({
//   name: 'July',
//   age: '20',
//   addr: 'china'

// }).then((res) => {
//   console.log('插入成功:', res);
// }).catch((err) => {
//   console.log('插入失败:', err);
// })

// stuModel.find().then(docs => {   // 什么都不写 就是查所有    有key值就返回查符合要求的  没有符合的就返回[]
//   console.log("查询结果", docs);
// }).catch(err => {
//   console.error(err);
// });


//聚合管道  
// stuModel.aggregate([
//   {$match: {age: {$gt: 18}}},    //匹配年龄大于20的
//   {$group: {_id: '$name', total: {$sum: 1}}},      //按照name的值来分组  total: {$sum: 1} 计算累加值  和js中total+=1 意思相同
//   {$sort: {total: -1}}    //按照降序排序  -1 降序  1升序
// ])
//   .then(res => {
//     console.log('聚合结果:', res);
//   })
//   .catch(err => {
//     console.error('聚合失败:', err);
//   });


// map - reduce function 
//函数实在mongodb的服务器执行 不能写成箭头函数
const mapFn = function () {
  emit(this.student_id, 1);
}

// Reduce function
const reduceFn = function (student_id, values) {
  return Array.sum(values);
};

stuModel.collection.mapReduce(
  mapFn,
  reduceFn,
  {out: "stu_totals"}
).then((res) => {
  console.log('res: ', res);
}).catch((err) => {
  console.error('错误:', err);
});
