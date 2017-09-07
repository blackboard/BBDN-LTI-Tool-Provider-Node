import config from "../config/config";

module.exports = {
  constructToolProxy: function (tcToolProfileUrl: string) {
    let provider = config.provider_domain + (config.provider_port != "NA" ? ":" + config.provider_port : "");
    var toolProxy = {
      "@context": ["http://purl.imsglobal.org/ctx/lti/v2/ToolProxy", {"tcp": "http://ultra-integ.int.bbpd.io/learn/api/v1/lti/profile#"}],
      "@type": "ToolProxy",
      "@id": "http://lms.example.com/ToolProxy/869e5ce5-214c-4e85-86c6-b99e8458a592",
      "lti_version": "LTI-2p0",
      "tool_consumer_profile": "http://ultra-integ.int.bbpd.io/learn/api/v1/lti/profile",
      "tool_proxy_guid": "abc",
      "tool_profile": {
        "lti_version": "LTI-2p0",
        "product_instance": {
          "guid": "fd75124a-140e-470f-944c-114d2d92bb40",
          "product_info": {
            "product_name": {"default_value": "IMS Certification suite", "key": "tool.name"},
            "description": {
              "default_value": "IMS Certification tests to maximise interoperability.",
              "key": "tool.description"
            },
            "product_version": "1.3.3f (9-Nov-16)",
            "technical_description": {"default_value": "Fully supports LTI", "key": "tool.technical"},
            "product_family": {
              "@id": "http://toolprovider.example.com/vendor/ims/product/assessment-tool",
              "code": "assessment-tool",
              "vendor": {
                "code": "ims",
                "vendor_name": {"default_value": "IMS Global Learning Consortium", "key": "tool.vendor.name"},
                "description": {
                  "default_value": "IMS is a leading provider of interoperability specifications for education",
                  "key": "tool.vendor.description"
                },
                "website": "http://www.imsglobal.org",
                "timestamp": "2016-11-09T16:15:40+00:00",
                "contact": {"email": "lticonformance@imsglobal.org"}
              }
            }
          },
          "support": {"email": "conformance@insglobal,org"},
          "service_provider": {
            "guid": "18e7ea50-3d6d-4f6b-aff2-ed3ab577716c",
            "service_provider_name": {"default_value": "IMS Hosting", "key": "service_provider.name"},
            "description": {
              "default_value": "Provider of high performance managed hosting environments",
              "key": "service_provider.description"
            },
            "support": {"email": "info@imsglobal.org"},
            "timestamp": "2016-11-09T16:15:40+00:00"
          }
        },
        "base_url_choice": [{"default_base_url": provider}],
        "resource_handler": [{
          "resource_type": {"code": "asmt"},
          "resource_name": {"default_value": "LTI2 Echo", "key": "endpoint.echo.name"},
          "description": {
            "default_value": "An interactive assessment using the IMS scale.",
            "key": "assessment.resource.description"
          },
          "message": [{
            "message_type": "basic-lti-launch-request",
            "path": "/ltilaunchendpoint",
            "enabled_capability": ["User.id", "Person.sourcedId", "Membership.role", "CourseSection.sourcedId"],
            "parameter": [
              {"name": "tc_profile_url", "variable": "ToolConsumerProfile.url"}, {
                "name": "cert_given_name",
                "variable": "Person.name.given"
              }, {"name": "cert_family_name", "variable": "Person.name.family"}, {
                "name": "cert_full_name",
                "variable": "Person.name.full"
              },
              {"name": "cert_email", "variable": "Person.email.primary"},
              {
                "name": "cert_userid",
                "variable": "User.id"
              }, {
                "name": "result_url",
                "variable": "Result.url"
              },
              {"name": "cert_username", "variable": "User.username"}, {
                "name": "simple_key",
                "fixed": "custom_simple_value"
              }, {"name": "Complex!@#$^*(){}[]KEY", "fixed": "Complex!@#$^*;(){}[]½Value"}]
          }, {
            "message_type" : "ContentItemSelectionRequest",
            "path" : "/lti",
            "enabled_capability": ["User.id", "Person.sourcedId", "Membership.role", "Context.id",
                "CourseSection.sourcedId"],
            "parameter" : [
                {"name": "tc_profile_url", "variable": "ToolConsumerProfile.url"}, {
                    "name": "cert_given_name",
                    "variable": "Person.name.given"
                }, {"name": "cert_family_name", "variable": "Person.name.family"}, {
                    "name": "cert_full_name",
                    "variable": "Person.name.full"
                },
                {"name": "cert_email", "variable": "Person.email.primary"},
                {
                    "name": "cert_userid",
                    "variable": "User.id"
                }, {
                    "name": "result_url",
                    "variable": "Result.url"
                },
                {"name": "cert_username", "variable": "User.username"}, {
                    "name": "simple_key",
                    "fixed": "custom_simple_value"
                }, {"name": "Complex!@#$^*(){}[]KEY", "fixed": "Complex!@#$^*;(){}[]½Value"}]
              }],
            "icon_info": [{"default_location": {"path": "images/fallout_copy.png"}, "key": "iconStyle.default.path"}]
        }]
      },
      "custom": {"id": "id58234b1eaa416"},
      "security_contract": {
        "shared_secret": "secret58234b1eaa36c",
        "tool_service": [{
          "@type": "RestServiceProfile",
          "service": "tcp:ToolConsumerProfile",
          "action": ["GET"]
        }, {
          "@type": "RestServiceProfile",
          "service": "tcp:ToolProxy.collection",
          "action": ["GET", "POST"]
        }, {"@type": "RestServiceProfile", "service": "tcp:CaliperProfile.collection", "action": ["GET"]}]
      }
    };
    return toolProxy;
  }/**
   * Created by cthomas on 2/16/17.
   */
}