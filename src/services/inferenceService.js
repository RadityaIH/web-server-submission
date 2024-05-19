const tf = require('@tensorflow/tfjs-node');

async function predictClassification(model, image) {
    try {
        const tensor = tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat()
 
        const prediction = model.predict(tensor);
        const score = await prediction.data()
        const confidenceScore = Math.max(...score) * 100;
        const label = confidenceScore > 50 ? 'Cancer' : 'Non-cancer';
 
        let suggestion;
 
        if(label === 'Cancer') {
            suggestion = "Segera periksa ke dokter!"
        }
 
        if(label === 'Non-cancer') {
            suggestion = "Tidak ada tanda-tanda kanker. Tetap jaga kesehatan ya!"
        }
 
        return { label, suggestion };
    } catch (error) {
        throw new InputError(`Terjadi kesalahan input: ${error.message}`)
    }
}

module.exports = predictClassification;