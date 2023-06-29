import { getProcessorToken } from './lti-token-service';
import request from "request";

export const handleSubmissionNotice = async (req, res, jwtPayload) => {
    // We need to store the assets
    const assets = jwtPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/assetservice"]["assets"];
    const statusUrl = jwtPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/assetreport"]["report_url"];
    const resourceLinkId = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/resource_link"]["id"];

    for (const asset in assets) {
        // Delay downloading/updating status for 1 second after notification
        setTimeout(async () => {
            await downloadAsset(req.body.nonce, jwtPayload.body.aud, assets[asset].url);
            await updateAssetStatus(req.body.nonce, jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "Processing");
            await updateAssetStatus(req.body.nonce, jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "Processed");
        }, 1000);
    }
    res.sendStatus(200);
};

const downloadAsset = async(nonce, aud, assetUrl) => {
    const scope = "https://purl.imsglobal.org/spec/lti-ap/scope/asset.readonly";
    return getProcessorToken(aud, scope).then(
        function (token) {
            let options = {
                method: 'GET',
                uri: assetUrl,
                headers: {
                    Authorization: 'Bearer ' + token
                },
                // Don't follow redirects unless we plan on validating content
                followRedirect: false
            };

            request(options, function (err, response, body) {
                if (response.statusCode === 200 || response.statusCode === 307) {
                    console.log("Successfully downloaded asset " + assetUrl);
                } else {
                    console.log("Unexpected download response: " + JSON.stringify(response));
                }
            });
        },
        function (error) {
            console.log(error);
        }
    );
}

const updateAssetStatus = async(nonce, aud, statusUrl, resourceLinkId, assetId, assetStatus) => {
    const scope = "https://purl.imsglobal.org/spec/lti-ap/scope/report";
    return getProcessorToken(aud, scope).then(
        function (token) {
            let payload = {
                "processingProgress": assetStatus,
                "assetId": assetId,
                "resourceLinkId": resourceLinkId
            };

            if (assetStatus === "Processed") {
                payload["scoreGiven"] = 75;
                payload["scoreMaximum"] = 100;
            }

            let options = {
                method: 'POST',
                uri: statusUrl,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            };

            request(options, function (err, response, body) {
                if (response.statusCode < 300) {
                    console.log("Set status to " + assetStatus + " for asset " + assetId);
                } else {
                    console.log("Unexpected asset set status response: " + JSON.stringify(response));
                }
            });
        },
        function (error) {
            console.log(error);
        }
    );
}
