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
          }
        }
      ]
    };
  }
};
