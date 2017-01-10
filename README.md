# ipv46

**ipv46** is a small JavaScript library for parsing, formatting and sorting IPv4/6 addresses. It works on both Node.js and browser environments.

## Installation

```sh
$ npm install @hownetworks/ipv46
```

# Usage

```js
import parseIP from "@hownetworks/ipv46";

// parseIP returns the given string parsed into an IPv4 or IPv6 address object.
// If the string is not a valid address then the result is null.
console.log(parseIP("not an address")); // null

// Valid IPv4/6 address objects have their version as an attribute.
const ipv4 = parseIP("192.0.2.1");
const ipv6 = parseIP("2001:db8::1");
console.log(ipv4.version); // 4
console.log(ipv6.version); // 6

// Address objects implement the toString method for turning the addresses back
// into strings. The strings are printed lower-cased sans any  extra leading
// zeroes. IPv6 formatting follows the RFC 5952
// (https://tools.ietf.org/html/rfc5952) recommendations.
console.log(String(ipv4)); // 192.0.2.1
console.log(String(ipv6)); // 2001:db8::1

// Method cmp(...) can be used to compare and sort addresses, and a.cmp(b)
// returns:
//  * -1 if a is sorted before b
//  * 0 if a equals b
//  * 1 otherwise
const other4 = parseIP("203.0.113.0");
console.log(ipv4.cmp(other4)); // -1
console.log(ipv4.cmp(ipv4)); // 0
console.log(other4.cmp(ipv4)); // 1

// Parsed addresses get normalized. For example extra leading zeroes don't
// matter in comparisons.
const other6 = parseIP("2001:0db8:0000::0001")
console.log(ipv6.cmp(other6)); // 0

// IPv4 addresses are sorted before IPv6 addresses.
console.log(ipv4.cmp(ipv6)); // -1
```
