const mongoose = require('mongoose');

const connectFn = async function (params) {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
}

const kittySchma = new mongoose.Schema({name: String, type: String}, {
  methods: {
    speak() {
      console.log('miao~~');
    }
  },
  statics: {
    staticFn() {
      console.log('staticFn~~~');
    }
  },
  query: {
    byName(name) {
      return this.where({name: new RegExp(name, 'i')});
    }
  },
  virtuals: {
    fullname: {
      get() {
        return 'full' + this.name;
      }, set(newname) {
        return this.name = newname
      }
    }
  }
});

const KittyModel = mongoose.model('kittenModel', kittySchma);
const kitty = new KittyModel({name: 'tom'});

kitty.fullname = 'abc'
console.log(kitty.fullname);
