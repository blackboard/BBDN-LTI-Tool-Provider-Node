

# BBDN-LTI-Tool-Provider-Node
This project is a multi-purpose application designed to demonstrate several integration methods available with Blackboard Learn. The application is an LTI 1.1 Tool Provider. Upon launch, the user is given a few options:

- Send Outcomes: Send a Grade to the Tool Consumer with LTI Outcomes
- Caliper: Register your Tool as a Caliper Provider and then emit an event to the caliper service. In addition, an endpoint is provided to consume caliper events from the Blackboard Learn server.
- Blackboard REST: Finally, the application provides a method to retrieve a REST token and then retrieve the user and course objects based on the UUID passed in the LTI launch.
- Return to Learn: This will take the return URL in the LTI Launch and return the user to that place in Blackboard Learn. If no URL is provided, the user is returned to the top-level domain they came from.

## How To Run the code
All packages needed are in the package.json. 

You should have node installed (built with v0.10.33). Then from the project directory at the command line, type npm install. This will install all of your dependencies.

Then simply type node app.js and access the application via http://localhost:3000. If you want to run on an actual web server, you can change the port in the app.js file.

To access, you must launch into the application as a LTI Tool.

## Usage
The application is very simple in its current iteration. Essentially there is one page with a bunch of buttons. Click the one you want. If you are testing caliper, ensure you click the register caliper button at least once. This registers your tool with Blackboard and provides the application with the API Key and Caliper end point. Also, if you wish to ingest Blackbaord's caliper events, you will need to register your application as a caliper event store, which is done in Blackboard Learn.

See the community site for more details.


## Developing
This is not meant to be a Node.JS tutorial. It is simply an example of how one might implement the various features therein. Pull requests are welcome!


### Packages

- ims-lti
- ims-caliper
- express
- jade
- nodash
- finish
- oauth-signature
- uuid