export const STRING_UTIL: {
  getReverseFirstDifferentIndex: (string1: string, string2: string) => number;
} = {

  getReverseFirstDifferentIndex: (first, second) => {
    let big = second;
    let small = first;
    let isGrown = true;
    if (first.length > second.length) {
      big = first;
      small = second;
      isGrown = false;
    }
    let bigLast = big.length - 1;
    let smallLast = small.length - 1;
    while (smallLast > -1) {
      if (small[smallLast] !== big[bigLast])
        break;
      smallLast--;
      bigLast--;
    }
    return isGrown ? bigLast : smallLast;
  }

};
