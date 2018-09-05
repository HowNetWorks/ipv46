# ipv46 [![CircleCI](https://circleci.com/gh/HowNetWorks/ipv46.svg?style=shield)](https://circleci.com/gh/HowNetWorks/ipv46)

**ipv46** is a small JavaScript library for parsing, formatting and sorting IPv4/6 addresses. It works on both Node.js and browser environments.

## Installation

```sh
$ npm install @hownetworks/ipv46
```

# Usage

On environments that support the **import** syntax:

```js
import parseIP from "@hownetworks/ipv46";
```

On environments that don't support the above syntax (e.g. default Node.js):

```js
const parseIP = require("@hownetworks/ipv46").default;
```

## parseIP(string)

Returns the given string parsed into an IPv4 or IPv6 address object.
If the string is not a valid address then the result is null.

```js
parseIP("192.0.2.1");             // IPv4 { ... }
parseIP("2001:db8::1");           // IPv6 { ... }
parseIP("non-address");           // null
```

**parseIP** supports IPv6 addresses with embedded IPv4 addresses.

```js
parseIP("2001:db8::192.0.2.1");   // IPv6 { ... }
```

## ip.version

Valid IPv4/6 address objects have their version as an attribute.

```js
parseIP("192.0.2.1").version;     // 4
parseIP("2001:db8::1").version;   // 6
```

## ip.toString()

Address objects implement the **toString** method for turning the addresses back into strings. The strings are printed lower-cased sans any extra leading zeroes. IPv6 formatting follows the [RFC 5952](https://tools.ietf.org/html/rfc5952) recommendations, except that formatting doesn't output IPv6 addresses with embedded IPv4 addresses.

```js
parseIP("192.0.2.1").toString();            // '192.0.2.1'
parseIP("2001:db8::1").toString();          // '2001:db8::1'
parseIP("2001:db8::192.0.2.1").toString();  // '2001:db8::c000:201'
```

## ip.cmp(other)

Compare and sort addresses. **a.cmp(b)** returns:
  * **-1** if **a** is sorted before **b**
  * **0** if **a** equals **b**
  * **1** otherwise
  
```js
const a = parseIP("192.0.2.1");
const b = parseIP("203.0.113.0");

a.cmp(a);         // 0
a.cmp(b);         // -1
b.cmp(a);         // 1
```

IPv4 addresses are always sorted before IPv6 addresses.

```js
const ipv4 = parseIP("192.0.2.1");
const ipv6 = parseIP("2001:db8::1");

ipv4.cmp(ipv6);   // -1
```

Parsed addresses get normalized. For example extra leading zeroes don't
matter in comparisons.

```js
const a = parseIP("2001:0db8::1");
const b = parseIP("2001:0db8:0000::0001")

a.cmp(b);         // 0
```
