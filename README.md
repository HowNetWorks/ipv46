# ipv46 [![CircleCI](https://circleci.com/gh/HowNetWorks/ipv46.svg?style=shield)](https://circleci.com/gh/HowNetWorks/ipv46)

**ipv46** is a small JavaScript library for parsing, formatting and sorting IPv4/6 addresses. It works on both Node.js and browser environments.

## Installation

```sh
$ npm install @hownetworks/ipv46
```

# Usage

```js
const { IP } = require("@hownetworks/ipv46");
```

## IP.parse(string)

Returns the given string parsed into an IPv4 or IPv6 address object.
If the string is not a valid address then the result is null.

```js
IP.parse("192.0.2.1");             // IPv4 { ... }
IP.parse("2001:db8::1");           // IPv6 { ... }
IP.parse("non-address");           // null
```

**IP.parse** supports IPv6 addresses with embedded IPv4 addresses.

```js
IP.parse("2001:db8::192.0.2.1");   // IPv6 { ... }
```

## IP#version

Valid IPv4/6 address objects have their version as an attribute.

```js
IP.parse("192.0.2.1").version;     // 4
IP.parse("2001:db8::1").version;   // 6
```

## IP#toString()

Address objects implement the **toString** method for turning the addresses back into strings. The strings are printed lower-cased sans any extra leading zeroes. IPv6 formatting follows the [RFC 5952](https://tools.ietf.org/html/rfc5952) recommendations, except that formatting doesn't output IPv6 addresses with embedded IPv4 addresses.

```js
IP.parse("192.0.2.1").toString();            // '192.0.2.1'
IP.parse("2001:db8::1").toString();          // '2001:db8::1'
IP.parse("2001:db8::192.0.2.1").toString();  // '2001:db8::c000:201'
```

## IP.cmp(other)

Compare and sort addresses. **IP.cmp(a, b)** returns:
  * **-1** if **a** is sorted before **b**
  * **0** if **a** equals **b**
  * **1** otherwise

```js
const a = IP.parse("192.0.2.1");
const b = IP.parse("203.0.113.0");

IP.cmp(a, a);         // 0
IP.cmp(a, b);         // -1
IP.cmp(b, a);         // 1
```

IPv4 addresses are always sorted before IPv6 addresses.

```js
const ipv4 = IP.parse("192.0.2.1");
const ipv6 = IP.parse("2001:db8::1");

IP.cmp(ipv4, ipv6);   // -1
```

Parsed addresses get normalized. For example extra leading zeroes don't
matter in comparisons.

```js
const a = IP.parse("2001:0db8::1");
const b = IP.parse("2001:0db8:0000::0001")

IP.cmp(a, b);         // 0
```

**IP.cmp** is directly compatible with **Array#sort**.

```js
const a = IP.parse("2001:0db8::2");
const b = IP.parse("2001:0db8::1")
const c = IP.parse("2001:0db8::")

[a, b, c].sort(IP.cmp);  // [c, b, a]
```
