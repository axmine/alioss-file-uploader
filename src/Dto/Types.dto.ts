// export enum OptionsLimitUnit { KB = 'kb', MB = 'mb', GB = 'gb', TB = 'tb' }

// files 成员 DTO
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

// options 成员 DTO
export interface Options {
  accept?: string | Array<string>;
  size?: OptionsSize;
  limit?: OptionsLimit;
  https?: boolean;
  multiple?: boolean;
}
// options.size属性
export interface OptionsSize {
  width?: number;
  height?: number;
  scale?: number;
  aspectRatio?: string;
  error?: number
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

// Sts DTO
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
  realWidth: number,
  realHeight: number
}