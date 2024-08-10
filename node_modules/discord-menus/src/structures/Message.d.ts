interface AuthorOptions {
    /**
     * Author ID
     */
    id: string;
    /**
     * Author username
     */
    username: string;
    /**
     * Author discriminator
     */
    discriminator: string;
    /**
     * Author tag
     */
    tag: string;
    /**
     * Author avatar
     */
    avatar: string;
    /**
     * Is the author a bot ?
     */
    bot: boolean;
}
/**
 * Class symbolizing a `Message`
 * @class
 */
export declare class Message {
    /**
     * The message ID
     */
    id: string;
    /**
     * The message type
     */
    type: number;
    /**
     * The messahe timestamp
     */
    timestamp: string;
    /**
     * The message mentions
     */
    mentions: string[];
    /**
     * The message embed
     */
    embeds: any;
    /**
     * The message content
     */
    content: string;
    /**
     * Message components
     */
    components: object | any;
    /**
     * The message channel ID
     */
    channelID: string;
    /**
     * The message author
     */
    author: AuthorOptions;
    private _token;
    private emitter;
    /**
     * Create a new Message
     * @param {any} data
     * @param {string} token
     * @constructor
     */
    constructor(data: any, token: string, emitter: any);
    /**
     * Delete the message
     * @returns {Promise<void>}
     * @example menu.message.delete();
     */
    delete(): Promise<void>;
}
export {};
