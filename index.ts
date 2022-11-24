import type {ExcaliburGraphicsContext, GraphicOptions} from "excalibur";
import {BaseAlign, Color, FontStyle, Graphic, TextAlign, Vector} from "excalibur";
import {notNull} from "@softwareventures/nullable";
import {wrapText} from "./wrap";
import {lookupBaseAlign, lookupFontStyle, lookupFontWeight, lookupTextAlign} from "./style";

export interface TextOptions extends GraphicOptions {
    /**  The text to draw. */
    readonly text?: string | undefined;

    /** The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web
     * fonts are supported, same as in CSS. */
    readonly fontFamily?: string | undefined;

    /** The font style for the label.
     *
     * @default FontStyle.Normal */
    readonly fontStyle?: FontStyle | undefined;

    /** True if the text is bold.
     *
     * @default false */
    readonly bold?: boolean | undefined;

    /** The font size in pixels.
     *
     * @default 10 */
    readonly fontSize?: number | undefined;

    /** Horizontal text alignment.
     *
     * @default TextAlign.Left */
    readonly textAlign?: TextAlign | undefined;

    /** Baseline alignment.
     *
     * @default BaseAlign.Alphabetic */
    readonly baseAlign?: BaseAlign | undefined;

    /** The height of each line of text in pixels, for multiline text.
     *
     * Set to `undefined` to use the font size as the line height.
     *
     * @default undefined */
    readonly lineHeight?: number | undefined;

    /** The maximum width of a line of text, in pixels, after which the text
     * will wrap to the next line.
     *
     * Set to `Infinity` to disable text wrapping.
     *
     * @default Infinity */
    readonly wrapWidth?: number | undefined;

    /** The color of the text.
     *
     * @default Color.Black */
    readonly color?: Color | undefined;

    /** The color of the text outline. Set to `Color.Transparent` to hide the outline.
     *
     * @default Color.Transparent */
    readonly outlineColor?: Color | undefined;

    /** The width of the text outline, in pixels. Set to `0` to hide the outline.
     *
     * @default 0 */
    readonly outlineWidth?: number | undefined;

    /** The color of the shadow. Set to `Color.Transparent` to hide the shadow.
     *
     * @default Color.Transparent */
    readonly shadowColor?: Color | undefined;

    /** The offset of the shadow from the text, in pixels.
     *
     * @default Vector.Zero */
    readonly shadowOffset?: Vector | undefined;

    /** Radius of the shadow blur in pixels.
     *
     * @default 0 */
    readonly shadowBlurRadius?: number | undefined;
}

export default class Text extends Graphic {
    /**  The text to draw. */
    public text: string;

    /** The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web
     * fonts are supported, same as in CSS. */
    public fontFamily: string;

    /** The font style for the label. */
    public fontStyle: FontStyle;

    /** True if the text is bold. */
    public bold: boolean;

    /** The font size in pixels. */
    public fontSize: number;

    /** Horizontal text alignment. */
    public textAlign: TextAlign;

    /** Baseline alignment. */
    public baseAlign: BaseAlign;

    /** The height of each line of text in pixels, for multiline text.
     *
     * Set to `undefined` to use the font size as the line height. */
    public lineHeight: number | undefined;

    /** The maximum width of a line of text, in pixels, after which the text
     * will wrap to the next line.
     *
     * Set to `Infinity` to disable text wrapping. */
    public wrapWidth: number;

    /** The color of the text. */
    public color: Color;

    /** The color of the text outline. Set to `Color.Transparent` to hide the outline. */
    public outlineColor: Color;

    /** The width of the text outline, in pixels. Set to `0` to hide the outline. */
    public outlineWidth: number;

    /** The color of the shadow. Set to `Color.Transparent` to hide the shadow. */
    public shadowColor: Color;

    /** The offset of the shadow from the text, in pixels. */
    public shadowOffset: Vector;

    /** Radius of the shadow blur in pixels. */
    public shadowBlurRadius: number;

    public constructor(options: TextOptions) {
        super(options);
        this.text = options.text ?? "";
        this.fontFamily = options.fontFamily ?? "sans-serif";
        this.fontStyle = options.fontStyle ?? FontStyle.Normal;
        this.bold = options.bold ?? false;
        this.fontSize = options.fontSize ?? 10;
        this.textAlign = options.textAlign ?? TextAlign.Left;
        this.baseAlign = options.baseAlign ?? BaseAlign.Alphabetic;
        this.lineHeight = options.lineHeight;
        this.wrapWidth = options.wrapWidth ?? Infinity;
        this.color = options.color ?? Color.Black;
        this.outlineColor = options.outlineColor ?? Color.Transparent;
        this.outlineWidth = options.outlineWidth ?? 0;
        this.shadowColor = options.shadowColor ?? Color.Transparent;
        this.shadowOffset = options.shadowOffset ?? Vector.Zero;
        this.shadowBlurRadius = options.shadowBlurRadius ?? 0;
    }

    public clone(): Text {
        return new Text({
            text: this.text,
            fontFamily: this.fontFamily,
            fontStyle: this.fontStyle,
            bold: this.bold,
            fontSize: this.fontSize,
            textAlign: this.textAlign,
            baseAlign: this.baseAlign,
            lineHeight: this.lineHeight,
            wrapWidth: this.wrapWidth,
            color: this.color,
            outlineColor: this.outlineColor,
            outlineWidth: this.outlineWidth,
            shadowColor: this.shadowColor,
            shadowOffset: this.shadowOffset,
            shadowBlurRadius: this.shadowBlurRadius
        });
    }

    protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void {
        const canvas = document.createElement("canvas");
        const context = notNull(canvas.getContext("2d"));
        const lineHeight = this.lineHeight ?? this.fontSize;

        this.setCanvasTextProperties(context);
        const wrappedLines = wrapText({
            context,
            text: this.text,
            wrapWidth: this.wrapWidth,
            fontSize: this.fontSize,
            lineHeight
        });

        const {lines} = wrappedLines;
        const left = wrappedLines.left + this.shadowBlurRadius * 2;
        const right = wrappedLines.right + this.shadowBlurRadius * 2;
        const top = wrappedLines.top + this.shadowBlurRadius * 2;
        const bottom = wrappedLines.bottom + this.shadowBlurRadius * 2;

        canvas.width = left + right;
        canvas.height = top + bottom;

        this.setCanvasTextProperties(context);
        context.translate(left, top);

        lines.forEach((line, i) => void context.strokeText(line, 0, i * lineHeight));
        lines.forEach((line, i) => void context.fillText(line, 0, i * lineHeight));

        if (this.shadowColor.a === 0) {
            ex.drawImage(canvas, x - left, y - top);
        } else {
            const canvas2 = document.createElement("canvas");
            canvas2.width = canvas.width;
            canvas2.height = canvas.height;
            const context2 = notNull(canvas2.getContext("2d"));
            context2.shadowBlur = this.shadowBlurRadius;
            context2.shadowColor = this.shadowColor.toString();
            context2.shadowOffsetX = this.shadowOffset.x;
            context2.shadowOffsetY = this.shadowOffset.y;
            context2.drawImage(canvas, 0, 0);
            ex.drawImage(canvas2, x - left, y - top);
        }
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
