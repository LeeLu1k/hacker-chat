const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.autoPush = functions.database
  .ref("/chat/{id}")
  .onCreate(async () => {

    const snap = await admin.database().ref("tokens").once("value");
    const tokens = Object.values(snap.val() || {});

    if (!tokens.length) return null;

    return admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "Anon Chat",
        body: "New message"
      }
    });
  });
