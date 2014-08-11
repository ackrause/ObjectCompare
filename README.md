ObjectCompare
=============

Compares two JSON objects and returns an array of their differences.

Usage:

```
var objCompare = require('objCompare');

var obj1 = {"same": "value", "different": "value", "array": [1, 2], "only": "here"};
var obj2 = {"same": "value", "different": "idea", "array": [2, 1]};

// compare order of arrays
console.log(objCompare(obj1, obj2)); //=> [{key: ["different"], before: "value", after: "idea"}, {key: ["array", 0], before: 1, after: 2}, {key: ["array", 1], before: 2, after: 1}, {key: ["only"], before: "here", after: null}]

// ignore order of arrays
console.log(objCompare(obj1, obj2, false)); //=> [{key: ["different"], before: "value", after: "idea"}]
```

Note that ignoring the order of arrays turns array comparison into a shallow check (elements are stringified in a cannonical way, but they are not compared deeper than this). If an object is in one object's array but not the other, then the missing value is designated with `null`.
