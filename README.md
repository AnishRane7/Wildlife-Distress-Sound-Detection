# 🐾 Wildlife Distress Sound Detection

This is a simple Flask web app that detects distress sounds in wildlife audio using a deep learning model.

---

## 🚀 Features

- Upload an audio file (e.g., .wav, .mp3)
- Audio is converted to a Mel-spectrogram
- A pre-trained TensorFlow model classifies it as **distress** or **non-distress**
- Outputs result on the webpage

---

## 🛠 Tech Stack

- **Flask** – Web framework  
- **TensorFlow** – Deep learning model  
- **Librosa** – Audio processing  
- **NumPy**, **Matplotlib**, **scikit-learn** – Data handling and visualization

---

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/AnishRane7/Wildlife-Distress-Sound-Detection.git
cd Wildlife-Distress-Sound-Detection
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. **Download the pre-trained model**  
   Download the model from [Google Drive](https://drive.google.com/file/d/1ezn_ZfVslVqHBi19MQmLo5EPX5MYJhVT/view?usp=sharing) and place it in the `model/` directory:
```bash
mkdir -p model
```
After downloading, move the model file to:
model/wildlife_distress_detector.h5

5. Run the app:
```bash
python app.py
```
Then open http://localhost:5000 in your browser.

---
