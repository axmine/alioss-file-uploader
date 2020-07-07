import { Files, Options, Sts, OptionsLimitUnit } from './src/Dto/Types.dto';
import {
  formatAccept,
  formatLimit,
  formatSize,
  createInput,
  doVaildate,
  createUploader
} from './src/utils'

export class Alioss {
  files: Array<Files>;
  options: Options;
  constructor () {
    this.options = {
      accept: '',
      size: { width: 0, height: 0, scale: 1, aspectRatio: '', error: 0 },
      limit: { min: 0, max: 10, unit: OptionsLimitUnit.MB },
      https: true,
      multiple: false
    };
    this.files = [];
  }
  upload (sts: Sts | Promise<Sts>, callBack: Function, options?:Options):void {
    Object.assign(this.options, options);
    Object.assign(this.options, {
      size: formatSize(this.options.size),
      accept: formatAccept(this.options.accept),
      limit: formatLimit(this.options.limit)
    });
    const input = createInput(options);
    input.click();
    const _this = this;
    input.addEventListener('change', async function (e): Promise<void> {
      const blobs = e.path[0].files;
      try {
        await doVaildate(blobs, _this.options);
        createUploader(blobs, sts, callBack, _this.options);
      } catch (err) {
        callBack(err);
      }
    });
  }
}