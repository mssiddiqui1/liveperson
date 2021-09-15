const https = require('https')
const websocket = require('ws')
const url = 'wss://va.msg.liveperson.net/ws_api/account/73392194/messaging/consumer?v=3'
var token = "";
	
console.log("*************** Main Script Starting *********************");


/***************************************/
// Main Script
/***************************************/	

var req = https.request(postOptions("/api/account/73392194/signup"), res => {
	res.setEncoding('utf8');
	var returnData = "";

	res.on('data', chunk => {
		returnData = returnData + chunk;
	});

	res.on('end', () => {
		
		var result = JSON.parse(returnData);

		token = result["jwt"];
		console.log("*************** Token Generated " + token + "*********************");
		
		
		var options = {
			headers: {
				"Authorization" : "JWT " + token
			}
		}
		
		const connection = new websocket(url,options)
		connection.onopen = () => {
		  console.log("*************** WebSocket Opened - Starting Conversation *********************");
		  connection.send('{"kind":"req","id":1,"type":"cm.ConsumerRequestConversation"}') 
		}
		 
		connection.onerror = (error) => {
		  console.log('WebSocket error: ${error}')
		}
		 
		connection.onmessage = (e) => {

		  var result = JSON.parse(e.data);
		  
			if(result["type"]=="cm.RequestConversationResponse"){
				
				
				body = result["body"];
				conversationId = body["conversationId"];
				console.log("*************** Sending Message *********************");
				
				connection.send('{"kind":"req","id":2,"type":"ms.PublishEvent","body":{"dialogId":"'+  conversationId  +'","event":{"type":"ContentEvent","contentType":"text/plain","message":"My first message"}}}') 
					
			} else{
				
				console.log("*************** Message Sucessfully Sent *********************");
				connection.close();
				console.log("*************** Connection Closed *********************");
			} 
		  

		}
									
		
		
	});
	
		
});

var jsonString = "{}";
req.write(jsonString);
req.end();
				
					

/***************************************/
// Function postOptions 
/***************************************/	

function postOptions(restPath){
	var options = {
	  host: 'va.idp.liveperson.net',
	  port: 443,
	  method: 'POST',
	  path: restPath,
	  headers: {
	  'Content-Type': 'application/json'
	  }
	}
	return options;
}
	
	