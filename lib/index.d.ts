import { Files, Options, Sts } from './src/Dto/Types.dto';
export declare class Alioss {
    files: Array<Files>;
    options: Options;
    constructor();
    upload(sts: Sts | Promise<Sts>, callBack: Function, options?: Options): void;
}
