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

function parseIPv4(ipStr: string) {
  const bytes = parseIPv4Bytes(ipStr);
  if (!bytes) {
    return null;
  }
  return new IPv4(bytes);
}

class IPv4 {
  readonly version = 4;

  private _bytes: number[];
  private _string: string | null;

  constructor(bytes: number[]) {
    this._bytes = bytes;
    this._string = null;
  }

  cmp(other: IPv4 | IPv6): number {
    if (other.version !== 4) {
      return -1;
    }
    return cmpSameLengthArrays(this._bytes, other._bytes);
  }

  toString(): string {
    if (this._string === null) {
      this._string = this._bytes.join(".");
    }
    return this._string;
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

function parseIPv6(string: string) {
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

class IPv6 {
  readonly version = 6;

  private _words: any;
  private _string: any;

  constructor(words: number[]) {
    this._words = words;
    this._string = null;
  }

  cmp(other: IPv4 | IPv6): number {
    if (other.version !== this.version) {
      return 1;
    }
    return cmpSameLengthArrays(this._words, other._words);
  }

  toString(): string {
    if (this._string === null) {
      this._string = formatIPv6(this._words).toLowerCase();
    }
    return this._string;
  }
}

export default function parseIP(ipStr: string): IPv4 | IPv6 | null {
  if (ipStr.indexOf(":") >= 0) {
    return parseIPv6(ipStr);
  } else if (ipStr.indexOf(".") >= 0) {
    return parseIPv4(ipStr);
  } else {
    return null;
  }
}
