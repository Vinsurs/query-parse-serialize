# query-parse-serialize
A library for parsing and serializing query strings in JavaScript.

## Install
```bash
npm install query-parse-serialize
```

## Usage
```js
import { parse, serialize } from 'query-parse-serialize'

const query = parse('a=1&b=2&b=3', { ignoreNoValue: true })
console.log(query) // { a: 1, b: [2, 3] }

const queryStr = serialize({ a: 1, b: 2, c: 3 }, { withPrefix: true })
console.log(queryStr) // '?a=1&b=2&c=3'
```
## Test
```bash
npm test
```
## License
MIT
