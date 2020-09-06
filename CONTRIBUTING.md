# 🙌 Contributing

## 🔧 Setup

1. Clone this repository
2. `npm install`

## 🏗 Building

`npm run build` will build the library into `dist`

You can then use it locally like:

```js
const { v2 } = require('./dist');

const token2 = v2('268761584121121501057537215301771044751053314520620437364173136510454342716753365');
console.log(token2.computeCode('1234'));
```

## 📦 Publishing

`npm run publish` will build and publish the library