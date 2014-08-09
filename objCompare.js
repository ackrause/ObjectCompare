var cannonicalJson = require('canonical-json');

var objCompare = function objCompare(obj1, obj2, exactCompare) {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || Array.isArray(obj1) || Array.isArray(obj2)) {
    throw new Error('objCompare only compares two non-array objects');
  }

  var keySet = getKeySet(obj1, obj2),
      changes = [];

  exactCompare = arguments.length < 3 ? true : !!exactCompare;

  // Check each key for deep equality.
  // If values at that key differ, save the key and two values
  for (key in keySet) {
    deepEquals(obj1[key], obj2[key], [key], changes, exactCompare);
  }

  return changes;

  // HELPER FUNCTIONS

  function getKeySet(obj1, obj2) {
    var keyArray = Object.keys(obj1).concat(Object.keys(obj2)),
        keySet = {};

    for (var i = 0; i < keyArray.length; i++) {
      keySet[keyArray[i]] = true;
    }

    return keySet;
  }

  // Check if two arrays are deeply equal
  function deepEqualsArray(obj1, obj2, keys, changes, exactCompare) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) {
      throw new Error('Input must be two arrays');
    }

    exactCompare = arguments.length < 5 ? true : !!exactCompare;

    var maxIndex = obj1.length > obj2.length ? obj1.length : obj2.length;

    if (exactCompare) {
      for (var i = 0; i < obj1.length; i++) {
        keys.push(i);
        if (typeof obj1[i] !== typeof obj2[i]) {
          changes.push({key: keys.slice(), before: obj1[i], after: obj2[i]});
        } else if (Array.isArray(obj1[i]) && Array.isArray(obj2[i])) {
          deepEqualsArray(obj1[i], obj2[i], keys, changes, exactCompare);
        } else if ((!Array.isArray(obj1[i]) && Array.isArray(obj2[i])) ||
                   (Array.isArray(obj1[i]) && !Array.isArray(obj2[i]))) {
          changes.push({key: keys.slice(), before: obj1[i], after: obj2[i]});
        } 
        else if (typeof obj1[i] === 'object') {
          deepEqualsObject(obj1[i], obj2[i], keys, changes, exactCompare);
        } else if (obj1[i] !== obj2[i]) {
          changes.push({key: keys.slice(), before: obj1[i], after: obj2[i]});
        }
        keys.pop();
      }
    } else {
      // create sets of hashed array contents
      var beforeSet = arrayToSet(obj1);
      var afterSet = arrayToSet(obj2);

      // if a key exists in both, remove it from both
      var keySet = getKeySet(beforeSet, afterSet);
      for (key in keySet) {
        if(beforeSet[key] && afterSet[key]) {
          delete beforeSet[key];
          delete afterSet[key];
        }
      }

      // what remains are changes
      for (key in beforeSet) {
        changes.push({key: keys.slice(), before: beforeSet[key], after: null});
      }
      for (key in afterSet) {
        changes.push({key: keys.slice(), before: null, after: afterSet[key]});
      }

    }

    return;
  };

  // Hash the contents of an array

  function arrayToSet(arr) {
    if (!Array.isArray(arr)) {
      throw new Error('hashArray requires an array as input. Given: ', arr);
    }

    var set = {};

    for (var i = 0; i < arr.length; i++) {
      var key = cannonicalJson(arr[i]);


      if(!set[key]) {
        set[key] = arr[i];
      } 
    }

    return set;
  }

  // Check if two non-array objects are deeply equal
  function deepEqualsObject (obj1, obj2, keys, changes, exactCompare) {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ||
        Array.isArray(obj1) || Array.isArray(obj2)) {
      throw new Error('Input must be two non-array objects');
    }

    exactCompare = arguments.length < 5 ? true : !!exactCompare;

    var keySet = getKeySet(obj1, obj2);

    for (var key in keySet) {
      keys.push(key);
      if (typeof obj1[key] !== typeof obj2[key]) {
        changes.push({key: keys.slice(), before: obj1[key], after: obj2[key]});
      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        deepEqualsArray(obj1[key], obj2[key], keys, changes, exactCompare);
      } else if ((Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) ||
                (!Array.isArray(obj1[key]) && Array.isArray(obj2[key]))) {
        changes.push({key: keys.slice(), before: obj1[key], after: obj2[key]});
      } else if (typeof obj1[key] === 'object') {
        deepEqualsObject(obj1[key], obj2[key], keys, changes, exactCompare);
      } else if(obj1[key] !== obj2[key]) {
        changes.push({key: keys.slice(), before: obj1[key], after: obj2[key]});
      }
      keys.pop();
    }
    
    return;
  };

  // Check if two values are deeply equal
  function deepEquals(obj1, obj2, keys, changes, exactCompare) {
    keys = keys || [];
    changes = changes || [];
    exactCompare = arguments.length < 5 ? true : !!exactCompare;
    
    if (typeof obj1 !== typeof obj2) {
      changes.push({key: keys, before: obj1, after: obj2});
      return;
    }

    // deep compare two arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      deepEqualsArray(obj1, obj2, keys, changes, exactCompare);
      return;
    }
    // deep compare two objects
    else if (typeof obj1 === 'object' && typeof obj2 =='object') {
      deepEqualsObject(obj1, obj2, keys, changes, exactCompare);
      return;
    }
    // compare two primitive types
    else if (obj1 !== obj2) {
      changes.push({key: keys.slice(), before: obj1, after: obj2});
      return;
    }
  };
};

module.exports = objCompare;
