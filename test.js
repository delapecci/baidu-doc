let regexp = /<!--.*?-->/gs;

let str = `... <!-- My -- comment
 test --> ..  <!----> ..
`;

console.log( str.match(regexp) );

//============================================================
regexp = /<[^<]+>/g;

str = '<> <a href="/"> <input type="radio" checked> <b> <i/>';

console.log( str.match(regexp) ); // '<a href="/">', '<input type="radio" checked>', '<b>'

//============================================================
regexp = /[0-9a-f]{2}(:[0-9a-f]{2}){5}/i;

console.log( regexp.test('01:32:54:67:89:AB') ); // true

console.log( regexp.test('0132546789AB') ); // false (no colons)

console.log( regexp.test('01:32:54:67:89') ); // false (5 numbers, must be 6)

console.log( regexp.test('01:32:54:67:89:ZZ') ) // false (ZZ ad the end)

//============================================================
regexp = /[-\w]*color:\s?#([0-9a-f]{3}){1,2}\b/ig;
// regexp = /#([0-9a-f]{3}){1,2}\b/ig;

str = "color: #3f3; background-color: #AA00ef; and: #abcd";

console.log( str.match(regexp) );

//============================================================
regexp = /-?\d+(\.\d+)?/g;

str = "-1.5 0 2 -123.4.";

console.log( str.match(regexp) );

//============================================================
function parse(expression) {
  // const regexp = /(?<a>\d+\s?)(?<op>[+-*\/]{1}\s?)(?<b>\d+\s?)/g
  const regexp = /(-?\d+(?:\.\d+)?)\s*([-+*/])\s*(-?\d+(?:\.\d+)?)/;

  const result = expression.match(regexp);
  if (!result) return [];
  result.shift();
  return result;
}

const [a, op, b] = parse('12 * 13');
console.log(parse('12 *   13'));
console.log(a);
console.log(op);
console.log(b);

//============================================================
regexp = /java(script)?|php|c(\+\+)?/ig;
console.log("Java JavaScript PHP C++ C".match(regexp));

//==================Find bbtag pairs==========================================
regexp = /\[(url|b|quote)\].*?(\[\/\1\])/igs
str = "..[url]http://google.com[/url]..";
str = "[url] [b]http://google.com[/b] [/url]";
str = `
[b]hello![/b]
[quote]
[url]http://google.com[/url]
[/quote]
`;
console.log(str.match(regexp));

//=================Find quoted strings===========================================
regexp = /"(\\.|[^"\\])*"/g

str = ' .. "test me" .. "Say \\"Hello\\"!" .. "\\\\ \\"" .. ';
console.log(str.match(regexp));

//=================Find the full tag===========================================
regexp = /<style(>|(\s+(.*)=(["'])(.*)\2)*>)/g;

console.log( '<style> <styler> <style test="..." a=\'...\'     test2="...">'.match(regexp) ); // <style>, <style test="...">

//============================================================
regexp = /(?<!-)\d+/g;

console.log("0 12 -5 123 -18".match(regexp));

//============================================================
regexp = /(?<=<body.*>)/;

str = `
<html>
  <body style="height: 200px">
  ...
  </body>
</html>
`;
console.log( str.replace(regexp, `<h1>Hello</h1>`) );
str = str.replace(/<body.*>/, '$&<h1>Hello</h1>');
console.log( str );
