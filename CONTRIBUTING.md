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

Versions follow the [semantic versioning spec](https://semver.org/).

Use `npm version <major | minor | patch>` to bump the version, then push to master.

Ensure you have set follow tags option to true with `git config --global push.followTags true`. GitHub actions will then pick it up and handle the actual publishing to the NPM registry.