import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

import type { PasswordHasher } from "./passwordhasher";

const scrypt = promisify(scryptCallback);

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const hash = await scrypt(password, salt, 64) as Buffer;
    return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    const [algorithm, saltHex, hashHex] = passwordHash.split(":");
    if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;

    const expected = Buffer.from(hashHex, "hex");
    const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}
