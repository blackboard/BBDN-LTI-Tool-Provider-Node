# BBDN-LTI-Tool-Provider-Node

This project is a multi-purpose application designed to demonstrate several integration methods available with
Blackboard Learn. The application is an LTI 1.1, LTI 1.3, and Advantage Tool Provider. It also has code to emit Caliper
events, as well as act as a very basic caliper eventstore.

## Requirements

- [Node and npm](http://nodejs.org) - Installing node on Windows requires installing a number of additional packages. It
  will warn you and if you don't want the script to do it automatically, the installer will give you a link to
  instructions to run the installs manually.

## Configuration

You can override a number of configuration properties by creating a config_override.json file in server/config. Below is
an example:

```js
{
  "frontend_url": "https://example.com/",
  "provider_port": "9008",
  "database_directory": "server/src/database",
}
```

If you want to run under SSL you should use a reverse proxy, like nginx or ngrok.

## How To Run the code

All packages needed are in the package.json.

You should have node installed (built with v10.22.1). Then from the project directory at the command line,
type `npm start`. This will install all of your dependencies and start the server.

Access the application via http://localhost:3000. You can customize the host name and port number by creating a
server/config/config_override.json file (see the server/config/config.json file for a template)

### Base LTI 1.1.x functionality and Membership service

To launch the LTI 1 tool, you must launch into the application as an LTI Tool with the url, http://localhost:3000/lti.

Upon launch of the LTI Tool, the user is given a few options:

- Send Outcomes: Send a Grade to the Tool Consumer with LTI Outcomes
- Caliper: Register your Tool as a Caliper Provider and then emit an event to the caliper service. In addition, an
  endpoint is provided to consume caliper events from the Blackboard Learn server.
- Blackboard REST: The application provides a method to retrieve a REST token and then retrieve the user and course
  objects based on the UUID passed in the LTI launch.
- Deep Linking: The application provides a method to send Content Item Messages back to Learn simulating a Content
  provider. This provides a menu of predefined message loads as well as the option to add a custom load.
- Names & Roles Service: Request members for course that launched the tool.
- Assignment & Grades Service: With LTI Advantage a new service is available to get, create, and update line items in
  the gradebook.
- Return to Learn: This will take the return URL in the LTI Launch and return the user to that place in Blackboard
  Learn. If no URL is provided, the user is returned to the top-level domain they came from.

### Deep Linking 1.0

To launch the Content Provider simulation call the tool with this url, http://localhost:3000/CIMRequest for use with LTI
1.1. Add the parameter "custom_option" with a value of 1 - 5 (e.g. CIMRequest?custom_option=1) and the corresponding
predefined message load from the menu

## Usage

The application is very simple in its current iteration. Essentially there is one page with a bunch of buttons. Click
the one you want. If you are testing caliper, ensure you click the register caliper button at least once. This registers
your tool with Blackboard and provides the application with the API Key and Caliper end point. Also, if you wish to
ingest Blackbaord's caliper events, you will need to register your application as a caliper event store, which is done
in Blackboard Learn.

See
the <a href="https://docs.blackboard.com/standards/caliper/getting-started/caliper-event-store-for-learn" target="_blank">
developer documentation site</a> for more details.

## Developing

This is not meant to be a Node.JS tutorial. It is simply an example of how one might implement the various features
therein. Pull requests are welcome!

# LTI Advantage Tool

Implementation of IMS Global LTI v1.3 and LTI Advantage.

## Setup

A screencast of the rough LTI Advantage setup is shown
in [Eric Preston's demo at 23:00](https://us.bbcollab.com/recording/e193c6cb59cb4ed1a776c271665d4154).

1. Start the server with `npm start`.

   Check that you can access https://example.com/applications

   You should see the following output:

   ```sh
   Home page:                    https://example.com/
   Registered Applications List: https://example.com/applications
   LTI 1 Tool Provider:          https://example.com/lti
   LTI 1 Content Item:           https://example.com/CIMRequest
   LTI 1.3 Login URL:            https://example.com/login
   LTI 1.3 Redirect URL:         https://example.com/lti13
   LTI 1.3 Direct Target URL:    https://example.com/lti13
   LTI 1.3 Deep Linking URL:     https://example.com/deepLinkOptions
   LTI 1.3 Bobcat Target URL:    https://example.com/lti13bobcat
   LTI 1.3 Proctoring URL:       https://example.com/proctoring
   JWKS URL:                     https://example.com/.well-known/jwks.json
   Data will be saved in data
   Listening on 3000
   ```

2. Register your application on the Blackboard Developer Portal

   - Create an account on https://developer.blackboard.com .
   - Navigate to *My Apps* and register a new application
   - Enter the following fields:
     - *Application Name*: LTI 1.3 Example App
     - *Description*: LTI 1.3 example App
     - *Domain(s)*: example.com
     - *Login Initiation URL*: https://example.com/login
     - *Tool Redirect URL(s)*: https://example.com/lti13

     Click *Register application and generate API key*

   - Click *Done*
   - Make a note of the *Application ID, key, and secret*

3. Configure the server

   Navigate to https://example.com/applications and click the '+' to add your application. Enter the following into the
   fields:

   - *Application Name*: The name of your application so it's easily identifiable
   - *Application Key*: The *Application ID* from the developer portal
   - *Application Secret*: The *Application key* from the developer portal
   - *Application Id*: The *Secret* from the developer portal
   - *DevPortal URL*: Select the instance of Developer Portal that was used to create the application:
     - *Stage*: The Learn instance is registered with our beta cloud and the application was created
       at https://devportal-stage.saas.bbpd.io
     - *Production*: The majority of client and test instances are in this category. The Learn instance is registered with
       our cloud and the application was created at https://developer.blackboard.com
     - *CI*: Internal only (most developers' instances connect to blue-next and applications are created
       at https://devportal-ci.saas.bbpd.io)
       Click *SAVE*

4. Add the tool to your Learn instance

   - Sign into your Learn instance as an administrator
   - Navigate to *Administrator Tools* > *Integrations* > *LTI Tool Providers* > *Register LTI 1.3 Tool*
   - In the *Client ID* field enter the *Application ID* copied from the developer portal
   - Click *Submit*

5. Create a placement for the tool

   In the *LTI Tool Providers* list, select *LTI 1.3 Example App* > *Manage Placements* > *Create Placement*
   Enter the following fields:

   - *Label*: LTI 1.3 Example App
   - *Handle*: LTI 1.3 Example App
   - *Type*: Course tool
   - *Tool Provider URL*: https://example.com/lti13
   - Click *Submit*

6. Launch the tool

   Navigate to a course. Under *Course Management* > *Course Tools* you should see your LTI 1.3 Example App

## Basic LTI 1.3 tool launch

The normal LTI Resource link should launch to http://localhost:3000/lti13.

## LTI Asset Processor tool

This tool supports the LTI asset processor spec. All calls currently hit http://localhost:3000/lti13.

The following functionality is supported:
- Deep link launch in order to link the processor to the platform item. A processor can be returned, similar to other deep link items. 
- Asset processor settings launch via LtiAssetProcessorSettingsRequest message type. Echos request payload. 
- Asset processor EULA launch via LtiEulaRequest message type. Echos request payload.
- Asset processor report launch via LtiReportReviewRequest message type. Echos request payload. 
- Submissions are accepted via the LtiSubmissionNotice message type. These trigger the following behavior:
  - After 1 second each asset is downloaded via the provided URL with a LTI token.
  - A Processing and Processed message is sent to the platform. A score of 75/100 is reported. 

Note: Very little validation is performed in above workflows. For instance, checksums are not verified on assets, so this is suitable for basic testing. 
 

## Assignment and Grade Services 2.0

If enabled on the LMS this will be available in the tool.

## Names and Roles Provisioning Services 2.0

If enabled on the LMS this will be available in the tool.

## Deep Linking 2.0

The Deep Linking Request should launch to http://localhost/deepLinkOptions to be able to select content items and counts
to return. Possible content items are:

- LTI Link
- Content Link
- Embedded LTI Links
- HTML/File/Image Links
- Asset processor

Custom JSON can also be entered and used to create deep linked items.

# Docker

Docker specific files are included (Dockerfile, docker-compose.yml, launch.sh).

Build the LTI tool container with `docker build -t lti-tool .`. Then start containers using `docker-compose up`.

# Substituion variables:

- **$CourseGroup.id**

  To be used for the integration of Cloud Document contents. Resolve the UUID of the assigned group of the content.

  - `minimum-learn-version` : _To be used internally for now. Minium version to be defined._
  
- **$User.externalIdentifiers.UPN** _for Microsoft_

  To be used for the integration of Cloud Document contents. Resolve the UPN (User Personal Name) of a user for this Microsoft Integration. For Ultra, the UPN will be the registered institutional email  of the user.

  - `minimum-learn-version` : _To be used internally for now. Minimun version to be defined._