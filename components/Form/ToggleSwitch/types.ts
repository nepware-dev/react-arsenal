export interface ToggleSwitchProps {
    /**
     * CSS styling applied to the container div.
     */
    containerClassName?: string;
    /**
     * CSS styling applied to the switch component.
     */
    className?: string;
    /**
     * CSS styling applied to the thumb.
     */
    thumbClassName?: string;
    /**
     * Name for the input component.
     */
    name?: string;
    /**
     * Function called when the toggle input is changed.
     */
    onChange?: (payload: { name?: string; value: boolean }) => void;
    /**
     * Use to set controlled value for the input.
     */
    value?: boolean;
    /**
     * Determines the size of the track. This value is twice the height.
     */
    size?: number;
    /**
     * Whether or not the input is 'on' (i.e., true) initially.
     */
    onByDefault?: boolean;
    /**
     * Whether or not the input is disabled.
     */
    disabled?: boolean;
}
