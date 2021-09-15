const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
//const m_port = 2000;

//var teams = require('botbuilder-teams');
const sessionId = uuid.v4();
var request = require('request');

//const sessionId = uuid.v4();

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});  
// Code for Teams ----- starts
const {ActivityTypes,
  CardFactory,
  MessageFactory,
  BotFrameworkAdapter} = require('botbuilder');
const protoToJson = require('./botlib/proto_to_json.js');
//const dialogflowSessionClient =
    //require('./botlib/dialogflow_session_client.js');
const filterResponses = require('./botlib/filter_responses.js');
//const express = require('express');
//const app = express();
//const projectId = 'bot123-317810';
const projectId = 'gen01-avhp';
const appId = '92d0118f-8ab1-4ba8-849e-294e4fb2cc73';
const appPassword = '.-8V58SPq.seW2_gNK-mhRU2-09dibvYrh';

// Create bot adapter, which defines how the bot sends and receives messages.
let adapter = new BotFrameworkAdapter({
  appId: appId,
  appPassword: appPassword
});

const dialogflowSessionClient = require('./botlib/dialogflow_session_client.js');
const sessionClient = new dialogflowSessionClient(projectId);
app.post('/api/messages', (req, res) => {

  //console.log('Hoedieeeee')
  
  // Use the adapter to process the incoming web request into a TurnContext object.
  adapter.processActivity(req, res, async (turnContext) => {

    if (isMessage(turnContext)) {
     console.log('Hiiiiiiii')
     //var text1 = teams.TeamsMessage.getTextWithoutMentions(req.message);
     //console.log('Hiiiiiiii'+ text1)
     
      const utterance = getMessageText(turnContext);
      const senderId = turnContext.activity.from.id;
      const payload = turnContext.activity;
      
      console.log('utterance########## -- '+utterance)
      console.log('senderId########## -- '+senderId)
      console.log('payload########## -- '+payload.protoToJson)
      //const responses = (await sessionClient.detectIntent(utterance, senderId, payload)).fulfillmentMessages;
      //const filteredResponses = await filterResponses.filterResponses(responses, 'TEAMS');
      const response=await runSample(utterance);
      //res.send({Reply:response})
      console.log('TheDataa########## -- '+response)

      //const replies = await convertToTeamsMessage(turnContext, responses);
      // Check for attachments and cards and quick replies --- starts
      console.log('Here is response message---> '+response.message)
      /* switch (response.message) {
        case 'text': {
          reply.text = response.text.text[0];
        }
          break;

        case 'image': {
          reply.attachments = [(CardFactory.heroCard(
              '',
              CardFactory.images([response.image.imageUri])
          ))];
        }
          break;

        case 'card': {
          const buttons = response.card.buttons;
          let skypeButtons = [];
          if (Array.isArray(buttons) && buttons.length > 0) {
            buttons.forEach((button) => {
              if (button.postback.startsWith('http')) {
                skypeButtons.push({
                  type: 'openUrl',
                  title: button.text,
                  value: button.postback
                });
              } else {
                skypeButtons.push({
                  type: 'postBack',
                  title: button.text,
                  value: button.postback
                });
              }
            });
            reply.attachments = [(CardFactory.heroCard(
                response.card.title,
                response.card.subtitle,
                CardFactory.images([response.card.imageUri]),
                skypeButtons))];
          }
        }
          break;

        case 'quickReplies': {
          reply = MessageFactory.suggestedActions(
              response.quickReplies.quickReplies, response.quickReplies.title);
        }
          break; */
      // Check for attachments and cards and quick replies --- ends

      const replies = [];
      let reply = {type: ActivityTypes.Message};
      
      //reply.text = response;
      //return replies;
      if (response.includes("http")) {
        reply.attachments = [(CardFactory.heroCard(
            '',
            CardFactory.images([response])
        ))];
      } else {

        reply.text = response;
      }
      replies.push(reply);
      await turnContext.sendActivities(replies);
      
    } else{
      console.log('There is no incoming message .... ')
    }
  });
});

function turnContextType(turnContext) {
  return turnContext.activity.type;
}

function isMessage(turnContext){
  return turnContextType(turnContext) === 'message';
}

function getMessageText(turnContext) {
  return turnContext.activity.text;
}
// Code for Teams -----  ends

app.use(bodyParser.urlencoded({

  extended:false
}))

 app.post('/send-msg',(req,res)=>{

    runSample(req.body.MSG).then(data=>{
    res.send({Reply:data})
    
  })

}) 

var imageUrl='';

console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg,projectId = 'gen01-avhp') {
  // A unique identifier for the given session
  //const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
      //keyFilename:"C:/LIPU_DRIVE/Chat_Bot_Quentelli/BOT_TEST/bot123-317810-0207492e3400.json"
      keyFilename:"D:/BB_Q/BOT_TEST/gen01-avhp-76bd04e4c3ca.json"
  });
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');

  console.log('Responses ---> '+responses.message);
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);

  console.log(`  Response TryToFetch: ${result.fulfillmentMessages[0]}`);
  //console.log(`  Response2-------- : ${result.fulfillmentMessages[0].card.imageUri}`);
  if(result.fulfillmentMessages[0].image !== undefined) {
     
    console.log(`  Response2 in if block-------- : ${result.fulfillmentMessages[0].card.imageUri}`);

    imageUrl=result.fulfillmentMessages[0].card.imageUri;
  }

  for (let x in result.fulfillmentMessages) {
    console.log(x + ": "+ result.fulfillmentMessages[x])
 }
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  /* if (!imageUrl==='') {
    return imageUrl;
  }
  else {
    return result.fulfillmentText; 
  } */
  //return result.fulfillmentText;
  return result.fulfillmentMessages[0].text !== undefined ? result.fulfillmentMessages[0].text.text[0] : result.fulfillmentMessages[0].card.imageUri;
}

//const request1 = require('request');
console.log('Hello from here$$$$$$$$')
app.get('/flask', function(req, res) {
  request('http://127.0.0.1:81/flask', function (error, response, body) {
      console.error('error:', error); // Print the error
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the data received
      res.send(body); //Display the response on the website
    });      
});

app.listen(port,()=>{
  console.log('Running on PORT --- '+port)
})

