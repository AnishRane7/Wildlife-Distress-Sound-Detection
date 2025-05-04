from flask import Flask, render_template, request, jsonify
import os
import numpy as np
import librosa
import tensorflow as tf
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load the trained model
model = tf.keras.models.load_model('model\wildlife_distress_detector.h5')

# Parameters for audio processing
SAMPLE_RATE = 22050
DURATION = 5  # seconds to analyze per clip

# Function to extract features from audio
def extract_features(file_path, n_mels=128, n_fft=2048, hop_length=512):
    try:
        # Load audio file
        y, sr = librosa.load(file_path, sr=SAMPLE_RATE, duration=DURATION)
        
        # If audio is shorter than DURATION, pad with zeros
        if len(y) < DURATION * sr:
            y = np.pad(y, (0, DURATION * sr - len(y)), 'constant')
        
        # Extract Mel spectrogram
        mel_spectrogram = librosa.feature.melspectrogram(
            y=y, 
            sr=sr, 
            n_fft=n_fft, 
            hop_length=hop_length,
            n_mels=n_mels
        )
        
        # Convert to decibels
        mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)
        
        return mel_spectrogram_db
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

# Function to make prediction
def predict_audio(file_path):
    # Extract features
    mel_spectrogram = extract_features(file_path)
    
    if mel_spectrogram is None:
        return {"error": "Could not process audio file"}
    
    # Reshape for model input
    mel_spectrogram = mel_spectrogram[np.newaxis, ..., np.newaxis]
    
    # Make prediction
    prediction = model.predict(mel_spectrogram)[0][0]
    
    # Convert to class label
    predicted_class = 'Distress' if prediction > 0.5 else 'Normal'
    confidence = float(prediction) if prediction > 0.5 else float(1 - prediction)
    
    # Create spectrogram image path for display
    filename = os.path.basename(file_path)
    spec_filename = f"spec_{os.path.splitext(filename)[0]}.png"
    spec_path = os.path.join('static', 'spectrograms', spec_filename)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(spec_path), exist_ok=True)
    
    # Generate and save spectrogram image
    import matplotlib.pyplot as plt
    plt.figure(figsize=(10, 4))
    librosa.display.specshow(
        mel_spectrogram[0, :, :, 0], 
        sr=SAMPLE_RATE, 
        hop_length=512, 
        x_axis='time', 
        y_axis='mel'
    )
    plt.colorbar(format='%+2.0f dB')
    plt.tight_layout()
    plt.savefig(spec_path)
    plt.close()
    
    return {
        "class": predicted_class,
        "confidence": confidence * 100,  # Convert to percentage
        "spectrogram": f"spectrograms/{spec_filename}"
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"})
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Process the file and make prediction
        result = predict_audio(file_path)
        
        return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)