 # BennitAI_Server
This is a continuation of the BennitAI_backend_web. It aims to handle the new Early Access Program context. A new web UI will be developed here too.

this is the backend for the webapp as well as FB chatbot that is also currenly being extended to slack bot interface.

## Getting Started

### Creating a [IBM Bluemix][bluemix] Account

1. Go to https://bluemix.net/
2. Create a Bluemix account if required.
3. Log in with your IBM ID (the ID used to create your Bluemix account)
4. Once on the Service details page, scroll down (if necessary) and click green **Launch tool** button on the right hand side of the page. (You may be asked to log in again. or you may see a blank screen - give it a few minutes and refresh the screen). This will launch the tooling for the Conversation service, which allows you to build dialog flows and train your chatbot. This should take you to your workspace in the Conversation service which represents a unique set of chat flows and training examples. This allows you to have multiple chatbots within a single instance of the Conversation service.

5. Once on the page, you will see the option to either “Create” a new workspace, or “import” an existing one. We are going to “import” a premade chatbot for this example, so select “Import".

6. Click **Choose a file**, navigate to the `resources` directory of your clone of the repository for this project, and select the file `conversation-training-data.json`.  Once the file is selected, ensure that the “Everything (Intents, Entities, and Dialog” option is selected.

7. Click **Import** to upload the `.json` file to create a workspace and train the model used by the Conversation service.To find your workspace ID once training has completed, click the three vertical dots in the upper right-hand corner of the Workspace pane, and select **View details**.  Once the upload is complete, you will see a new workspace called “Weather Bot ASK”. In order to connect this workspace to our application, we will need to include the Workspace ID in our environment variables file “.env”.  

 Go back into your “.env” file, and paste the workspace ID next to the “WORKSPACE_ID=” entry.


**Note:** The confirmation email from Bluemix mail take up to 1 hour.

### Deploy this sample application in Bluemix


#how to install

'npm install'

You will update the `.env` with the information you retrieved in steps 6 - 9.

    The `.env` file will look something like the following:

    ```none
    USE_WEBUI=true
    ALCHEMY_API_KEY=

    #CONVERSATION
    CONVERSATION_URL=https://gateway.watsonplatform.net/conversation/api
    CONVERSATION_USERNAME=
    CONVERSATION_PASSWORD=
    WORKSPACE_ID=

    #WEATHER
    WEATHER_URL=https://twcservice.mybluemix.net/api/weather
    WEATHER_USERNAME=
    WEATHER_PASSWORD=


    #CLOUDANT
    CLOUDANT_URL=

    #FACEBOOK
    USE_FACEBOOK=false
    FACEBOOK_ACCESS_TOKEN=
    FACEBOOK_VERIFY_TOKEN=

    #TWILIO
    USE_TWILIO=false
    USE_TWILIO_SMS=false
    TWILIO_ACCOUNT_SID=
    TWILIO_AUTH_TOKEN=
    TWILIO_API_KEY=
    TWILIO_API_SECRET=
    TWILIO_IPM_SERVICE_SID=
    TWILIO_NUMBER=
    ```


#prerequesities for running Facebook bot.
1. Make a Facebook app under Facebook developers.
2. Get a Page acess token
3. Take note of app secret and app id.
4. Enter them under auth/config.js and config/fbbot_cred.js
(this will take care of all the dependencies)
#how to run
'node server.js'

#known issues
1. make sure you are not behind a proxy otherwise Google auth with node js causes trouble.
2. Don't try to build this repo currently for the webapp , currently the webapp is supported 
    by production ready repo, this is just the Mirror of actual production service.

 
###Screenshots of Running Chatbot on Web app.

 ![](readme_images/Bennit_cloent.png)

 ![](readme_images/Bennit_demo.png)

 ![](readme_images/demo_ben2.png)

###Facebook chatbot demo with sliding window functunality.

 ![](readme_images/FB_demo.png)
