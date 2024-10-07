const { WebClient } = require('@slack/web-api');

// Slack API 설정
const toekn = process.env.SLACK_BOT_TOKEN;
const slack = new WebClient(toekn);

// 슬랙에 메세지 전달
async function postMessage(channel_id, result) {
    const result = await slack.chat.postMessage({
        channel: channel_id,
        text: result
    })
};

module.exports = {
    postMessage
};