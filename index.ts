import type {ExcaliburGraphicsContext, GraphicOptions} from "excalibur";
import {BaseAlign, Color, FontStyle, Graphic, TextAlign, Vector} from "excalibur";
import {TextRenderer} from "./renderer";

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

    private renderer: TextRenderer;

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
        this.renderer = new TextRenderer(
            this.text,
            this.fontFamily,
            this.fontStyle,
            this.bold,
            this.fontSize,
            this.textAlign,
            this.baseAlign,
            this.lineHeight,
            this.wrapWidth,
            this.color,
            this.outlineColor,
            this.outlineWidth,
            this.shadowColor,
            this.shadowOffset,
            this.shadowBlurRadius
        );
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
        this.renderer = this.renderer.updateIfRequired(
            this.text,
            this.fontFamily,
            this.fontStyle,
            this.bold,
            this.fontSize,
            this.textAlign,
            this.baseAlign,
            this.lineHeight,
            this.wrapWidth,
            this.color,
            this.outlineColor,
            this.outlineWidth,
            this.shadowColor,
            this.shadowOffset,
            this.shadowBlurRadius
        );
        this.renderer.renderImage(ex, x, y);
    }
}
