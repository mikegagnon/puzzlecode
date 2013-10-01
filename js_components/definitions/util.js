/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

// return a deep copy of origObj, with newObj merged in
function cloneDeep(origObj, newObj) {
  return _.assign(_.cloneDeep(origObj), newObj)
}

// yields a new matrix
// if defaultValue is a function then matrix[x][y] = defaultValue(x, y)
// else matrix[x][y] = defaultValue
function newMatrix(xLength, yLength, defaultValue) {
  return newArray(xLength, function(x) {
    return newArray(yLength, function(y) {
      if (typeof defaultValue == "function") {
        return defaultValue(x, y)
      } else {
        return defaultValue
      }
    })
  })
}

// creates a new matrx of specified length
// if defaultValue is a function, then array[i] = defaultValue(i)
// else, array[i] = defaultValue
function newArray(length, defaultValue) {
  var a = Array(length)
  for (var i = 0; i < length; i++) {
    if (typeof defaultValue == "function") {
      a[i] = defaultValue(i)
    } else {
      a[i] = defaultValue
    }
  }
  return a
}
