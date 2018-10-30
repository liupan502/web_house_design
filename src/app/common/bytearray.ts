/**
 * Created by Administrator on 2017/3/6.
 */
var base64 = require('base64-js');
var CryptoJS = require("crypto-js");
var pako = require('pako');

export class ByteArray {
  protected data: Array<number> = [];

  constructor(str: string) {
    if (str) {
      this.fromString(str);
    }
  }

  public static decrypt(str:string):string{
    str = str.replace(/\n/g, '');
    let ba:ByteArray = new ByteArray(str);
    return ba.decodeBase64().decrypt().uncompress().toString();
  }

  public static encrypt(str:string):string{
    let ba:ByteArray = new ByteArray(str);
    return ba.compress().encrypt().encodeBase64().toString();
  }

  public fromString(str: string): ByteArray {
    this.data = [];
    for (let i: number = 0; i < str.length; i++) {
      let code: number = str.charCodeAt(i);
      if (code > 0x0 && code <= 0x7f) {
        //单字节
        //UTF-16 0000 - 007F
        //UTF-8  0xxxxxxx
        this.data.push(code);
      } else if (code >= 0x80 && code <= 0x7ff) {
        //双字节
        //UTF-16 0080 - 07FF
        //UTF-8  110xxxxx 10xxxxxx
        this.data.push(
          //110xxxxx
          (0xc0 | ((code >> 6) & 0x1f)),
          //10xxxxxx
          (0x80 | (code & 0x3f)));
      } else if (code >= 0x800 && code <= 0xffff) {
        //三字节
        //UTF-16 0800 - FFFF
        //UTF-8  1110xxxx 10xxxxxx 10xxxxxx
        this.data.push(
          //1110xxxx
          (0xe0 | ((code >> 12) & 0xf)),
          //10xxxxxx
          (0x80 | ((code >> 6) & 0x3f)),
          //10xxxxxx
          (0x80 | (code & 0x3f)));
      }
    }
    return this;
  }

  public toString(): string {
    let result: string = "";
    for (let i: number = 0; i < this.data.length; ++i) {
      let code0: number = this.data[i];
      if (((code0 >> 7) & 0xff) == 0x0) {
        //单字节  0xxxxxxx
        result += String.fromCharCode(code0);
      } else if (((code0 >> 5) & 0xff) == 0x6) {
        //双字节  110xxxxx 10xxxxxx
        let code1 = this.data[i + 1];
        let bytes = [];
        bytes.push(code0 & 0x1f);
        bytes.push(code1 & 0x3f);
        result += (String.fromCharCode((bytes[0] << 6) | bytes[1]));
        i += 1;
      } else if (((code0 >> 4) & 0xff) == 0xe) {
        //三字节  1110xxxx 10xxxxxx 10xxxxxx
        let code1 = this.data[i + 1];
        let code2 = this.data[i + 2];
        let bytes = [];
        bytes.push((code0 << 4) | ((code1 >> 2) & 0xf));
        bytes.push(((code1 & 0x3) << 6) | (code2 & 0x3f));
        result += (String.fromCharCode((bytes[0] << 8) | bytes[1]));
        i += 2;
      }
    }
    return result;
  }

  public toHex(): string {
    let result: string = "";
    let code: string = "0123456789abcdef";
    // if ((this.data instanceof Array) || (this.data instanceof Uint8Array)) {
    if (this.data instanceof Array) {
      for (let i: number = 0; i < this.data.length; ++i) {
        result += code[((this.data[i] & 0xF0) >> 4) & 0xF];
        result += code[this.data[i] & 0xF];
      }
    }
    return result;
  }

  public fromHex(str: string): ByteArray {
    this.data = [];
    let code: string = "0123456789abcdef";
    for (let i = 0; i < str.length; i += 2) {
      this.data.push(code.indexOf(str[i]) * 16 + code.indexOf(str[i + 1]));
    }
    return this;
  }

  public compress(): ByteArray {
    // Uint8Array[]
    let data:Uint8Array = pako.deflate(this.data);
    if(data) {
      this.data = [];
      for(var i = 0; i < data.byteLength; ++i) {
        this.data.push(data[i]);
      }

      // Hack. To make it compatible with Flex's ByteArray.compress
      if(this.data[0] == 120 && this.data[1] == 156) {
        this.data[1] = 218;
      }
    }
    return this;
  }

  public uncompress(): ByteArray {
    try {
      // Hack. To make it compatible with Flex's ByteArray.uncompress
      if (this.data[0] == 120 && this.data[1] == 218) {
        this.data[1] = 156;
      }

      let data:Uint8Array = pako.inflate(this.data);
      if (data) {
        this.data = [];
        for (var i:number = 0; i < data.byteLength; ++i) {
          this.data.push(data[i]);
        }
      }
    } catch (err) {
      console.log(err);
    }
    return this;
  }

  /*
   var text = "#rawString#";
   var key = CryptoJS.enc.Base64.parse("#base64Key#");
   var iv  = CryptoJS.enc.Base64.parse("#base64IV#");

   var encrypted = CryptoJS.AES.encrypt(text, key, {iv: iv});
   console.log(encrypted.toString());

   var decrypted = CryptoJS.AES.decrypt(encrypted, key, {iv: iv});
   console.log(decrypted.toString(CryptoJS.enc.Utf8));


   var data = "Test String";
   var key  = CryptoJS.enc.Latin1.parse('1234567812345678');
   var iv   = CryptoJS.enc.Latin1.parse('1234567812345678');

   //加密
   var encrypted = CryptoJS.AES.encrypt(data,key,{iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding});
   , padding: CryptoJS.pad.Pkcs7
   */
  public encrypt(): ByteArray {

    let key = CryptoJS.enc.Utf8.parse("f056380ed970b169");
    let iv = CryptoJS.enc.Utf8.parse("912467427a354o9x");

    let byteData = new Uint8Array(this.data);
    let wordData = new CryptoJS.lib.WordArray.init(byteData);
    let encrypted = CryptoJS.DES.encrypt(wordData, key, {iv: iv, mode: CryptoJS.mode.CBC});
    let str = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    this.fromHex(str);
    return this;
  }

  public decrypt(): ByteArray {

    let key = CryptoJS.enc.Utf8.parse("f056380ed970b169");
    let iv = CryptoJS.enc.Utf8.parse("912467427a354o9x");
    let byteData = new Uint8Array(this.data);
    let wordData = new CryptoJS.lib.WordArray.init(byteData);
    let cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: wordData
    });
    let decrypt = CryptoJS.DES.decrypt(cipherParams, key, {iv: iv, mode: CryptoJS.mode.CBC});
    let str = decrypt.toString(CryptoJS.enc.Hex);
    this.fromHex(str);
    return this;
  }

  public encodeBase64(): ByteArray {
    let str = base64.fromByteArray(this.data);

    this.data = [];
    for (let i:number = 0; i < str.length; i++) {
      this.data.push(str.charCodeAt(i));
    }
    return this;
  }

  public decodeBase64(): ByteArray {
    let str = this.toString();
    this.data = base64.toByteArray(str);
    return this;
  }

  public concat(other): ByteArray {
    if ((!(other.data instanceof Array)) && (!(other.data instanceof Uint8Array))) {
      return;
    }
    if (!this.data) {
      this.data = [];
    }
    for (let i:number = 0; i < other.data.length; ++i) {
      this.data.push(other.data[i]);
    }
    return this;
  }

}
