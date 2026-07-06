export interface MaskProps {
    /**
     * Rect object of the element/area to mask
     */
    rect: { top: number; left: number; width: number; height: number };
    /*
     * Padding for the mask area
     * @param {Array.<{xPadding: Number, yPadding: Number}>}
     */
    padding?: [number, number];
    /**
     * Should lock the scroll when mask is active
     */
    scrollLock?: boolean;
}
