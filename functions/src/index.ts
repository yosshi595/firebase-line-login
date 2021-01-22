import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import requestPromise = require("request-promise");
import "./types";
import config from "./config";

const createUrlQuery = function(options: object): string {
  return Object.entries(options)
      .map((e) => {
        const key = e[0];
        const value = encodeURI(e[1]);
        return `${key}=${value}`;
      })
      .join("&");
};

const execAuthApi = async (options: RequestOptions): Promise<any> => {
  options.body = createUrlQuery(options.bodyObject);
  return requestPromise(options)
      .then(function(parsedBody: any) {
        return parsedBody;
      })
      .catch(function(err: any) {
        return err;
      });
};
const createFirebaseToken = async (uid: string) => {
  admin.initializeApp();
  return admin
      .auth()
      .createCustomToken(uid)
      .then((customToken) => {
        return customToken;
      })
      .catch((err) => {
        return err;
      });
};

export const verifyToken = functions.https.onRequest(
    async (req: functions.https.Request, res: functions.Response) => {
      // cors対策のためヘッダの付与
      res.set("Access-Control-Allow-Origin", "http://localhost:3000");
      res.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");

      const body = JSON.parse(req.body);
      functions.logger.log(body.token);
      const bodyObject: LineTokenApiOprionBody = {
        grant_type: "authorization_code",
        code: body.token,
        redirect_uri: config.redirect_uri,
        client_id: config.client_id,
        client_secret: config.client_secret,
      };
      const options: RequestOptions = {
        method: "POST",
        uri: "https://api.line.me/oauth2/v2.1/token",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        bodyObject: bodyObject,
      };
      functions.logger.log(options);
      const result = await execAuthApi(options);
      functions.logger.log(result);
      const resultJson = JSON.parse(result);
      const verifyBdyObject: LineApiVerify = {
        client_id: config.client_id,
        id_token: resultJson.id_token,
        nonce: "line-login-test",
      };
      const verifyOptions: RequestOptions = {
        method: "POST",
        uri: "https://api.line.me/oauth2/v2.1/verify",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        bodyObject: verifyBdyObject,
      };
      const resultVerify = await execAuthApi(verifyOptions);
      const resultVerifyJson = JSON.parse(resultVerify);
      const firebaseToken =
        await createFirebaseToken("line:" + resultVerifyJson.sub);
      const response = {
        type: "line",
        token: firebaseToken,
      };
      res.send(JSON.stringify(response));
    }
);
