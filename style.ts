import {BaseAlign, FontStyle, TextAlign} from "excalibur";

export function lookupTextAlign(textAlign: TextAlign): CanvasTextAlign {
    switch (textAlign) {
        case TextAlign.Left:
            return "left";
        case TextAlign.Right:
            return "right";
        case TextAlign.Center:
            return "center";
        case TextAlign.End:
            return "end";
        case TextAlign.Start:
            return "start";
    }
}

export function lookupBaseAlign(baseAlign: BaseAlign): CanvasTextBaseline {
    switch (baseAlign) {
        case BaseAlign.Alphabetic:
            return "alphabetic";
        case BaseAlign.Bottom:
            return "bottom";
        case BaseAlign.Hanging:
            return "hanging";
        case BaseAlign.Ideographic:
            return "ideographic";
        case BaseAlign.Middle:
            return "middle";
        case BaseAlign.Top:
            return "top";
    }
}

export function lookupFontStyle(fontStyle: FontStyle): string {
    switch (fontStyle) {
        case FontStyle.Italic:
            return "italic";
        case FontStyle.Normal:
            return "normal";
        case FontStyle.Oblique:
            return "oblique";
    }
}

export function lookupFontWeight(bold: boolean): string {
    return bold ? "bold" : "normal";
}
