import {chain} from "@softwareventures/chain";
import {
    concatMapFn,
    filterFn,
    foldFn,
    mapFn,
    pairwise,
    pushFn,
    scanFn
} from "@softwareventures/iterable";

interface MeasureLineOptions {
    readonly context: CanvasRenderingContext2D;
    readonly text: string;
    readonly fontSize: number;
    readonly lineHeight: number;
}

interface LineMetrics {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
    readonly width: number;
}

function measureLine(options: MeasureLineOptions): LineMetrics {
    const metrics = options.context.measureText(options.text);
    if (metrics.actualBoundingBoxLeft == null) {
        return {
            left: metrics.width + options.fontSize * 2,
            right: metrics.width + options.fontSize * 2,
            top: options.lineHeight + options.fontSize * 2,
            bottom: options.lineHeight + options.fontSize * 2,
            width: metrics.width
        };
    } else {
        return {
            left: Math.trunc(metrics.actualBoundingBoxLeft) + 1,
            right: Math.trunc(metrics.actualBoundingBoxRight) + 1,
            top: Math.trunc(metrics.actualBoundingBoxAscent) + 1,
            bottom: Math.trunc(metrics.actualBoundingBoxDescent) + 1,
            width: metrics.width
        };
    }
}

interface WrapTextOptions extends MeasureLineOptions {
    readonly wrapWidth: number;
}

interface WrappedText {
    readonly lines: string[];
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}

interface AppendWrappedTextLineOptions {
    readonly wrappedText: WrappedText;
    readonly line: {
        readonly text: string;
        readonly metrics: LineMetrics;
    };
    readonly lineHeight: number;
}

function appendWrappedTextLine(options: AppendWrappedTextLineOptions): WrappedText {
    return {
        lines: [...options.wrappedText.lines, options.line.text],
        left: Math.max(options.wrappedText.left, options.line.metrics.left),
        right: Math.max(options.wrappedText.right, options.line.metrics.right),
        top: Math.max(
            options.wrappedText.top,
            options.line.metrics.top - options.lineHeight * options.wrappedText.lines.length
        ),
        bottom: Math.max(
            options.wrappedText.bottom,
            options.line.metrics.bottom + options.lineHeight * options.wrappedText.lines.length
        )
    };
}

interface WrapTextAccumulator {
    readonly line: string;
    readonly metrics: LineMetrics;
    readonly newLine: boolean;
}

export function wrapText(options: WrapTextOptions): WrappedText {
    const first: WrapTextAccumulator = {
        line: "",
        metrics: {left: 0, right: 0, top: 0, bottom: 0, width: 0},
        newLine: false
    };
    const last: WrapTextAccumulator = {
        line: "",
        metrics: {left: 0, right: 0, top: 0, bottom: 0, width: 0},
        newLine: true
    };

    return chain(options.text.split(/\n/u))
        .map(mapFn(line => ({line, metrics: measureLine({...options, text: line})})))
        .map(
            concatMapFn(({line, metrics}) =>
                metrics.width <= options.wrapWidth
                    ? [{line, metrics}]
                    : chain(line.split(/\s/u))
                          .map(
                              scanFn((accumulator: WrapTextAccumulator, word) => {
                                  const line =
                                      accumulator.line === ""
                                          ? word
                                          : `${accumulator.line} ${word}`;
                                  const metrics = measureLine({...options, text: line});
                                  if (metrics.width > options.wrapWidth && line !== word) {
                                      return {
                                          line: word,
                                          metrics: measureLine({...options, text: word}),
                                          newLine: true
                                      };
                                  } else {
                                      return {line, metrics, newLine: false};
                                  }
                              }, first)
                          )
                          .map(pushFn(last))
                          .map(pairwise)
                          .map(filterFn(([_, b]) => b.newLine))
                          .map(mapFn(([{line, metrics}]) => ({line, metrics}))).value
            )
        )
        .map(
            foldFn(
                (wrappedText: WrappedText, {line, metrics}) =>
                    appendWrappedTextLine({
                        wrappedText,
                        line: {text: line, metrics},
                        lineHeight: options.lineHeight
                    }),
                {
                    lines: [],
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            )
        ).value;
}
