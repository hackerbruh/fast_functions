// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

    exports.averageRatings = functions.firestore
    .document('vendors/{restId}/ratings/{ratingId}')
    .onWrite(async (change, context) => {
      const ratingVal = change.after.data().rating;
      const restRef = db.collection('vendors').doc(context.params.restId);
      await db.runTransaction(async (transaction) => {
        const restDoc = await transaction.get(restRef);
        const newNumRatings = restDoc.data().numRatings + 1;
        const oldRatingTotal = restDoc.data().averageRating * restDoc.data().numRatings;
        const newAvgRating = (oldRatingTotal + ratingVal) / newNumRatings;
        transaction.update(restRef, {
          averageRating: newAvgRating,
          numRatings: newNumRatings
        });
      });
    });

  exports.ordersStatus = functions.firestore
    .document('liveOnlineOrders/{orderId}/orders/{insideOrderId}')
    .onUpdate(async (change, context) => {
      var size=0;
      var statusAdd=[];
      db.doc(`liveOnlineOrders/${context.params.orderId}`).get()
      .then(function(doc){
        size=doc.data().vendors.length;
      })
      db.collection(`liveOnlineOrders/${context.params.orderId}/orders`).where("status","array-contains","recieved")
      .get()
      .then(function(querySnapshot) {
        if(size===querySnapshot.size){
          statusAdd.push("received");
          console.log(statusAdd);
      }
      }) 
      db.collection(`liveOnlineOrders/${context.params.orderId}/orders`).where("status","array-contains","recieved").where("status","array-contains","preparing")
      .get()
      .then(function(querySnapshot) {
        if(size===querySnapshot.size){
          statusAdd.push("received","preparing");
          console.log(statusAdd);
      }
      })    
      db.collection(`liveOnlineOrders/${context.params.orderId}/orders`).where("status","array-contains","recieved").where("status","array-contains","preparing").where("status","array-contains","dispatched")
      .get()
      .then(function(querySnapshot) {
        if(size===querySnapshot.size){
          statusAdd.push("received","preparing","dispatched");
          console.log(statusAdd);
      }
      }) 
    });
    
   