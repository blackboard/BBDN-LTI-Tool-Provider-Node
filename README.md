

# BBDN-LTI-Tool-Provider-Node
This project is a multi-purpose application designed to demonstrate several integration methods available with Blackboard Learn. The application is an LTI 1.1 and 2.0 Tool Provider.
Upon launch of the LTI Tool, the user is given a few options:

- Send Outcomes: Send a Grade to the Tool Consumer with LTI Outcomes
- Caliper: Register your Tool as a Caliper Provider and then emit an event to the caliper service. In addition, an endpoint is provided to consume caliper events from the Blackboard Learn server.
- Blackboard REST: Finally, the application provides a method to retrieve a REST token and then retrieve the user and course objects based on the UUID passed in the LTI launch.
- Return to Learn: This will take the return URL in the LTI Launch and return the user to that place in Blackboard Learn. If no URL is provided, the user is returned to the top-level domain they came from.

## Requirements
- [Node and npm](http://nodejs.org)

## How To Run the code
All packages needed are in the package.json. 

You should have node installed (built with v4.2.2). Then from the project directory at the command line, type npm start. This will install all of your dependencies and start the server.

Access the application via http://localhost:3000. You can customize the host name and port number by creating a config/config_override.json file (see the config/config.json file for a template)

To launch the LTI 1 tool, you must launch into the application as an LTI Tool with the url, http://localhost:3000/lti.

## Usage
The application is very simple in its current iteration. Essentially there is one page with a bunch of buttons. Click the one you want. I
f you are testing caliper, ensure you click the register caliper button at least once. This registers your tool with Blackboard and provides the application with the API Key and Caliper end point.
Also, if you wish to ingest Blackbaord's caliper events, you will need to register your application as a caliper event store, which is done in Blackboard Learn.

See the <a href="https://community.blackboard.com/community/developers/standards" target="_blank">community site</a> for more details.


## Developing
This is not meant to be a Node.JS tutorial. It is simply an example of how one might implement the various features therein. Pull requests are welcome!


# LTI 2.0 Tool Provider

## Requirements

- [Redis](http:redis.io) - Optional if you want to persist the Tool Proxy that is generated

## Installation

1. Install Redis to store the tool proxies that are generated. On Mac it's easiest to `brew install redis`. The code assumes the default
host and port (localhost:6379). If you need to run redis on a different host or port, update your config_override.json
2. Install the application: `npm install`
3. Start the server: `npm start`
4. View in browser at http://localhost:8008

## Configuration

You can override the external domain and port for the server by creating config/config_override.json (see config/config.json)

## LTI 2 Registration

The registration URL is http://localhost:3000/registration

## LTI 2 Tool Settings

The tool settings UI can be reached at the root: 
http://localhost:3000/

## LTI 2 Outcomes

The outcomes UI for getting and receiving results is part of the page is shown when an link is launched from Learn.

