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
  for (var key in keySet) {
    deepEquals(obj1[key], obj2[key], [key], changes, exactCompare);
  }

  return changes;

  // HELPER FUNCTIONS

  // get a set of the keys in two objects
  function getKeySet(obj1, obj2) {
    var keyArray = Object.keys(obj1).concat(Object.keys(obj2)),
        keySet = {};

    for (var i = 0; i < keyArray.length; i++) {
      keySet[keyArray[i]] = true;
    }

    return keySet;
  }

  // converts undefined values into nulls, to signify that they were not present in one of the objects
  function convertUndefinedToNull(arg) {
    return typeof arg === 'undefined' ? null : arg;
  }

  // add changed values to changes array
  function addToChanges(keys, before, after, changes) {
    changes.push({key: keys.slice(), before: convertUndefinedToNull(before), after: convertUndefinedToNull(after)});
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
          addToChanges(keys, obj1[i], obj2[i], changes);
        } else if (Array.isArray(obj1[i]) && Array.isArray(obj2[i])) {
          deepEqualsArray(obj1[i], obj2[i], keys, changes, exactCompare);
        } else if ((!Array.isArray(obj1[i]) && Array.isArray(obj2[i])) ||
                   (Array.isArray(obj1[i]) && !Array.isArray(obj2[i]))) {
          addToChanges(keys, obj1[i], obj2[i], changes);
        } 
        else if (typeof obj1[i] === 'object') {
          deepEqualsObject(obj1[i], obj2[i], keys, changes, exactCompare);
        } else if (obj1[i] !== obj2[i]) {
          addToChanges(keys, obj1[i], obj2[i], changes);
        }
        keys.pop();
      }
    } else {
      // create sets of the array contents
      var beforeSet = arrayToSet(obj1);
      var afterSet = arrayToSet(obj2);

      // if a key is in only one set, then it is a change
      var keySet = getKeySet(beforeSet, afterSet);
      for (var key in keySet) {
        if((beforeSet.hasOwnProperty(key) && !afterSet.hasOwnProperty(key)) || 
           (!beforeSet.hasOwnProperty(key) && afterSet.hasOwnProperty(key))) {
          addToChanges(keys, beforeSet[key], afterSet[key], changes);
        }
      }
    }

    return;
  };

  // Create a set from the contents of an array
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
        addToChanges(keys, obj1[key], obj2[key], changes);
      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        deepEqualsArray(obj1[key], obj2[key], keys, changes, exactCompare);
      } else if ((Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) ||
                (!Array.isArray(obj1[key]) && Array.isArray(obj2[key]))) {
        addToChanges(keys, obj1[key], obj2[key], changes);
      } else if (typeof obj1[key] === 'object') {
        deepEqualsObject(obj1[key], obj2[key], keys, changes, exactCompare);
      } else if(obj1[key] !== obj2[key]) {
        addToChanges(keys, obj1[key], obj2[key], changes);
      }
      keys.pop();
    }
    
    return;
  };

  // Check if two values are deeply equal
  function deepEquals (obj1, obj2, keys, changes, exactCompare) {
    keys = keys || [];
    changes = changes || [];
    exactCompare = arguments.length < 5 ? true : !!exactCompare;
    
    if (typeof obj1 !== typeof obj2) {
      addToChanges(keys, obj1, obj2, changes);
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
      addToChanges(keys, obj1, obj2, changes);
      return;
    }
  };
};

module.exports = objCompare;
