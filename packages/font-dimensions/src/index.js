// @flow

export const TO =  -1; // used to indicate ranges of numbers
export const ASCII = [1, TO, 127];
export const MAORI = [256, 257, 274, 275, 298, 299, 332, 333, 362, 363];

export const CHARSET = {
  EN: [...ASCII],
  NZ: [...ASCII, ...MAORI]
};

export const charsetLength = (charset) => {
  let len = 0;
  let i = 0;
  while(i < charset.length) {
    if(charset[i] === TO) {
      len += charset[i + 1] - charset[i - 1];
      len ++;
      i++;
    }
    i++;
  }
  return len;
}


export default {
  dimensions: (charset=CHARSET.NZ) => {

    let i = 0;
    const tick = () => {

    }
    const resolve = () => {

    }

    return new Promise(resolve, reject);
  }
}
