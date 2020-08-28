import { OptionsSize, OptionsLimit, OptionsLimitOutPut, Options } from './Dto/Types.dto';
export declare function formatSize(size: OptionsSize): OptionsSize;
export declare function formatLimit(val: OptionsLimit): OptionsLimitOutPut;
export declare function formatAccept(val: string | Array<string>): string | Array<string>;
export declare function doVaildate(blobs: any, options: any): Promise<void>;
export declare function createInput(options: Options): any;
export declare function createUploader(blobs: any, sts: any, callBack: any, options: any): Promise<void>;
