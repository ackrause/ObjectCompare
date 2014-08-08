var objCompare = function objCompare(obj1, obj2) {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || Array.isArray(obj1) || Array.isArray(obj2)) {
    throw new Error('objCompare only compares two non-array objects');
  }

  var keySet = getKeySet(obj1, obj2),
      changes = [];

  // Check each key for deep equality.
  // If values at that key differ, save the key and two values
  for (key in keySet) {
    deepEquals(obj1[key], obj2[key], [key], changes);
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
  function deepEqualsArray(obj1, obj2, keys, changes) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) {
      throw new Error('Input must be two arrays');
    }

    var maxIndex = obj1.length > obj2.length ? obj1.length : obj2.length;

    var equals = true;
    for (var i = 0; i < obj1.length; i++) {
      keys.push(i);
      if (typeof obj1[i] !== typeof obj2[i]) {
        changes.push({key: keys.slice(), before: obj1[i], after: obj2[i]});
      } else if (Array.isArray(obj1[i]) && Array.isArray(obj2[i])) {
        deepEqualsArray(obj1[i], obj2[i], keys, changes);
      } else if ((!Array.isArray(obj1[i]) && Array.isArray(obj2[i])) ||
                 (Array.isArray(obj1[i]) && !Array.isArray(obj2[i]))) {
        changes.push({key: keys.slice(), before: obj1[i], after: obj2[i]});
      } 
      else if (typeof obj1[i] === 'object') {
        deepEqualsObject(obj1[i], obj2[i], keys, changes);
      } else if (obj1[i] !== obj2[i]) {
        changes.push({key: keys.slice(), before: obj1[i], after: obj2[i]});
      }
      keys.pop();
    }

    return;
  };

  // Check if two non-array objects are deeply equal
  function deepEqualsObject (obj1, obj2, keys, changes) {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ||
        Array.isArray(obj1) || Array.isArray(obj2)) {
      throw new Error('Input must be two non-array objects');
    }

    var keySet = getKeySet(obj1, obj2);

    for (var key in keySet) {
      keys.push(key);
      if (typeof obj1[key] !== typeof obj2[key]) {
        changes.push({key: keys.slice(), before: obj1[key], after: obj2[key]});
      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        deepEqualsArray(obj1[key], obj2[key], keys, changes);
      } else if ((Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) ||
                (!Array.isArray(obj1[key]) && Array.isArray(obj2[key]))) {
        changes.push({key: keys.slice(), before: obj1[key], after: obj2[key]});
      } else if (typeof obj1[key] === 'object') {
        deepEqualsObject(obj1[key], obj2[key], keys, changes);
      } else if(obj1[key] !== obj2[key]) {
        changes.push({key: keys.slice(), before: obj1[key], after: obj2[key]});
      }
      keys.pop();
    }
    
    return;
  };

  // Check if two values are deeply equal
  function deepEquals(obj1, obj2, keys, changes) {
    keys = keys || [];
    
    if (typeof obj1 !== typeof obj2) {
      changes.push({key: keys, before: obj1, after: obj2});
      return;
    }

    // deep compare two arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      deepEqualsArray(obj1, obj2, keys, changes);
      return;
    }
    // deep compare two objects
    else if (typeof obj1 === 'object' && typeof obj2 =='object') {
      deepEqualsObject(obj1, obj2, keys, changes);
      return;
    }
    // compare two primitive types
    else if (obj1 !== obj2) {
      changes.push({key: keys.slice(), before: obj1, after: obj2});
      return;
    }
  };
};
