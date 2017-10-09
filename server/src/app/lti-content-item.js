module.exports = {
  constructLTIContentItem1: function () {
    return {
      "@context": "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
      "@graph": [
        {
          "@type": "Image",
          "@id": "http://www.imageserver.com/path/image.jpg",
          "height": 100,
          "width": 100
        }, {
          "@type": "LtiLinkItem",
          "mediaType": "application/vnd.ims.lti.v1.ltilink",
          "icon": {
            "@id": "https://www.server.com/path/animage.png",
            "width": 50,
            "height": 50
          },
          "title": "Week 1 reading",
          "text": "Read this section prior to your tutorial.",
          "custom": {
            "chapter": "12",
            "section": "3"
          },
          "placementAdvice": {
            "displayHeight": 100,
            "displayWidth": 100,
            "windowTarget": "_blank"
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
  },

  constructLTIContentItem2: function () {
    return {
      "@context": "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
      "@graph": [
        {
          "mediaType": "application/vnd.ims.lti.v1.ltilink",
          "@type": "LtiLinkItem",
          "title": "Sample LTI launch",
          "text": "This is an example of an LTI launch link set via the Content-Item launch message.  Please launch it to pass the related certification test.",
          "icon": {
            "@id": "https://apps.imsglobal.org//lti/cert/images/icon.png",
            "height": 50,
            "width": 50
          },
          "custom": {
            "imscert": "launch»bHYnJGxZ"
          }
        }
      ]
    };
  },

  constructLTIContentItem3: function () {
    return {
      "@context": "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
      "@graph": [
        {
          "mediaType": "text/html",
          "@type": "ContentItem",
          "url": "http://www.imsglobal.org/lti-certification-suite",
          "title": "LTI Certification",
          "text": "<p>\r\n<img src=\"https://apps.imsglobal.org/lti/cert/tc/tc_item.php/html&raquo;42ceLmuP\" />The goal of the IMS LTI Certification is to encourage interoperable implementations of both\r\nLMS Systems or LMS Extensions (LTI Tool Consumers) and External Tools/Content (LTI Tool Providers).\r\n</p>",
          "icon": {
            "@id": "https://apps.imsglobal.org//lti/cert/images/icon.png",
            "height": 50,
            "width": 50
          }
        }
      ]
    };
  },

  constructLTIContentItem4: function () {
    return {
      "@context": "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
      "@graph": [
        {
          "mediaType": "text/html",
          "@type": "ContentItem",
          "url": "http://www.imsglobal.org/lti-certification-suite",
          "title": "LTI Certification",
          "text": "<p>\r\n<img src=\"x\" />The goal of the IMS LTI Certification is to encourage interoperable implementations of both\r\nLMS Systems or LMS Extensions (LTI Tool Consumers) and External Tools/Content (LTI Tool Providers).\r\n</p>",
          "icon": {
            "@id": "https://apps.imsglobal.org//lti/cert/images/icon.png",
            "height": 50,
            "width": 50
          }
        }
      ]
    };
  },

  constructLTIContentItem5: function () {
    return {
      "@context": "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
      "@graph": [
        {
          "@type": "Image",
          "@id": "http://www.imageserver.com/path/image.jpg",
          "height": 100,
          "width": 100
        }, {
          "@type": "LtiLinkItem",
          "mediaType": "application/vnd.ims.lti.v1.ltilink",
          "icon": {
            "@id": "https://www.server.com/path/animage.png",
            "width": 50,
            "height": 50
          },
          "title": "Week 1 reading",
          "text": "Read this section prior to your tutorial.",
          "custom": {
            "chapter": "12",
            "section": "3"
          },
          "placementAdvice": {
            "displayHeight": 100,
            "displayWidth": 100,
            "windowTarget": "_blank"
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
        },
        {
          "@type": "Image",
          "@id": "http://www.imageserver.com/path/image.jpg",
          "height": 100,
          "width": 100
        }, {
          "@type": "LtiLinkItem",
          "mediaType": "application/vnd.ims.lti.v1.ltilink",
          "icon": {
            "@id": "https://www.server.com/path/animage.png",
            "width": 50,
            "height": 50
          },
          "title": "Week 1 reading",
          "text": "Read this section prior to your tutorial.",
          "custom": {
            "chapter": "12",
            "section": "3"
          },
          "placementAdvice": {
            "displayHeight": 100,
            "displayWidth": 100,
            "windowTarget": "_blank"
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
        },
        {
          "@type": "Image",
          "@id": "http://www.imageserver.com/path/image.jpg",
          "height": 100,
          "width": 100
        }, {
          "@type": "LtiLinkItem",
          "mediaType": "application/vnd.ims.lti.v1.ltilink",
          "icon": {
            "@id": "https://www.server.com/path/animage.png",
            "width": 50,
            "height": 50
          },
          "title": "Week 1 reading",
          "text": "Read this section prior to your tutorial.",
          "custom": {
            "chapter": "12",
            "section": "3"
          },
          "placementAdvice": {
            "displayHeight": 100,
            "displayWidth": 100,
            "windowTarget": "_blank"
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
