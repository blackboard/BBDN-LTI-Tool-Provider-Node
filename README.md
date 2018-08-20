

# BBDN-LTI-Tool-Provider-Node
This project is a multi-purpose application designed to demonstrate several integration methods available with Blackboard Learn. The application is an LTI 1.1 and 2.0 Tool Provider.
Upon launch of the LTI Tool, the user is given a few options:

- Send Outcomes: Send a Grade to the Tool Consumer with LTI Outcomes
- Caliper: Register your Tool as a Caliper Provider and then emit an event to the caliper service. In addition, an endpoint is provided to consume caliper events from the Blackboard Learn server.
- Blackboard REST: The application provides a method to retrieve a REST token and then retrieve the user and course objects based on the UUID passed in the LTI launch.
- Content Item Message: The application provides a method to send Content Item Messages back to Learn simulating a Content provider. This provides a menu of predefined message loads as well as the option to add a custom load.
- Membership Service: Request members for course that launched the tool.
- Return to Learn: This will take the return URL in the LTI Launch and return the user to that place in Blackboard Learn. If no URL is provided, the user is returned to the top-level domain they came from.

## Requirements
- [Node and npm](http://nodejs.org)

## How To Run the code
All packages needed are in the package.json. 

You should have node installed (built with v7.1.0). Then from the project directory at the command line, type `npm start`. This will install all of your dependencies and start the server.

Access the application via http://localhost:3000. You can customize the host name and port number by creating a server/config/config_override.json file (see the server/config/config.json file for a template)

### Base LTI 1.1.x functionality and Membership service
To launch the LTI 1 tool, you must launch into the application as an LTI Tool with the url, http://localhost:3000/lti.

### Content Item Message
To launch the Content Provider simulation call the tool with this url, http://localhost:3000/CIMRequest.
Add the parameter "custom_option" with a value of 1 - 5 (e.g. CIMRequest?custom_option=1) and the corresponding predefined message load from the menu


## Usage
The application is very simple in its current iteration. Essentially there is one page with a bunch of buttons. Click the one you want. I
f you are testing caliper, ensure you click the register caliper button at least once. This registers your tool with Blackboard and provides the application with the API Key and Caliper end point.
Also, if you wish to ingest Blackbaord's caliper events, you will need to register your application as a caliper event store, which is done in Blackboard Learn.

See the <a href="https://community.blackboard.com/community/developers/standards" target="_blank">community site</a> for more details.


## Developing
This is not meant to be a Node.JS tutorial. It is simply an example of how one might implement the various features therein. Pull requests are welcome!


# LTI 1.3 Tool

Implementation of IMS Global LTI v1.3 and LTI Advantage

## Requirements

Connection access to a copy of the Blackboard Developer's Portal (devportal) to register this node application as a tool.

**_Note_:** Make sure you copy all important information provided during registation
- Issuer
- Public Keyset URL
- Auth Token Endpoint
- Tool Private Key ( this **CANNOT** be retrieved at a later date as it is not stored in the devportal )

Additional data
- Dev portal host

This data can be entered using http://localhost:3000/setup

[Redis](http:redis.io) - Required to persist the tool data

- Install Redis to store the tool proxies that are generated. On Mac it's easiest to `brew install redis`. The code assumes the default
host and port (localhost:6379). If you need to run redis on a different host or port, update your config_override.json

### Base LTI 1.3 tool launch
The normal LTI Resource link should launch to http://localhost:3000/lti13.

### Assignment and Grade Services 2.0
TBD

### Names and Roles Provisioning Services 2.0
TBD

### Deep Linking 2.0
The Deep Linking Request should launch to http://localhost:3000/deeoLinkkOptions to be able to select content items and counts to return. Possible content items are:
- LTI Link
- Content Link
- File
- Image
- HTML fragment

The Deep Linking Request should launch to http://localhost:3000/deepLinkContent to return fixed content containing:
- 1 LTI Link
- 1 Content Link

# LTI 2.0 Tool Provider

## Requirements

- [Redis](http:redis.io) - Required to persist the Tool Proxy that is generated

## Installation

1. Install Redis to store the tool proxies that are generated. On Mac it's easiest to `brew install redis`. The code assumes the default
host and port (localhost:6379). If you need to run redis on a different host or port, update your config_override.json
2. Install the application: `npm install`
3. Start the server: `npm start`
4. View in browser at http://localhost:3000

## Configuration

You can override the external domain and port for the server by creating server/config/config_override.json (see server/config/config.json)

## LTI 2 Registration

The registration URL is http://localhost:3000/registration

## LTI 2 Tool Settings

The tool settings UI can be reached at the root: 
http://localhost:3000/

## LTI 2 Outcomes

The outcomes UI for getting and receiving results is part of the page is shown when an link is launched from Learn.

# Docker

Docker specific files are included (Dockerfile, docker-compose.yml, launch.sh).

Use config_override.json (same entries as config.json) to override redis host name from localhost to redis so it can access the redis docker container.

If running the docker image on the same machine as the learn instance then the docker-compose.yml needs to contain the ip address of the machine being used. Start containers using __docker-compose up__

## Marathon

config_override.json needs to be included in the docker image that is loaded onto Marathon.

These entries allow are required
*  "provider_domain": "https://lti-tool.dev.bbpd.io",
*  "provider_port": "NA",

'NA' allows the call to the marathon instance to be portless. The marathon container translates the port to 3000 so the LTI tool can process the calls.
