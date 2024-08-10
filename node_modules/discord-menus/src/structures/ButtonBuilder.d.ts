declare type buttonStyle = 'BLURPLE' | 'GREY' | 'GREEN' | 'RED' | 'URL';
interface EmojiOptions {
    name?: string;
    id?: string;
    animated?: boolean;
}
/**
 * Class symbolizing a `ButtonBuilder`
 * @class
 */
export declare class ButtonBuilder {
    /**
     * The button type
     * @default 2
     */
    type: number;
    /**
     * If the button is disabled or not
     * @default false
     */
    disable?: boolean;
    /**
     * The button style
     * @default 1
     */
    style?: buttonStyle | number;
    /**
     * The button label
     */
    label: string | any;
    /**
     * The button emoji
     */
    emoji?: EmojiOptions;
    /**
     * The button custom ID
     */
    customID?: string;
    /**
     * The button URL
     */
    URL?: string;
    /**
     * @constructor
     * Create a new ButtonBuilder
     */
    constructor();
    /**
     * Set the button label
     * @param {string} label
     * @returns {ButtonBuilder}
     * @example
     * new ButtonBuilder().setLabel('Some label');
     */
    setLabel(label: string): ButtonBuilder;
    /**
     * Set the button style.
     * Available styles:
     * * BLURPLE (1)
     * * GREY (2)
     * * GREEN (3)
     * * RED (4)
     * * URL (5)
     * @param {buttonStyle|number} style
     * @returns {ButtonBuilder}
     * @default 1
     * @example
     * new ButtonBuilder().setStyle('GREEN');
     * // Or using number
     * new ButtonBuilder().setStyle(3);
     */
    setStyle(style: buttonStyle | number): ButtonBuilder;
    /**
     * Set the button emoji
     * @param {string} emoji
     * @returns {ButtonBuilder}
     * @example
     * new ButtonBuilder().setEmoji('👌');
     */
    setEmoji(emoji: string): ButtonBuilder;
    /**
     * Set the button id
     * @param id
     * @returns {ButtonBuilder}
     * @example
     * new ButtonBuilder().setID('some_id_using_underscores');
     */
    setID(id: string): ButtonBuilder;
    /**
     * Set the button URL. *The button style must be `URL (5)`*
     * @param {string} url
     * @returns {ButtonBuilder}
     * @example
     * new ButtonBuilder().setURL('valid URL');
     */
    setURL(url: string): ButtonBuilder;
    /**
     * Set the disable parameter. *The button style musn't be `URL (5)`*
     * @param {boolean} state
     * @returns {ButtonBuilder}
     * @example new ButtonBuilder().setDisable(false);
     */
    setDisable(state?: boolean): ButtonBuilder;
    /**
     * Get the json content of the button
     * @returns {Object}
     * @example new ButtonBuilder().getJson()
     */
    getJSON(): object;
    private _isEmoji;
    private _testURL;
}
export {};
