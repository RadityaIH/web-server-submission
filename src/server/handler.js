const predictClassification = require('../services/inferenceService');
const storeData = require('../services/storeData');
const crypto = require('crypto');
const InputError = require('../exceptions/InputError');
const { Firestore } = require('@google-cloud/firestore');

const path = require('path');
const pathKey = path.resolve('firestore-access.json')

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    try {
        const { label, suggestion } = await predictClassification(model, image);

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            "id": id,
            "result": label,
            "suggestion": suggestion,
            "createdAt": createdAt
        }

        await storeData(id, data);

        const response = h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data
        })
        response.code(201);
        return response;
    } catch (error) {
        throw new InputError('Terjadi kesalahan dalam melakukan prediksi')
    }
}

async function getHistoriesHandler(request, h) {
    const db = new Firestore({
        projectId: "submissionmlgc-radityailham",
        keyFilename: pathKey
      });
    const predictCollection = db.collection("prediction");
    const snapshot = await predictCollection.get();
    const result = [];
    snapshot.forEach((doc) => {
        result.push({
            id: doc.id,
            history: {
                result: doc.data().result,
                createdAt: doc.data().createdAt,
                suggestion: doc.data().suggestion,
                id: doc.data().id,
            },
        });
    });
    return h.response({
        status: "success",
        data: result,
    });
}
module.exports = { postPredictHandler, getHistoriesHandler };