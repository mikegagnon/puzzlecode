// Array Remove - By John Resig (MIT Licensed)
// http://ejohn.org/blog/javascript-array-remove/
function remove(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length)
  array.length = from < 0 ? array.length + from : from
  return array.push.apply(array, rest)
}