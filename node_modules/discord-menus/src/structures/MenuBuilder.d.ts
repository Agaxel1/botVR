interface LabelOptions {
    /**
     * The label value
     */
    value: string;
    /**
     * The label description
     */
    description: string;
    /**
     * the label emoji
     */
    emoji?: EmojiOptions;
}
interface EmojiOptions {
    /**
     * The label emoji name
     */
    name: string;
    /**
     * The label emoji ID (id needed)
     */
    id?: string;
}
/**
 * Class symbolizing a `MenuBuilder`
 * @class
 */
export declare class MenuBuilder {
    /**
     * The menu custom ID
     */
    customID: string;
    /**
     * The menu options
     */
    options: any[];
    /**
     * The menu place holder
     */
    placeHolder: string;
    /**
     * The menu max values
     */
    maxValues: number;
    /**
     * The menu min values
     */
    minValues: number;
    constructor();
    /**
     * Add a menu label
     * @param {string} label
     * @param {LabelOptions} options
     * @returns {MenuBuilder}
     * @example new MenuBuilder().addLabel('Label', { description: 'Some description', value: 'label' })
     */
    addLabel(Label: string, options: LabelOptions): MenuBuilder;
    /**
     * Set the menu custom ID
     * @param {string} id
     * @returns {MenuBuilder}
     * @example new MenuBuilder().setCustomID('some-id-without-spaces')
     */
    setCustomID(id: string): MenuBuilder;
    /**
     * Set the menu place holder
     * @param {string} placeHolder
     * @returns {MenuBuilder}
     * @example new MenuBuilder().setPlaceHolder('cool-placeholder-without-spaces')
     */
    setPlaceHolder(placeHolder: string): MenuBuilder;
    /**
     * Set the menu min values
     * @param {number} value
     * @returns {MenuBuilder}
     * @example new MenuBuilder().setMinValues(1);
     */
    setMinValues(value: number): MenuBuilder;
    /**
     * Set the menu max values
     * @param {number} value Up to **`25`**
     * @returns {MenuBuilder}
     * @example new MenuBuilder().setMaxValues(3);
     */
    setMaxValues(value: number): MenuBuilder;
    /**
     * Return the menu JSON object
     * @returns {object}
     */
    getJSON(): object;
}
export {};
