module.exports = {
  constructLTIContentItem: function() {
    return {
      "@context" : "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
      "@graph" : [ {
          "@type" : "Image",
          "@id" : "http://www.imageserver.com/path/image.jpg",
          "height" :  100,
          "width" : 100
        }, {
          "@type" : "LtiLinkItem",
          "mediaType" : "application/vnd.ims.lti.v1.ltilink",
          "icon" : {
            "@id" : "https://www.server.com/path/animage.png",
            "width" : 50,
            "height" : 50
          },
          "title" : "Week 1 reading",
          "text" : "Read this section prior to your tutorial.",
          "custom" : {
            "chapter": "12",
            "section": "3"
          },
          "placementAdvice" : {
            "displayHeight" : 100,
            "displayWidth" : 100,
            "presentationDocumentTarget" : "iframe",
            "windowTarget" : "_blank"
          }
        }, {
        "@type": "LtiLinkItem",
        "mediaType": "application/vnd.ims.lti.v1.ltilink",
        "icon": {
          "@id": "https://www.server.com/path/animage.png",
          "width": 50,
          "height": 50
        },
        "title": "Week 2 reading",
        "text": "Read this section prior to your tutorial.",
        "custom": {
          "chapter": "12",
          "section": "4"
        },
        "placementAdvice": {
          "displayHeight": 100,
          "displayWidth": 100,
          "presentationDocumentTarget": "iframe",
          "windowTarget": "_blank"
        },
        "lineItem": {
          "@type": "LineItem",
          "label": "Chapter 12 quiz",
          "reportingMethod": "res:totalScore",
          "assignedActivity": {
            "@id": "http://toolprovider.example.com/assessment/66400",
            "activityId": "a-9334df-33"
          },
          "scoreConstraints": {
            "@type": "NumericLimits",
            "normalMaximum": 100,
            "extraCreditMaximum": 10,
            "totalMaximum": 110
          }
        }
      }, {
          "@type": "ContentItem",
          "@id": ":item1",
          "title": "Assignment: Assignment Specification",
          "mediaType": "text\/html",
          "text": "Assignment: Assignment Specification",
          "url": "https://www.py4e.com/install.php",
          "placementAdvice": {
            "presentationDocumentTarget": "WINDOW",
            "windowTarget": "_blank"
          },
          "icon": {
            "@id": "https://www.dr-chuck.net/tsugi-static/font-awesome-4.4.0/png/lock.png",
            "width": 64,
            "height": 64
          }
        }
      ]
    };
  }
};
