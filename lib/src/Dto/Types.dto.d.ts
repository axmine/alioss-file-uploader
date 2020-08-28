export interface Files {
    index: number;
    progress: number;
    size: number;
    file: string;
    name: string;
    url: string;
    checkpont: any;
    complete: boolean;
}
export interface Options {
    accept?: string | Array<string>;
    size?: OptionsSize;
    limit?: OptionsLimit;
    https?: boolean;
    multiple?: boolean;
}
export interface OptionsSize {
    width?: number;
    height?: number;
    scale?: number;
    aspectRatio?: string;
    error?: number;
}
export interface OptionsLimit {
    min?: number;
    max?: number;
    unit?: string;
}
export interface OptionsLimitOutPut {
    min?: number;
    max?: number;
    oMin?: number;
    oMax?: number;
    oUnit?: string;
}
export interface Sts {
    config: StsConfig;
    files: Array<string>;
}
export interface StsConfig {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
    region: string;
    bucket: string;
    stsToken: string;
}
export interface realImageSize {
    realWidth: number;
    realHeight: number;
}
