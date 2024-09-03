import type Message from "./Message";
import type User from "./User";
import type Client from "../Client";
import type { PollLayoutType } from "../Constants";
import type { GetPollAnswerUsersOptions, PollAnswer, PollResults, RawPoll } from "../types/channels";
import type { JSONPoll, PollQuestion } from "../types";
export default class Poll {
    allowMultiselect: boolean;
    answers: Array<PollAnswer>;
    client: Client;
    expiry: Date;
    layoutType: PollLayoutType;
    message: Message;
    question: PollQuestion;
    results: PollResults;
    constructor(data: RawPoll, client: Client, message: Message);
    /** The user that created this poll. */
    get creator(): User;
    /** End this poll now. */
    expire(): Promise<void>;
    /**
     * Get the users that voted on a poll answer.
     * @param answerID The ID of the poll answer to get voters for.
     * @param options The options for getting the voters.
     */
    getAnswerUsers(answerID: number, options?: GetPollAnswerUsersOptions): Promise<Array<User>>;
    toJSON(): JSONPoll;
}
