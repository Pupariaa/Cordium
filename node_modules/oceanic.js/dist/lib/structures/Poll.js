"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Poll {
    allowMultiselect;
    answers;
    client;
    expiry;
    layoutType;
    message;
    question;
    results;
    constructor(data, client, message) {
        Object.defineProperty(this, "client", {
            value: client,
            enumerable: false,
            writable: false,
            configurable: false
        });
        this.allowMultiselect = data.allow_multiselect;
        this.answers = data.answers.map(a => ({
            answerID: a.answer_id,
            pollMedia: a.poll_media
        }));
        this.expiry = new Date(data.expiry);
        this.layoutType = data.layout_type;
        this.message = message;
        this.question = data.question;
        const res = data.results || { answer_counts: [], is_finalized: false };
        this.results = {
            answerCounts: res.answer_counts.map(a => ({
                count: a.count,
                id: a.id,
                meVoted: a.me_voted,
                users: []
            })),
            isFinalized: res.is_finalized
        };
        // this makes working with this much easier as a developer. We still have systems in place to insert missing answerCounts, if needs be
        for (const answer of data.answers) {
            if (!this.results.answerCounts.some(a => a.id === answer.answer_id)) {
                this.results.answerCounts.push({
                    count: 0,
                    id: answer.answer_id,
                    meVoted: false,
                    users: []
                });
            }
        }
    }
    /** The user that created this poll. */
    get creator() {
        return this.message.author;
    }
    /** End this poll now. */
    async expire() {
        await this.client.rest.channels.expirePoll.call(this.client.rest.channels, this.message.channelID, this.message.id);
    }
    /**
     * Get the users that voted on a poll answer.
     * @param answerID The ID of the poll answer to get voters for.
     * @param options The options for getting the voters.
     */
    async getAnswerUsers(answerID, options) {
        return this.client.rest.channels.getPollAnswerUsers.call(this.client.rest.channels, this.message.channelID, this.message.id, answerID, options);
    }
    toJSON() {
        return {
            allowMultiselect: this.allowMultiselect,
            answers: this.answers,
            expiry: this.expiry.toISOString(),
            layoutType: this.layoutType,
            question: this.question,
            results: this.results
        };
    }
}
exports.default = Poll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9zdHJ1Y3R1cmVzL1BvbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSxNQUFxQixJQUFJO0lBQ3JCLGdCQUFnQixDQUFVO0lBQzFCLE9BQU8sQ0FBb0I7SUFDM0IsTUFBTSxDQUFVO0lBQ2hCLE1BQU0sQ0FBTztJQUNiLFVBQVUsQ0FBaUI7SUFDM0IsT0FBTyxDQUFVO0lBQ2pCLFFBQVEsQ0FBZTtJQUN2QixPQUFPLENBQWM7SUFDckIsWUFBWSxJQUFhLEVBQUUsTUFBYyxFQUFFLE9BQWdCO1FBQ3ZELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNsQyxLQUFLLEVBQVMsTUFBTTtZQUNwQixVQUFVLEVBQUksS0FBSztZQUNuQixRQUFRLEVBQU0sS0FBSztZQUNuQixZQUFZLEVBQUUsS0FBSztTQUN0QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLFFBQVEsRUFBRyxDQUFDLENBQUMsU0FBUztZQUN0QixTQUFTLEVBQUUsQ0FBQyxDQUFDLFVBQVU7U0FDMUIsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxh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