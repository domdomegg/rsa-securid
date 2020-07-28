# rsa-securid

Lightweight TypeScript library for generating RSA SecurID tokens

Derived from the brilliant [stoken](https://github.com/cernekee/stoken)

Produces codes like:

```json
{
  "validFrom": "2020-07-28T18:28:00.000Z",
  "expiresAt": "2020-07-28T18:29:00.000Z",
  "code": "93258349"
}
```

## Usage

```javascript
// Also supports ES6 module syntax:
// import v2 from 'rsa-securid/v2';
const { v2, v3 } = require('rsa-securid');

const token2 = v2('268761584121121501057537215301771044751053314520620437364173136510454342716753365');
console.log(token2.computeCode('1234'));

const token3 = v3('http://127.0.0.1/securid/ctf?ctfData=AwAA6fnJ%2FjXsB5gzMvmXLFf7Vwv7dock0eY9e0Tw9mZrravp%2Bcn%2BNewHmDMy%2BZcsV%2FtXC%2Ft2hyTR5j17RPD2Zmutq5tKvxjTjjScj%2BfbyBikrAwASsH8yed36FZqg%2BePO3mM3ybiR8fkenVhN5ERXVEqiNBKDEDhUh6iq%2BnKSPz752vJl3BD5CFyWfhijcJsH8DGymewRd2owRBXx6Jjm4ugl%2BKJte5TB4prrMdOuxwolL0SOEgVAM1AF3XGtxMK0R1jQwaxTSHGVZYxtnPX6m7E5BSZJrhz4YxQSc2VZwRdEhQWkv48MYiKUO%2BMz18dvOEgrWuFRcQGLIB4BM8C2eZJAro4sKa5V2meplLRY9xZruwSHXpdVWzpZ8B5Ko8ZD9Ei');
console.log(token3.computeCode('1234'));
```

### In-browser

Works with webpack or Browserify. Prefer ES6 module syntax (`import` rather than `require`) to reduce bundle size with tree-shaking.