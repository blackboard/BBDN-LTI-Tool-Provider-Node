import { getProcessorToken } from './lti-token-service';
import request from "request";

export const handleSubmissionNotice = async (req, res, jwtPayload) => {
    // We need to store the assets
    const assets = jwtPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/assetservice"]["assets"];
    const statusUrl = jwtPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/assetreport"]["report_url"];
    const resourceLinkId = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/resource_link"]["id"];

    for (const asset in assets) {
        const title = assets[asset].title;

        // Delay downloading/updating status for 1 second after notification
        await new Promise(resolve => setTimeout(resolve, 1000));
        await downloadAsset(jwtPayload.body.aud, assets[asset].url);
        await updateAssetStatus(jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "Processing");
        if (title.startsWith('fail')) {
            await updateAssetStatus(jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "Failed");
        } else if (title.startsWith('notprocessed')) {
            await updateAssetStatus(jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "NotProcessed");
        } else {
            const score = parseScore(title);
            const maxScore = parseMaxScore(title);
            await updateAssetStatus(jwtPayload.body.aud, statusUrl, resourceLinkId, assets[asset].asset_id, "Processed", score, maxScore);
        }
    }
    res.sendStatus(200);
};

const parseScore = (title) => {
    // This regex matches numbers with optional decimal part
    const score = title.match(/(\d+(\.\d+)?)/);
    return score ? Number(score[0]) : 75;
}

const parseMaxScore = (title) => {
    // This regex matches numbers with optional decimal part at the end of a string
    const score = title.match(/(\d+(\.\d+)?)(?=\.\w+$)/);
    return score ? Number(score[0]) : 100;
}

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

const updateAssetStatus = (aud, statusUrl, resourceLinkId, assetId, assetStatus, score, maxScore) => {
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

            if (assetStatus === "Processed" && score) {
                payload["scoreGiven"] = score;
                payload["scoreMaximum"] = maxScore;
                if ( score > 80 ) {
                    payload["indicationColor"] = "#FF0000";
                    payload["indicationAlt"] = "Bad";
                } else if ( score > 50 ) {
                    payload["indicationColor"] = "#FFFF00";
                    payload["indicationAlt"] = "Warning";
                } else if ( score > 20 ) {
                    payload["indicationColor"] = "#0000FF";
                    payload["indicationAlt"] = "Probably OK";
                } else {
                    payload["indicationColor"] = "#3F704D";
                    payload["indicationAlt"] = "Clear";
                }
            }

            if (assetStatus === "Failed") {
                payload["comment"] = "Fake Failure";
            }

            if (assetStatus === "NotProcessed") {
                payload["comment"] = "File not supported";
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
