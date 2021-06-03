import config from '../config/config';

export const constructLTIContentItem1 = () => {
  return {
    '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
    '@graph': [
      {
        '@type': 'LtiLinkItem',
        url: `${config.frontend_url}lti`,
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id':
            'https://www.wpclipart.com/animals/F/ferret/.cache/Ferret_black-footed.jpg',
          width: 50,
          height: 50
        },
        title:
          'Week 1 reading LTI + Link<script>alert(\'help me\');</script>&nbsp;<span style="font-family: Garamond, serif; font-weight: bold; font-size: 24px">Hello</span>',
        text:
          'Read this section prior to your tutorial. <script>alert(\'help me\');</script>&nbsp;<span style="font-family: Garamond, serif; font-weight: bold; font-size: 24px">This should be large and bold</span>',
        custom: {
          chapter: '12',
          section: '3',
          duedate: '2018-03-31T11:15:00+01:00',
          source: 'link'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          windowTarget: '_blank'
        }
      },
      {
        '@type': 'LtiLinkItem',
        url: `${config.frontend_url}lti`,
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id':
            'https://www.wpclipart.com/animals/F/frogs/.cache/Frog_eyeing_dinner.png',
          width: 50,
          height: 50
        },
        title: 'Week 2 reading LTI',
        text: 'Read this section prior to your tutorial.',
        custom: {
          chapter: '12',
          section: '4',
          duedate: '2019-05-24T23:15:00+01:00',
          source: 'link'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          presentationDocumentTarget: 'iframe',
          windowTarget: '_blank'
        },
        lineItem: {
          '@type': 'LineItem',
          label: 'Chapter 12 quiz',
          reportingMethod: 'res:totalScore',
          assignedActivity: {
            '@id': 'http://toolprovider.example.com/assessment/66400',
            activityId: 'a-9334df-33'
          },
          scoreConstraints: {
            '@type': 'NumericLimits',
            normalMaximum: 100,
            extraCreditMaximum: 10,
            totalMaximum: 110
          }
        }
      },
      {
        '@type': 'LtiLinkItem',
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        title: 'Cross-domain LTI link',
        text: 'This link should be gently rejected',
        url: 'https://google.com'
      },
      {
        '@type': 'ContentItem',
        '@id': ':item1',
        title: 'Assignment: Assignment Specification',
        mediaType: 'text/html',
        text: 'Assignment: Assignment Specification',
        url: 'https://www.py4e.com/install.php',
        placementAdvice: {
          presentationDocumentTarget: 'WINDOW',
          windowTarget: '_blank'
        },
        icon: {
          '@id':
            'https://www.dr-chuck.net/tsugi-static/font-awesome-4.4.0/png/lock.png',
          width: 64,
          height: 64
        }
      },
      {
        '@type': 'ContentItem',
        url: 'http://www.imageserver.com/path/image.jpg',
        mediaType: 'image/jpg',
        title: 'Title for my picture',
        placementAdvice: {
          height: 100,
          width: 100
        }
      }
    ]
  };
};

export const constructLTIContentItem2 = () => {
  return {
    '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
    '@graph': [
      {
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        '@type': 'LtiLinkItem',
        url: `${config.frontend_url}lti`,
        title: 'Sample LTI launch',
        text:
          'This is an example of an LTI launch link set via the Content-Item launch message.  Please launch it to pass the related certification test.',
        icon: {
          '@id': 'https://apps.imsglobal.org//lti/cert/images/icon.png',
          height: 50,
          width: 50
        },
        placementAdvice: {
          displayHeight: 400,
          displayWidth: 400,
          presentationDocumentTarget: 'IFRAME'
        },
        lineItem: {
          '@type': 'LineItem',
          label: 'Chapter 13 quiz',
          reportingMethod: 'res:totalScore',
          assignedActivity: {
            '@id': 'http://toolprovider.example.com/assessment/66400',
            activityId: 'a-9334df-33'
          },
          scoreConstraints: {
            '@type': 'NumericLimits',
            normalMaximum: 100,
            extraCreditMaximum: 10,
            totalMaximum: 110
          }
        },
        custom: {
          imscert: 'launch»bHYnJGxZ',
          contextHistory: '$Context.id.history',
          resourceHistory: '$ResourceLink.id.history',
          dueDate: '$ResourceLink.submission.endDateTime',
          userName: '$User.username',
          userEmail: '$Person.email.primary',
          userSysRoles: '@X@user.role@X@',
          source: 'link'
        }
      }
    ]
  };
};

export const constructLTIContentItem3 = () => {
  return {
    '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
    '@graph': [
      {
        mediaType: 'text/html',
        '@type': 'ContentItem',
        url: 'http://www.imsglobal.org/lti-certification-suite',
        title: 'LTI Certification',
        text:
          '<p>\r\n<img src="https://apps.imsglobal.org/lti/cert/tc/tc_item.php/html&raquo;42ceLmuP" alt="" />The goal of the IMS LTI Certification is to encourage interoperable implementations of both\r\nLMS Systems or LMS Extensions (LTI Tool Consumers) and External Tools/Content (LTI Tool Providers).\r\n</p>',
        icon: {
          '@id': 'https://apps.imsglobal.org//lti/cert/images/icon.png',
          height: 50,
          width: 50
        }
      }
    ]
  };
};

export const constructLTIContentItem4 = () => {
  return {
    '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
    '@graph': [
      {
        mediaType: 'text/html',
        '@type': 'ContentItem',
        url: 'http://www.imsglobal.org/lti-certification-suite',
        title: 'LTI Certification',
        text:
          '<p>\r\n<img src="https://apps.imsglobal.org/lti/cert/tc/tc_item.php/html&raquo;42ceLmuP" alt="" />The goal of the IMS LTI Certification is to encourage interoperable implementations of both\r\nLMS Systems or LMS Extensions (LTI Tool Consumers) and External Tools/Content (LTI Tool Providers).\r\n</p>',
        icon: {
          '@id': 'https://apps.imsglobal.org//lti/cert/images/icon.png',
          height: 50,
          width: 50
        }
      }
    ]
  };
};

export const constructLTIContentItem5 = () => {
  return {
    '@context': 'http://purl.imsglobal.org/ctx/lti/v1/ContentItem',
    '@graph': [
      {
        '@type': 'LtiLinkItem',
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id':
            'https://www.wpclipart.com/animals/F/ferret/.cache/Ferret_black-footed.jpg',
          width: 50,
          height: 50
        },
        title: 'Week 1 reading LTI',
        text: 'Read this section prior to your tutorial.',
        custom: {
          chapter: '12',
          section: '3',
          source: 'link'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          windowTarget: '_blank'
        }
      },
      {
        '@type': 'LtiLinkItem',
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id':
            'https://www.wpclipart.com/animals/F/frogs/.cache/Frog_eyeing_dinner.png',
          width: 50,
          height: 50
        },
        title: 'Week 2 reading LTI',
        text: 'Read this section prior to your tutorial.',
        custom: {
          chapter: '12',
          section: '4',
          source: 'link'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          presentationDocumentTarget: 'iframe',
          windowTarget: '_blank'
        },
        lineItem: {
          '@type': 'LineItem',
          label: 'Chapter 12 quiz',
          reportingMethod: 'res:totalScore',
          assignedActivity: {
            '@id': 'http://toolprovider.example.com/assessment/66400',
            activityId: 'a-9334df-33'
          },
          scoreConstraints: {
            '@type': 'NumericLimits',
            normalMaximum: 100,
            extraCreditMaximum: 10,
            totalMaximum: 110
          }
        }
      },
      {
        '@type': 'ContentItem',
        '@id': ':item1',
        title: 'Assignment: Assignment Specification',
        mediaType: 'text/html',
        text: 'Assignment: Assignment Specification',
        url: 'https://www.py4e.com/install.php',
        placementAdvice: {
          presentationDocumentTarget: 'WINDOW',
          windowTarget: '_blank'
        },
        icon: {
          '@id':
            'https://www.dr-chuck.net/tsugi-static/font-awesome-4.4.0/png/lock.png',
          width: 64,
          height: 64
        }
      },
      {
        '@type': 'ContentItem',
        url: 'http://www.imageserver.com/path/image.jpg',
        mediaType: 'image/jpg',
        title: 'Title for my picture',
        placementAdvice: {
          height: 100,
          width: 100
        }
      },
      {
        '@type': 'LtiLinkItem',
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id': 'https://www.server.com/path/animage.png',
          width: 50,
          height: 50
        },
        title: 'Week 1 reading',
        text: 'Read this section prior to your tutorial.',
        custom: {
          chapter: '12',
          section: '3',
          source: 'link'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          windowTarget: '_blank'
        }
      },
      {
        '@type': 'LtiLinkItem',
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id': 'https://www.server.com/path/animage.png',
          width: 50,
          height: 50
        },
        title: 'Week 2 reading',
        text: 'Read this section prior to your tutorial.',
        custom: {
          chapter: '12',
          section: '4'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          presentationDocumentTarget: 'iframe',
          windowTarget: '_blank'
        },
        lineItem: {
          '@type': 'LineItem',
          label: 'Chapter 12 quiz',
          reportingMethod: 'res:totalScore',
          assignedActivity: {
            '@id': 'http://toolprovider.example.com/assessment/66400',
            activityId: 'a-9334df-33'
          },
          scoreConstraints: {
            '@type': 'NumericLimits',
            normalMaximum: 100,
            extraCreditMaximum: 10,
            totalMaximum: 110
          }
        }
      },
      {
        '@type': 'ContentItem',
        '@id': ':item1',
        title: 'Assignment: Assignment Specification',
        mediaType: 'text/html',
        text: 'Assignment: Assignment Specification',
        url: 'https://www.py4e.com/install.php',
        placementAdvice: {
          presentationDocumentTarget: 'WINDOW',
          windowTarget: '_blank'
        },
        icon: {
          '@id':
            'https://www.dr-chuck.net/tsugi-static/font-awesome-4.4.0/png/lock.png',
          width: 64,
          height: 64
        }
      },
      {
        '@type': 'ContentItem',
        url: 'http://www.imageserver.com/path/image.jpg',
        mediaType: 'image/jpg',
        title: 'Title for my picture',
        placementAdvice: {
          height: 100,
          width: 100
        }
      },
      {
        '@type': 'LtiLinkItem',
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id':
            'https://www.wpclipart.com/animals/F/ferret/.cache/Ferret_black-footed.jpg',
          width: 50,
          height: 50
        },
        title: 'Week 1 reading LTI',
        text: 'Read this section prior to your tutorial.',
        custom: {
          chapter: '12',
          section: '3'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          windowTarget: '_blank'
        }
      },
      {
        '@type': 'LtiLinkItem',
        mediaType: 'application/vnd.ims.lti.v1.ltilink',
        icon: {
          '@id':
            'https://www.wpclipart.com/animals/F/frogs/.cache/Frog_eyeing_dinner.png',
          width: 50,
          height: 50
        },
        title: 'Week 2 reading LTI',
        text: 'Read this section prior to your tutorial.',
        custom: {
          chapter: '12',
          section: '4'
        },
        placementAdvice: {
          displayHeight: 100,
          displayWidth: 100,
          presentationDocumentTarget: 'iframe',
          windowTarget: '_blank'
        },
        lineItem: {
          '@type': 'LineItem',
          label: 'Chapter 12 quiz',
          reportingMethod: 'res:totalScore',
          assignedActivity: {
            '@id': 'http://toolprovider.example.com/assessment/66400',
            activityId: 'a-9334df-33'
          },
          scoreConstraints: {
            '@type': 'NumericLimits',
            normalMaximum: 100,
            extraCreditMaximum: 10,
            totalMaximum: 110
          }
        }
      },
      {
        '@type': 'ContentItem',
        '@id': ':item1',
        title: 'Assignment: Assignment Specification',
        mediaType: 'text/html',
        text: 'Assignment: Assignment Specification',
        url: 'https://www.py4e.com/install.php',
        placementAdvice: {
          presentationDocumentTarget: 'WINDOW',
          windowTarget: '_blank'
        },
        icon: {
          '@id':
            'https://www.dr-chuck.net/tsugi-static/font-awesome-4.4.0/png/lock.png',
          width: 64,
          height: 64
        }
      },
      {
        '@type': 'ContentItem',
        url:
          'https://www.wpclipart.com/animals/F/ferret/.cache/Ferret_black-footed.jpg',
        mediaType: 'image/jpg',
        title: 'Title for my picture',
        placementAdvice: {
          height: 100,
          width: 100
        }
      }
    ]
  };
};
