/* eslint-env jest */

import parseIP from "../src/ipv46";

describe("IPv4", () => {
    describe("sorting", () => {
        it("considers addresses equal to themselves", () => {
            const a = parseIP("1.2.3.4");
            expect(a.cmp(a)).toBe(0);

            const b = parseIP("1.2.3.4");
            expect(a.cmp(b)).toBe(0);
            expect(b.cmp(a)).toBe(0);
        });

        it("is not lexical", () => {
            const a = parseIP("9.0.0.0");
            const b = parseIP("10.0.0.0");
            expect(a.cmp(b)).toBe(-1);
            expect(b.cmp(a)).toBe(1);
        });

        it("considers 127.255.255.255 less than 128.0.0.0", () => {
            const a = parseIP("127.255.255.255");
            const b = parseIP("128.0.0.0");
            expect(a.cmp(b)).toBe(-1);
            expect(b.cmp(a)).toBe(1);
        });
    });

    describe("parser", () => {
        it("requires numbers and .", () => {
            expect(parseIP("x.y.z.0")).toBeNull();
        });
        it("disallows leading zeroes", () => {
            expect(parseIP("01.02.03.04")).toBeNull();
            expect(parseIP("001.002.003.004")).toBeNull();
        });
        it("disallows numbers larger than 255", () => {
            expect(parseIP("0.0.0.256")).toBeNull();
        });
        it("disallows numbers less than 0", () => {
            expect(parseIP("0.0.0.-1")).toBeNull();
        });
        it("disallows too many octets", () => {
            expect(parseIP("1.2.3.4.5")).toBeNull();
        });
        it("disallows too few octets", () => {
            expect(parseIP("1.2.3")).toBeNull();
        });
        it("disallows leading whitespace", () => {
            expect(parseIP(" 0.0.0.0")).toBeNull();
        });
        it("disallows trailing whitespace", () => {
            expect(parseIP("0.0.0.0 ")).toBeNull();
        });
        it("disallows inner whitespace after octets", () => {
            expect(parseIP("0.0.0 .0")).toBeNull();
        });
        it("disallows inner whitespace before octets", () => {
            expect(parseIP("0.0. 0.0")).toBeNull();
        });
    });

    describe("formatting", () => {
        it("produces the parsed value", () => {
            expect(String(parseIP("127.0.0.1"))).toBe("127.0.0.1");
        });
    });
});

describe("IPv6", () => {
    describe("sorting", () => {
        it("considers addresses equal to themselves", () => {
            const a = parseIP("1:2:3:4:5:6:7:8");
            expect(a.cmp(a)).toBe(0);

            const b = parseIP("1:2:3:4:5:6:7:8");
            expect(a.cmp(b)).toBe(0);
            expect(b.cmp(a)).toBe(0);
        });

        it("is not lexical", () => {
            const a = parseIP("9::");
            const b = parseIP("10::");
            expect(a.cmp(b)).toBe(-1);
            expect(b.cmp(a)).toBe(1);
        });

        it("is case-insensitive", () => {
            const a = parseIP("A::");
            const b = parseIP("a::");
            expect(a.cmp(b)).toBe(0);
        });
    });

    describe("parser", () => {
        it("disallows non-hexadecimal characters", () => {
            expect(parseIP("x:y:z:0:1:2:3:4")).toBeNull();
        });
        it("disallows a single colon", () => {
            expect(parseIP(":")).toBeNull();
        });
        it("disallows a triple colon", () => {
            expect(parseIP(":::")).toBeNull();
        });
        it("disallows leading whitespace", () => {
            expect(parseIP(" 1:2:3:4:5:6:7:8")).toBeNull();
        });
        it("disallows trailing whitespace", () => {
            expect(parseIP("1:2:3:4:5:6:7:8 ")).toBeNull();
        });
        it("disallows inner whitespace after words", () => {
            expect(parseIP("1 :2:3:4:5:6:7:8")).toBeNull();
        });
        it("disallows inner whitespace before words", () => {
            expect(parseIP("1: 2:3:4:5:6:7:8")).toBeNull();
        });
        it("disallows inner whitespace between colons", () => {
            expect(parseIP(": :")).toBeNull();
        });
        it("allows max. 8 words", () => {
            expect(parseIP("0:1:2:3:4:5:6:7:8")).toBeNull();
        });
        it("requires 8 words when there is no ::", () => {
            expect(parseIP("1:2:3:4:5:6:7")).toBeNull();
        });
        it("counts :: as at least one word", () => {
            expect(parseIP("1:2:3:4::5:6:7:8")).toBeNull();
        });
        it("allows only one ::", () => {
            expect(parseIP("1::4::8")).toBeNull();
        });
        it("allows leading zeroes", () => {
            const a = parseIP("0000:0001:0002:0003:0004:0005:0006:0007");
            const b = parseIP("0:1:2:3:4:5:6:7");
            expect(a.cmp(b)).toBe(0);
        });
        it("allows max. 4 characters per word", () => {
            expect(parseIP("00000:1:2:3:4:5:6:7")).toBeNull();
            expect(parseIP("0:00001:2:3:4:5:6:7")).toBeNull();
        });
        it("requires at least one character per word", () => {
            expect(parseIP(":1:2:3:4:5:6:7")).toBeNull();
        });
        it("doesn't require :: to replace the longest run of zeroes", () => {
            const a = parseIP("1:0:0:3:4:0:0:0");
            const b = parseIP("1::3:4:0:0:0");
            expect(a.cmp(b)).toBe(0);
        });
        it("doesn't require :: to replace the leftmost run of zeroes", () => {
            const a = parseIP("1:0:0:0:4:0:0:0");
            const b = parseIP("1:0:0:0:4::");
            expect(a.cmp(b)).toBe(0);
        });
        it("allows replacing all words with ::", () => {
            const a = parseIP("0:0:0:0:0:0:0:0");
            const b = parseIP("::");
            expect(a.cmp(b)).toBe(0);
        });
        it("allows mixing zero words and and ::", () => {
            const a = parseIP("0:0:0:0:0:0:0:0");
            const b = parseIP("0::0");
            expect(a.cmp(b)).toBe(0);
        });
        it("allows replacing just one zero word with ::", () => {
            const a = parseIP("1::3:4:5:6:7:8");
            const b = parseIP("1:0:3:4:5:6:7:8");
            expect(a.cmp(b)).toBe(0);
        });
        it("accepts embedded IPv4 addresses after prefix 0:0:0:0:0:0", () => {
            const a = parseIP("::192.0.2.1");
            const b = parseIP("::c000:201");
            expect(a.cmp(b)).toBe(0);
        });
        it("accepts embedded IPv4 addresses after prefix 0:0:0:0:0:ffff", () => {
            const a = parseIP("::ffff:192.0.2.1");
            const b = parseIP("::ffff:c000:201");
            expect(a.cmp(b)).toBe(0);
        });
        it("accepts embedded IPv4 addresses after any 96-bit prefix", () => {
            const a = parseIP("2001:db8::192.0.2.1");
            const b = parseIP("2001:db8::c000:201");
            expect(a.cmp(b)).toBe(0);
        });
        it("doesn't interpret a single trailing number between 0-255 as an octet", () => {
            const a = parseIP("2001:db8::1ff");
            const b = parseIP("2001:db8::255");
            expect(a.cmp(b)).toBe(-1);
        });
        it("requires embedded IPv4 addresses to be well-formed", () => {
            expect(parseIP("2001:db8::192.0.2.256")).toBeNull();
            expect(parseIP("2001:db8::192.0.2.1.0")).toBeNull();
            expect(parseIP("2001:db8::192.0.2")).toBeNull();
            expect(parseIP("2001:db8::192.0")).toBeNull();
            expect(parseIP("2001:db8::192.0.2.")).toBeNull();
            expect(parseIP("2001:db8::.0.2.1")).toBeNull();
        });
        it("counts embedded IPv4 address as 2 words", () => {
            expect(parseIP("1:2:3:4:5:6:7:8:192.0.2.1")).toBeNull();
            expect(parseIP("1:2:3:4:5:6:7:192.0.2.1")).toBeNull();
        });
        it("disallows non-trailing IPv4 addresses", () => {
            expect(parseIP("192.0.2.1::")).toBeNull();
            expect(parseIP("0:192.0.2.1::")).toBeNull();
            expect(parseIP("0:0:192.0.2.1::")).toBeNull();
            expect(parseIP("::192.0.2.1:0:0:0")).toBeNull();
            expect(parseIP("::192.0.2.1:0:0")).toBeNull();
            expect(parseIP("::192.0.2.1:0")).toBeNull();
        });
    });

    describe("formatting", () => {
        it("doesn't output leading zeroes", () => {
            expect(String(parseIP("0001:0002:0003:0004:0005:0006:0007:0008"))).toBe("1:2:3:4:5:6:7:8");
        });
        it("doesn't output :: when there are no two or more consecutive zero words", () => {
            expect(String(parseIP("1:2:3:0:5:6:7:8"))).toBe("1:2:3:0:5:6:7:8");
        });
        it("collapses 2-8 zeroes", () => {
            expect(String(parseIP("1:2:3:0:0:6:7:8"))).toBe("1:2:3::6:7:8");
            expect(String(parseIP("1:2:3:0:0:0:7:8"))).toBe("1:2:3::7:8");
            expect(String(parseIP("1:2:0:0:0:0:7:8"))).toBe("1:2::7:8");
            expect(String(parseIP("1:2:0:0:0:0:0:8"))).toBe("1:2::8");
            expect(String(parseIP("1:0:0:0:0:0:0:8"))).toBe("1::8");
            expect(String(parseIP("0:0:0:0:0:0:0:8"))).toBe("::8");
            expect(String(parseIP("0:0:0:0:0:0:0:0"))).toBe("::");
        });
        it("collapses zeroes even from the beginning", () => {
            expect(String(parseIP("0:0:3:4:5:6:7:8"))).toBe("::3:4:5:6:7:8");
        });
        it("collapses zeroes even from the end", () => {
            expect(String(parseIP("1:2:3:4:5:6:0:0"))).toBe("1:2:3:4:5:6::");
        });
        it("collapses the longest run of zeroes", () => {
            expect(String(parseIP("1:0:0:4:5:0:0:0"))).toBe("1:0:0:4:5::");
        });
        it("collapses the leftmost longest run of zeroes", () => {
            expect(String(parseIP("1:0:0:0:5:0:0:0"))).toBe("1::5:0:0:0");
        });
        it("always outputs lower-case", () => {
            expect(String(parseIP("abcd:ef00::"))).toBe("abcd:ef00::");
            expect(String(parseIP("ABCD:EF00::"))).toBe("abcd:ef00::");
        });
        it("doesn't output embedded IPv4 addresses", () => {
            expect(String(parseIP("::192.0.2.1"))).toBe("::c000:201");
            expect(String(parseIP("::ffff:192.0.2.1"))).toBe("::ffff:c000:201");
            expect(String(parseIP("2001:db8::192.0.2.1"))).toBe("2001:db8::c000:201");
        });
    });
});

describe("parsing", () => {
    it("disallows empty strings", () => {
        expect(parseIP("")).toBeNull();
    });
    it("disallows values with no . or :", () => {
        expect(parseIP("Hello, World!")).toBeNull();
    });
});

describe("sorting", () => {
    it("considers all IPv4 addresses less than any IPv6 address", () => {
        const a = parseIP("255.255.255.255");
        const b = parseIP("::");
        expect(a.cmp(b)).toBe(-1);
        expect(b.cmp(a)).toBe(1);
    });
});
