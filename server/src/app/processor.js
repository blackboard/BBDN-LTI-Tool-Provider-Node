import { getProcessorToken } from './lti-token-service';
import request from "request";

export const handleSubmissionNotice = async (req, res, jwtPayload) => {
    // We need to store the assets
    const assets = jwtPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/assetservice"]["assets"];
    const statusUrl = jwtPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/assetreport"]["report_url"];
    const resourceLinkId = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/resource_link"]["id"];

    for (const asset in assets) {
        // Delay downloading/updating status for 1 second after notification
        await new Promise(resolve => setTimeout(resolve, 1000));
        await downloadAsset(jwtPayload.body.aud, assets[asset].url);
        await updateAssetStatus(jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "Processing");
        await updateAssetStatus(jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "Processed");
    }
    res.sendStatus(200);
};

const downloadAsset = (aud, assetUrl) => {
    return new Promise(async (resolve, reject) => {
        const scope = "https://purl.imsglobal.org/spec/lti-ap/scope/asset.readonly";
        try {
            const token = await getProcessorToken(aud, scope);
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
                if (response.statusCode === 200 || response.statusCode === 307 || response.statusCode === 302) {
                    console.log("Successfully downloaded asset " + assetUrl);
                    resolve();
                } else {
                    console.log("Unexpected download response: " + JSON.stringify(response));
                    reject(err);
                }
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}

const updateAssetStatus = (aud, statusUrl, resourceLinkId, assetId, assetStatus) => {
    return new Promise(async (resolve, reject) => {
        const scope = "https://purl.imsglobal.org/spec/lti-ap/scope/report";
        try {
            const token = await getProcessorToken(aud, scope);
            let payload = {
                "processingProgress": assetStatus,
                "assetId": assetId,
                "resourceLinkId": resourceLinkId,
                "type": "originality"
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
                    resolve();
                } else {
                    console.log("Unexpected asset set status response: " + JSON.stringify(response));
                    reject(err);
                }
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
}