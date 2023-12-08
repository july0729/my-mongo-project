// Mongoose 可以通过Node来操作MongoDB数据库的一个模块
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

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


stuModel.find().then(docs => {   // 什么都不写 就是查所有    有key值就返回查符合要求的  没有符合的就返回[]
  console.log("查询结果", docs);
}).catch(err => {
  console.error(err);
});


//联表操作
