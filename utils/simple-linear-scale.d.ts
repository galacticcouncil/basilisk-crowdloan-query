declare module 'simple-linear-scale' {
    type scaleFunction = (from: number) => number;
    export default (from: number[], to: number[]) => scaleFunction;
}