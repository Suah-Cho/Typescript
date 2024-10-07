require('dotenv').config()
const fs = require("fs")
const os = require('os');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const { App } = require('@slack/bolt');
const echarts = require('echarts');
const { createCanvas } = require('canvas');
// const { Pool } = require('pg');
const jp = require('jsonpath');
const {query2csv} = require("./db_util");

// API_MODE = process.env.API_MODE
DB_USER = process.env.DB_USERNAME
DB_PASSWORD = process.env.DB_PASSWORD
DB_HOST = process.env.DB_HOST
DB_PORT = process.env.DB_PORT
DB_NAME = process.env.DB_NAME

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN ,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3100
});

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: 5432,
//     ssl: {
//         rejectUnauthorized: true, // or false if you're using self-signed certificates
//     },
// });

// app.message('hello', async ({ message, say }) => {
//     // say() sends a message to the channel where the event was triggered
//     await say(`Hey there <@${message.user}>!`);
//     await say({
//         text: `Hey there <@${message.user}>!`,
//         thread_ts: message.ts  // This will reply in the thread
//     });
// });

const ALL_TEAMS = [
    {
        "name": "Tomatonuts",
        "comp_id": "7ca2cfb5-bdba-4bb0-88a9-d57bfaf09e3a",
        "installed_device_id": "11171e89-832c-426f-be83-7c91046d29ec"
    },
    {
        "name": "MuGrow",
        "comp_id": "a5846191-07ec-44c4-8bbe-6235f817d0a4",
        "installed_device_id": "3e03df02-0194-4c8f-ad66-dfa68bf9446d"
    },
    {
        "name": "Agrifusion",
        "comp_id": "badb4361-c756-4cd2-8ce8-f7d1b26449e7",
        "installed_device_id": "cf704233-7364-4998-8e70-833ba1af3e7c"
    },
    {
        "name": "Reference",
        "comp_id": "1b72fa75-dfd0-47e0-9ca3-c808f00f4222",
        "installed_device_id": "d87deae6-76d6-4239-a556-ce1ef850aa7a"
    },
    {
        "name": "IDEAS",
        "comp_id": "a3204ebf-105b-4dc4-a6cf-d2895023726c",
        "installed_device_id": "1d5acb6d-88ee-4385-a0aa-61edfa9334c7"
    },
    {
        "name": "Trigger",
        "comp_id": "cb9f8868-3302-4c7c-a6cc-ab542ce4b293",
        "installed_device_id": "9c97ac1c-6dfd-4deb-9c18-8dff800ffbc0"
    }
]

const ALL_VENDOR_DATA_TYPES = [
    'expected outside RH', 'radiation', 'water supply', 'expected outside temperature', 'plant density', 'temperature greenhouse', 'outside RH', 'vent wind', 'RH greenhouse', 'day of harvest', 'expected radiation', 'CO2 greenhouse', 'PAR outside measurement', 'PAR 1', 'energy curtain', 'black-out curtain', 'camera', 'outside temperature', 'vent lee'
]

const TEMPERATURE_VENDOR_DATA_TYPES = [
    'expected outside temperature', 'temperature greenhouse','outside temperature'
]

const HUMIDITY_VENDOR_DATA_TYPES = [
    'outside RH','RH greenhouse','expected outside RH',
]

const LIGHT_VENDOR_DATA_TYPES = [

]


// app.message('button', async ({ message, say }) => {
//     // say() sends a message to the channel where the event was triggered
//     await say({
//         thread_ts: message.ts,
//         blocks: [
//             {
//                 "type": "section",
//                 "text": {
//                     "type": "mrkdwn",
//                     "text": `Hey there <@${message.user}>!`
//                 },
//                 "accessory": {
//                     "type": "button",
//                     "text": {
//                         "type": "plain_text",
//                         "text": "Click Me"
//                     },
//                     "action_id": "button_click"
//                 }
//             },{
//                 "type": "section",
//                 "text": {
//                     "type": "mrkdwn",
//                     "text": `other message`
//                 },
//                 "accessory": {
//                     "type": "button",
//                     "text": {
//                         "type": "plain_text",
//                         "text": "Click Me too!"
//                     },
//                     "action_id": "button_click2"
//                 }
//             },{
//                 "type": "section",
//                 "text": {
//                     "type": "mrkdwn",
//                     "text": `other message3`
//                 },
//                 "accessory": {
//                     "type": "button",
//                     "text": {
//                         "type": "plain_text",
//                         "text": "Click Me too!"
//                     },
//                     "action_id": "button3"
//                 }
//             }
//         ],
//         text: `Hey there <@${message.user}>!`
//     });
// });
//

// app.action('button_click', async ({ body, ack, say }) => {
//     // Acknowledge the action
//     await ack();
//     await say({text: `<@${body.user.id}> clicked the button`, thread_ts: message.ts });
// });


// app.command("/help", async ({ command, ack, say }) => {
//     try {
//         await ack();
//         say("Yaaay! that command works!");
//     } catch (error) {
//         console.log("err")
//         console.error(error);
//     }
// });


// app.action('button_click2', async ({ body,ack, say }) => {
//     // Acknowledge the button request
//     await ack();
//
//     let r = await say('now start query...')
//
//     console.log('!!!', r)
//
// });




app.command('/querydb', async ({ command, ack, say }) => {
    await ack();

    // Query the database
    try {
        // const result = await pool.query('SELECT * FROM compartments'); // Replace 'your_table' with actual table name
        //
        // if (result.rowCount === 0) {
        //     return say("No results found.");
        // }
        //
        // // Generate CSV file from query result using a temporary file
        // const tempFile = path.join(os.tmpdir(), `query_result_${Date.now()}.csv`);
        //
        // const headers = Object.keys(result.rows[0]).map(key => ({ id: key, title: key }));
        // const writer = csvWriter({
        //     path: tempFile,
        //     header: headers,
        // });
        //
        // await writer.writeRecords(result.rows);

        const tempFile = await query2csv("raw_data.raw_crawling_gh_data_item",{
            start_time: '2024-09-01',
            end_time: '2024-10-01',
            comp_id: 'badb4361-c756-4cd2-8ce8-f7d1b26449e7',
            installed_device_ids: ['cf704233-7364-4998-8e70-833ba1af3e7c'],
            vender_data_type_ids: ALL_VENDOR_DATA_TYPES
        })

        // Upload CSV file to Slack
        try {
            const uploadResult = await app.client.files.uploadV2({
                channels: command.channel_id,
                file: fs.createReadStream(tempFile),
                filename: 'query_result.csv',
                title: 'Database Query Result'
            });

            console.log('File uploaded successfully:', uploadResult);
        } catch (error) {
            console.error('Error uploading CSV to Slack:', error);
            return say("Failed to upload the result file.");
        }

    } catch (error) {
        console.error('Database query failed:', error);
        return say("An error occurred while querying the database.");
    }
});


/**
 * modal submit handler
 */
app.view('view_1', async({body, payload, view, ack, ...rest}) =>{
    // console.log( 'body',body, payload, view, ack)
    // const team = jp.query(view.state.values, '$..["team_select-action"]')

    let fromDate ='1900-01-01'
    let toDate ='1900-01-01'
    let teamUUID = null
    let chartOrCsv = null


    let xxx = JSON.parse(view.private_metadata)
    // console.log('xxx',xxx.channel_id)

    const inputs = jp.query(view,'$.blocks[?(@.type=="input")]')
    inputs.forEach((inObj)=>{
        // let vv = jp.query(view.state.values, '$["'+ inObj.block_id +`"]["${inObj.element.action_id}"]`)

        let vv = view.state.values[inObj.block_id][inObj.element.action_id]

        switch(vv.type) {
            case "radio_buttons":
                chartOrCsv = vv.selected_option.value;
                break;
            case 'static_select':
                teamUUID = vv.selected_option.value;
                break;
            case 'datepicker':
                if(inObj.element.action_id === 'datepicker-to-action') {
                    toDate = vv.selected_date
                }else {
                    fromDate = vv.selected_date
                }
                break;
        }

        // console.log('vv',vv)
    })

    await ack();


    let installed_device_id = ALL_TEAMS.find(v=>v.comp_id == teamUUID).installed_device_id

    if(chartOrCsv == 'CHART') {

    }else {
        const tempFile = await query2csv("raw_data.raw_crawling_gh_data_item",{
            start_time: fromDate,
            end_time: toDate,
            comp_id: teamUUID,
            installed_device_ids: [installed_device_id],
            vender_data_type_ids: ALL_VENDOR_DATA_TYPES
        })

        // Upload CSV file to Slack
        try {
            const uploadResult = await app.client.files.uploadV2({
                channels: xxx.channel_id,
                file: fs.createReadStream(tempFile),
                filename: 'query_result.csv',
                title: 'Database Query Result'
            });

            console.log('File uploaded successfully:', uploadResult);
        } catch (error) {
            console.error('Error uploading CSV to Slack:', error);
            return say("Failed to upload the result file.");
        }

    }
})

// Listen for a slash command invocation
app.command('/wur', async ({command, ack, body, client, logger }) => {
    // Acknowledge the command request
    await ack();

    try {
        // Call views.open with the built-in client
        const result = await client.views.open({
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: body.trigger_id,
            // View payload
            view: {
                type: 'modal',
                // View identifier
                callback_id: 'view_1',
                title: {
                    type: 'plain_text',
                    text: '챌린지 데이타 조회'
                },
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: '기간과 팀, 표시방법을 선택해 주세요'
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "radio_buttons",
                            "options": [
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "*챠트*",
                                        "emoji": true
                                    },
                                    "value": "CHART"
                                },
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "*CSV file*",
                                        "emoji": true
                                    },
                                    "value": "CSV"
                                }
                            ],
                            "action_id": "result-type-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "표시방법",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "static_select",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select TEAM",
                                "emoji": true
                            },
                            "options": ALL_TEAMS.map(v=>{
                                return {
                                    "text": {
                                        "type": "plain_text",
                                        "text": `*${v.name}*`,
                                        "emoji": true
                                    },
                                    "value": v.comp_id
                                }
                            }),
                            "action_id": "team_select-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "어느 TEAM의 데이타를 조회할까요?",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "datepicker",
                            // "initial_date": "1990-04-28",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select a date",
                                "emoji": true
                            },
                            "action_id": "datepicker-from-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "기간 시작일자를 선택해 주세요",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "datepicker",
                            // "initial_date": "1990-04-28",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select a date",
                                "emoji": true
                            },
                            "action_id": "datepicker-to-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "기간 종료일자를 선택해 주세요",
                            "emoji": true
                        }
                    },
                ],
                submit: {
                    type: 'plain_text',
                    text: 'Submit'
                },
                private_metadata: JSON.stringify({
                    channel_id: command.channel_id
                })
            }
        });
        logger.info(result);
    }
    catch (error) {
        logger.error(error);
    }
});



app.command('/generate-chart', async ({ command, ack, say }) => {
    await ack();

    const option = {
        title: {
            text: 'Stacked Line'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Email',
                type: 'line',
                stack: 'Total',
                data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
                name: 'Union Ads',
                type: 'line',
                stack: 'Total',
                data: [220, 182, 191, 234, 290, 330, 310]
            },
            {
                name: 'Video Ads',
                type: 'line',
                stack: 'Total',
                data: [150, 232, 201, 154, 190, 330, 410]
            },
            {
                name: 'Direct',
                type: 'line',
                stack: 'Total',
                data: [320, 332, 301, 334, 390, 330, 320]
            },
            {
                name: 'Search Engine',
                type: 'line',
                stack: 'Total',
                data: [820, 932, 901, 934, 1290, 1330, 1320]
            }
        ]
    };


    const canvas = createCanvas(800, 600);
// ECharts can use the Canvas instance created by node-canvas as a container directly
    let chart = echarts.init(canvas);

// setOption as normal
    chart.setOption(option);

    const buffer = canvas.toBuffer('image/png');

// If chart is no longer useful, consider disposing it to release memory.
    chart.dispose();
    chart = null;

    // Convert the canvas to an image
    const imgData = canvas.toDataURL('image/png');

    // Upload the image to Slack
    try {
        const response = await app.client.files.uploadV2({
            channels: command.channel_id,
            file: buffer,
            filename: "chart.png",
            title: 'Generated Chart',
        });
    } catch (error) {
        console.error('Error uploading image:', error);
    }
});



app.action('button3', async ({ body, say, client ,ack}) => {
    await ack();

    const channelId = body.channel.id;
    const imagePath = '/Users/changjin/Desktop/aaaaa.png'; // Replace with your actual image path

    const message = body.message;

    // Check if it's part of a thread
    const thread_ts = message.thread_ts ? message.thread_ts : message.ts;

    try {
        // Open the image file as binary
        // Upload the file to Slack
        const result = await client.files.uploadV2({
            channel_id: channelId,
            file: imagePath,
            filename: 'chart_sample.png',
            // initial_comment: 'generated chart'
        });


        let xxxacc = await client.files.getUploadURLExternal({filename: 'chart_sample.png', length: 205934} )

        console.log('File uploaded:1', result.files);
        console.log('File uploaded:2', xxxacc);
        console.log('File uploaded:3', xxxacc.file_id);


        // Send a message confirming the upload success
        await say({
            thread_ts: thread_ts,
            'text':'sample single text',
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Kin Khao*\n:star::star::star::star: 1638 reviews\n The sticky rice also goes wonderfully with the caramelized pork belly, which is absolutely melt-in-your-mouth and so soft."
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg",
                        "alt_text": "alt text for image"
                    }
                },
                {
                    "type": "divider"
                },

            ]
        })

    } catch (error) {
        console.error('Error uploading image:', error);
        await say(`Failed to upload image: ${error.message}`);
    }
});


app.event('app_mention', async ({ event, context, client, say }) => {
    try {
        await say({"blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Thanks for the mention <@${event.user}>! Here's a button`
                    },
                    "accessory": {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Button",
                            "emoji": true
                        },
                        "value": "click_me_123",
                        "action_id": "first_button"
                    }
                }
            ]});
    }
    catch (error) {
        console.error(error);
    }
});


(async () => {
    // Start your app
    await app.start(process.env.PORT || 3100);

    console.log('⚡️ Bolt app is running!');
})();