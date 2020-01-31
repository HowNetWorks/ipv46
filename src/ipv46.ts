function cmpSameLengthArrays<T>(left: T[], right: T[]): number {
  const len = left.length;
  for (let i = 0; i < len; i++) {
    if (left[i] !== right[i]) {
      return left[i] < right[i] ? -1 : 1;
    }
  }
  return 0;
}

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)$/;

function parseIPv4Bytes(ipStr: string): number[] | null {
  const ipv4 = ipStr.match(IPV4_REGEX);
  if (!ipv4) {
    return null;
  }
  return ipv4.slice(1, 5).map(Number);
}

export class IPv4 {
  static parse(string: string): IPv4 | null {
    if (string.indexOf(".") < 0) {
      return null;
    }
    const bytes = parseIPv4Bytes(string);
    if (!bytes) {
      return null;
    }
    return new IPv4(bytes);
  }

  static cmp(a: IPv4, b: IPv4): number {
    return cmpSameLengthArrays(a._bytes, b._bytes);
  }

  readonly version = 4;
  private readonly _bytes: number[];
  private _string: string | null = null;

  private constructor(bytes: number[]) {
    this._bytes = bytes;
  }

  toString(): string {
    if (this._string === null) {
      this._string = this._bytes.join(".");
    }
    return this._string;
  }

  cidr(bits: number): IPRange {
    const first = new IPv4(mask(this._bytes, bits, 8, 0));
    const last = new IPv4(mask(this._bytes, bits, 8, 1));
    return new IPRange(first, last);
  }
}

const IPV6_REGEX = /^[a-f0-9:]{2,39}$/i;
const IPV6_ZEROS = [0, 0, 0, 0, 0, 0, 0, 0];

function parseHexWords(ipStr: string): number[] | null {
  if (!ipStr) {
    return [];
  }

  const split = ipStr.split(":");
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

function formatHexWords(words: number[], start?: number, end?: number) {
  return words
    .slice(start, end)
    .map(w => w.toString(16))
    .join(":");
}

function parseIPv6Words(ipStr: string): number[] | null {
  if (!IPV6_REGEX.test(ipStr)) {
    return null;
  }

  const idx = ipStr.indexOf("::");
  if (idx >= 0 && ipStr.indexOf("::", idx + 1) >= 0) {
    return null;
  }

  let head: number[] | null;
  let tail: number[] | null;
  if (idx >= 0) {
    head = parseHexWords(ipStr.slice(0, idx));
    tail = parseHexWords(ipStr.slice(idx + 2));
  } else {
    head = parseHexWords(ipStr);
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

function formatIPv6(words: number[]) {
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
  return (
    formatHexWords(words, 0, start) +
    "::" +
    formatHexWords(words, start + longestRun)
  );
}

export class IPv6 {
  static parse(string: string): IPv6 | null {
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

  static cmp(a: IPv6, b: IPv6): number {
    return cmpSameLengthArrays(a._words, b._words);
  }

  readonly version = 6;
  private readonly _words: number[];
  private _string: string | null = null;

  private constructor(words: number[]) {
    this._words = words;
  }

  toString(): string {
    if (this._string === null) {
      this._string = formatIPv6(this._words).toLowerCase();
    }
    return this._string;
  }

  cidr(bits: number): IPRange {
    const first = new IPv6(mask(this._words, bits, 16, 0));
    const last = new IPv6(mask(this._words, bits, 16, 1));
    return new IPRange(first, last);
  }
}

export type IP = IPv4 | IPv6;

export namespace IP {
  export function parse(string: string): IP | null {
    return IPv4.parse(string) || IPv6.parse(string);
  }

  export function cmp(a: IP, b: IP): number {
    if (a.version === 6 && b.version === 6) {
      return IPv6.cmp(a, b);
    } else if (a.version === 4 && b.version === 4) {
      return IPv4.cmp(a, b);
    } else if (a.version !== b.version) {
      return a.version < b.version ? -1 : 1;
    } else {
      throw new TypeError("type mismatch");
    }
  }
}

function mask<T extends number[]>(
  array: T,
  bits: number,
  bitsPerItem: number,
  bitValue: 0 | 1
): T {
  const itemMask = (1 << bitsPerItem) - 1;

  const copy = array.slice();
  for (let i = 0; i < array.length; i++) {
    const leftBits = Math.min(
      Math.max(0, (i + 1) * bitsPerItem - bits),
      bitsPerItem
    );
    copy[i] &= (itemMask << leftBits) & itemMask;
    copy[i] |= bitValue * ((1 << leftBits) - 1);
  }
  return copy as T;
}

export class IPRange {
  static parse(string: string): IPRange | null {
    if (string.indexOf("/") >= 0) {
      const match = string.match(/^([^/]+)\/(\d+)$/);
      if (!match) {
        return null;
      }
      const ip = IP.parse(match[1]);
      if (!ip) {
        return null;
      }
      const bits = Number(match[2]);
      if ((ip.version === 4 && bits > 32) || (ip.version === 6 && bits > 128)) {
        return null;
      }
      return ip.cidr(bits);
    } else if (string.indexOf("-") >= 0) {
      const pieces = string.split("-");
      if (pieces.length > 2) {
        return null;
      }
      let first = IP.parse(pieces[0]);
      let last = IP.parse(pieces[1]);
      if (!first || !last || first.version !== last.version) {
        return null;
      }
      return new IPRange(first as any, last as any);
    } else {
      const ip = IP.parse(string);
      return ip && new IPRange(ip as any, ip as any);
    }
  }

  readonly first: IP;
  readonly last: IP;
  readonly version: 4 | 6;

  constructor(first: IPv4, last: IPv4);
  constructor(first: IPv6, last: IPv6);
  constructor(first: IP, last: IP) {
    if (first.version !== last.version) {
      throw new TypeError("incompatible IP versions");
    }
    if (IP.cmp(first, last) > 0) {
      this.first = last;
      this.last = first;
    } else {
      this.first = first;
      this.last = last;
    }
    this.version = first.version;
  }
}
