function cmp(left, right) {
    if (left === right) {
        return 0;
    }
    return left < right ? -1 : 1;
}

function cmpSameLengthArrays(left, right) {
    for (let i = 0, len = left.length; i < len; i++) {
        if (left[i] !== right[i]) {
            return left[i] < right[i] ? -1 : 1;
        }
    }
    return 0;
}

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)$/;

function parseIPv4Bytes(string) {
    const ipv4 = string.match(IPV4_REGEX);
    if (!ipv4) {
        return null;
    }
    return ipv4.slice(1, 5).map(Number);
}

function parseIPv4(string) {
    const bytes = parseIPv4Bytes(string);
    if (!bytes) {
        return null;
    }
    return new IPv4(bytes);
}

class IPv4 {
    constructor(bytes) {
        this.version = 4;
        this._bytes = bytes;
        this._string = null;
    }

    cmp(other) {
        return cmp(this.version, other.version) || cmpSameLengthArrays(this._bytes, other._bytes);
    }

    toString() {
        if (this._string === null) {
            this._string = this._bytes.join(".");
        }
        return this._string;
    }
}

const IPV6_REGEX = /^[a-f0-9:]{2,39}$/i;
const IPV6_ZEROS = [0, 0, 0, 0, 0, 0, 0, 0];

function parseHexWords(string) {
    if (!string) {
        return [];
    }

    const split = string.split(":");
    const words = new Array(split.length);
    for (let i = 0, len = split.length; i < len; i++) {
        const str = split[i];
        if (!str || str.length > 4) {
            return null;
        }
        words[i] = parseInt(str, 16);
    }
    return words;
}

function formatHexWords(words, start, end) {
    return words.slice(start, end).map(w => w.toString(16)).join(":");
}

function parseIPv6Words(string) {
    if (!IPV6_REGEX.test(string)) {
        return null;
    }

    const idx = string.indexOf("::");
    if (idx >= 0 && string.indexOf("::", idx + 1) >= 0) {
        return null;
    }

    let head, tail;
    if (idx >= 0) {
        head = parseHexWords(string.slice(0, idx));
        tail = parseHexWords(string.slice(idx + 2));
    } else {
        head = parseHexWords(string);
        tail = [];
    }
    if (!head || !tail) {
        return null;
    }

    if (idx < 0 && head.length !== 8) {
        return null;
    }
    if (idx >= 0 && head.length + tail.length > 7) {
        return null;
    }
    return head.concat(IPV6_ZEROS.slice(0, 8 - head.length - tail.length), tail);
}

function parseIPv6(string) {
    const index = string.lastIndexOf(":");
    if (index < 0) {
        return null;
    }

    const bytes = parseIPv4Bytes(string.slice(index + 1));
    if (bytes === null) {
        const words = parseIPv6Words(string);
        if (words === null) {
            return null;
        }
        return new IPv6(words);
    }

    const words = parseIPv6Words(string.slice(0, index + 1) + "0:0");
    if (words === null) {
        return null;
    }
    words[6] = bytes[0] * 256 + bytes[1];
    words[7] = bytes[2] * 256 + bytes[3];
    return new IPv6(words);
}

function formatIPv6(words) {
    let currentRun = 0;
    let longestRun = 0;
    let start = null;
    for (let i = 0; i < 8; i++) {
        if (words[i] === 0) {
            currentRun += 1;
            if (currentRun > 1 && currentRun > longestRun) {
                longestRun = currentRun;
                start = i - currentRun + 1;
            }
        } else {
            currentRun = 0;
        }
    }

    if (start === null) {
        return formatHexWords(words);
    }
    return formatHexWords(words, 0, start) + "::" + formatHexWords(words, start + longestRun);
}

class IPv6 {
    constructor(words) {
        this.version = 6;
        this._words = words;
        this._string = null;
    }

    cmp(other) {
        return cmp(this.version, other.version) || cmpSameLengthArrays(this._words, other._words);
    }

    toString() {
        if (this._string === null) {
            this._string = formatIPv6(this._words).toLowerCase();
        }
        return this._string;
    }
}

export default function parseIP(string) {
    if (string.indexOf(":") >= 0) {
        return parseIPv6(string);
    } else if (string.indexOf(".") >= 0) {
        return parseIPv4(string);
    } else {
        return null;
    }
}
