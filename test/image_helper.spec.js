import { expect } from "chai"
import { append_all } from '../src/image_helper'

const mochaAsync = (fn) => {
  return done => {
    fn.call().then(done, err => {
      done(err);
    });
  };
};

describe('#append_all()', () => {
  this.timeout(15000);
  it('合并图片', mochaAsync(async () => {
    const output = await append_all('ZW', '保理', '/Users/lichong/Temp/baidu_doc');
    expect(output).to.equal('/Users/lichong/Temp/baidu_doc/保理.png');
  }));
});