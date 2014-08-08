var objCompare = function objCompare(obj1, obj2) {
  var changes = [],
      keySet = {},
      keyArray;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || Array.isArray(obj1) || Array.isArray(obj2)) {
    throw new Error('objCompare only compares two non-array objects');
  }

  // Grab all of the keys from both objects
  keyArray = Object.keys(obj1);
  keyArray.concat(Object.keys(obj2));
  for (var i = 0; i < keyArray.length; i++) {
    keySet[keyArray[i]] = true;
  }

  // Check each key for deep equality.
  // If values at that key differ, save the key and two values
  for (key in keySet) {
    if (!deepEquals(obj1[key], obj2[key])) {
      changes.push({key: key, before: obj1[key], after: obj2[key]});
    }
  }

  return changes;

  // HELPER FUNCTIONS

  // Check if two arrays are deeply equal
  function deepEqualsArray(obj1, obj2) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) {
      throw new Error('Input must be two arrays');
    }

    if (obj1.length !== obj2.length) {
      return false;
    }

    var equals = true;
    for (var i = 0; i < obj1.length; i++) {
      if (typeof obj1[i] !== typeof obj2[i]) {
        return false;
      } else if (Array.isArray(obj1[i]) && Array.isArray(obj2[i])) {
        equals = equals && deepEqualsArray(obj1[i], obj2[i]);
      } else if ((!Array.isArray(obj1[i]) && Array.isArray(obj2[i])) ||
                 (Array.isArray(obj1[i]) && !Array.isArray(obj2[i]))) {
        return false;
      } 
      else if (typeof obj1[i] === 'object') {
        equals = equals && deepEqualsObject(obj1[i], obj2[i]);
      } else {
        equals = equals && (obj1[i] === obj2[i]);
      }
    }

    return equals;
  };

  // Check if two non-array objects are deeply equal
  function deepEqualsObject (obj1, obj2) {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' ||
        Array.isArray(obj1) || Array.isArray(obj2)) {
      throw new Error('Input must be two non-array objects');
    }

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }

    var equals = true;
    for (var key in obj1) {
      if (typeof obj1[key] !== typeof obj2[key]) {
        return false;
      } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        equals = equals && deepEqualsArray(obj1[key], obj2[key]);
      } else if ((Array.isArray(obj1[key]) && !Array.isArray(obj2[key])) ||
                (!Array.isArray(obj1[key]) && Array.isArray(obj2[key]))) {
        return false;
      } else if (typeof obj1[key] === 'object') {
        equals = equals && deepEqualsObject(obj1[key], obj2[key]);
      } else {
        equals = equals && (obj1[key] === obj2[key]);
      }
    }

    return equals;
  };

  // Check if two values are deeply equal
  function deepEquals(obj1, obj2) {
    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    // deep compare two arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      return deepEqualsArray(obj1, obj2);
    }
    // deep compare two objects
    else if (typeof obj1 === 'object' && typeof obj2 =='object') {
      return deepEqualsObject(obj1, obj2);
    }
    // compare two primitive types
    else {
      return obj1 === obj2;
    }
  };
};
