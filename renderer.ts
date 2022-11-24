import type {
    BaseAlign,
    Color,
    ExcaliburGraphicsContext,
    FontStyle,
    TextAlign,
    Vector
} from "excalibur";
import {notNull} from "@softwareventures/nullable";
import {BoundingBox} from "excalibur";
import {lookupBaseAlign, lookupFontStyle, lookupFontWeight, lookupTextAlign} from "./style";
import {wrapText} from "./wrap";

export class TextRenderer {
    private cache: Cache | null = null;

    public constructor(
        private readonly text: string,
        private readonly fontFamily: string,
        private readonly fontStyle: FontStyle,
        private readonly bold: boolean,
        private readonly fontSize: number,
        private readonly textAlign: TextAlign,
        private readonly baseAlign: BaseAlign,
        private readonly lineHeight: number | undefined,
        private readonly wrapWidth: number,
        private readonly color: Color,
        private readonly outlineColor: Color,
        private readonly outlineWidth: number,
        private readonly shadowColor: Color,
        private readonly shadowOffset: Vector,
        private readonly shadowBlurRadius: number
    ) {}

    public get localBounds(): BoundingBox {
        return this.updateCache().bounds;
    }

    public updateIfRequired(
        text: string,
        fontFamily: string,
        fontStyle: FontStyle,
        bold: boolean,
        fontSize: number,
        textAlign: TextAlign,
        baseAlign: BaseAlign,
        lineHeight: number | undefined,
        wrapWidth: number,
        color: Color,
        outlineColor: Color,
        outlineWidth: number,
        shadowColor: Color,
        shadowOffset: Vector,
        shadowBlurRadius: number
    ): TextRenderer {
        return text === this.text &&
            fontFamily === this.fontFamily &&
            fontStyle === this.fontStyle &&
            bold === this.bold &&
            fontSize === this.fontSize &&
            textAlign === this.textAlign &&
            baseAlign === this.baseAlign &&
            lineHeight === this.lineHeight &&
            wrapWidth === this.wrapWidth &&
            color === this.color &&
            outlineColor === this.outlineColor &&
            outlineWidth === this.outlineWidth &&
            shadowColor === this.shadowColor &&
            shadowOffset === this.shadowOffset &&
            shadowBlurRadius === this.shadowBlurRadius
            ? this
            : new TextRenderer(
                  text,
                  fontFamily,
                  fontStyle,
                  bold,
                  fontSize,
                  textAlign,
                  baseAlign,
                  lineHeight,
                  wrapWidth,
                  color,
                  outlineColor,
                  outlineWidth,
                  shadowColor,
                  shadowOffset,
                  shadowBlurRadius
              );
    }

    public renderImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
        const cache = this.updateCache();
        ex.drawImage(cache.canvas, x + cache.bounds.left, y + cache.bounds.top);
    }

    private updateCache(): Cache {
        if (this.cache == null) {
            const canvas = document.createElement("canvas");
            const context = notNull(canvas.getContext("2d"));
            this.setCanvasTextProperties(context);
            const lineHeight = this.lineHeight ?? this.fontSize;
            const wrappedText = wrapText({
                context,
                text: this.text,
                wrapWidth: this.wrapWidth,
                fontSize: this.fontSize,
                lineHeight
            });
            const lines = wrappedText.lines;
            const left = wrappedText.left + Math.max(0, Math.ceil(this.outlineWidth));
            const right = wrappedText.right + Math.max(0, Math.ceil(this.outlineWidth));
            const top = wrappedText.top + Math.max(0, Math.ceil(this.outlineWidth));
            const bottom = wrappedText.bottom + Math.max(0, Math.ceil(this.outlineWidth));

            const canvas2 = this.shadowColor.a === 0 ? canvas : document.createElement("canvas");
            canvas2.width = left + right;
            canvas2.height = top + bottom;

            const context2 = canvas2 === canvas ? context : notNull(canvas2.getContext("2d"));

            context2.translate(left, top);
            this.setCanvasTextProperties(context2);
            lines.forEach((line, i) => void context2.strokeText(line, 0, i * lineHeight));
            lines.forEach((line, i) => void context2.fillText(line, 0, i * lineHeight));

            if (canvas === canvas2) {
                this.cache = {
                    canvas,
                    bounds: new BoundingBox({
                        left: -left,
                        right,
                        top: -top,
                        bottom
                    })
                };
            } else {
                const shadowCompositeLeft = Math.max(
                    0,
                    Math.trunc(this.shadowBlurRadius * 2 - this.shadowOffset.x) + 1
                );
                const shadowCompositeTop = Math.max(
                    0,
                    Math.trunc(this.shadowBlurRadius * 2 - this.shadowOffset.y) + 1
                );

                const shadowLeft = left + shadowCompositeLeft;
                const shadowRight =
                    right +
                    Math.max(0, Math.trunc(this.shadowBlurRadius * 2 + this.shadowOffset.x) + 1);
                const shadowTop = top + shadowCompositeTop;
                const shadowBottom =
                    bottom +
                    Math.max(0, Math.trunc(this.shadowBlurRadius * 2 + this.shadowOffset.y) + 1);

                canvas.width = shadowLeft + shadowRight;
                canvas.height = shadowTop + shadowBottom;
                context.shadowBlur = this.shadowBlurRadius;
                context.shadowColor = this.shadowColor.toString();
                context.shadowOffsetX = this.shadowOffset.x;
                context.shadowOffsetY = this.shadowOffset.y;
                context.translate(shadowCompositeLeft, shadowCompositeTop);
                context.drawImage(canvas2, 0, 0);

                this.cache = {
                    canvas,
                    bounds: new BoundingBox({
                        left: -shadowLeft,
                        right: shadowRight,
                        top: -shadowTop,
                        bottom: shadowBottom
                    })
                };
            }
        }

        return this.cache;
    }

    private setCanvasTextProperties(context: CanvasRenderingContext2D): void {
        context.textAlign = lookupTextAlign(this.textAlign);
        context.textBaseline = lookupBaseAlign(this.baseAlign);
        context.font = `${lookupFontStyle(this.fontStyle)} ${lookupFontWeight(this.bold)} ${
            this.fontSize
        }px ${this.fontFamily}`;
        context.lineWidth = this.outlineWidth * 2;
        context.strokeStyle =
            this.outlineWidth === 0 ? "transparent" : this.outlineColor.toString();
        context.fillStyle = this.color.toString();
    }
}

interface Cache {
    readonly canvas: HTMLCanvasElement;
    readonly bounds: BoundingBox;
}
