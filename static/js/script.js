document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadForm = document.getElementById('upload-form');
    const audioFileInput = document.getElementById('audio-file');
    const fileNameDisplay = document.getElementById('file-name');
    const audioPlayerContainer = document.getElementById('audio-player-container');
    const audioPlayer = document.getElementById('audio-player');
    const resultsSection = document.getElementById('results-section');
    const statusIndicator = document.getElementById('status-indicator');
    const resultTitle = document.getElementById('result-title');
    const confidenceBar = document.getElementById('confidence-bar');
    const confidenceValue = document.getElementById('confidence-value');
    const spectrogramImage = document.getElementById('spectrogram-image');
    const normalInterpretation = document.getElementById('normal-interpretation');
    const distressInterpretation = document.getElementById('distress-interpretation');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Handle file selection
    audioFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            
            // Create audio URL and update audio player
            const audioURL = URL.createObjectURL(file);
            audioPlayer.src = audioURL;
            audioPlayerContainer.style.display = 'block';
            
            // Reset results if they were previously shown
            resultsSection.style.display = 'none';
        } else {
            fileNameDisplay.textContent = 'No file selected';
            audioPlayerContainer.style.display = 'none';
        }
    });

    // Handle form submission
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(uploadForm);
        const file = audioFileInput.files[0];
        
        if (!file) {
            alert('Please select an audio file first');
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        
        // Upload file and get prediction
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            
            // Update the results UI
            updateResults(data);
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            loadingOverlay.style.display = 'none';
            console.error('Error:', error);
            alert('An error occurred during analysis. Please try again.');
        });
    });

    // Function to update the results UI
    function updateResults(data) {
        // Update status indicator and title
        if (data.class === 'Normal') {
            statusIndicator.className = 'status-indicator normal';
            resultTitle.textContent = 'Normal Wildlife Sound Detected';
            normalInterpretation.style.display = 'block';
            distressInterpretation.style.display = 'none';
        } else {
            statusIndicator.className = 'status-indicator distress';
            resultTitle.textContent = 'Wildlife Distress Call Detected';
            normalInterpretation.style.display = 'none';
            distressInterpretation.style.display = 'block';
        }
        
        // Update confidence bar
        const confidence = data.confidence;
        confidenceBar.style.width = `${confidence}%`;
        confidenceValue.textContent = `${confidence.toFixed(1)}%`;
        
        // If confidence is very high, make the bar green, otherwise yellow or red
        if (confidence > 90) {
            confidenceBar.style.backgroundColor = '#2e7d32';  // Green
        } else if (confidence > 70) {
            confidenceBar.style.backgroundColor = '#ff9800';  // Orange
        } else {
            confidenceBar.style.backgroundColor = '#f44336';  // Red
        }
        
        // Update spectrogram image
        spectrogramImage.src = `/static/${data.spectrogram}`;
        
        // Add animation class for visual feedback
        resultsSection.classList.add('fade-in');
        setTimeout(() => {
            resultsSection.classList.remove('fade-in');
        }, 1000);
    }
    
    // Add drag and drop functionality for the file input
    const fileDropArea = document.querySelector('.file-label');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        fileDropArea.classList.add('highlighted');
    }
    
    function unhighlight() {
        fileDropArea.classList.remove('highlighted');
    }
    
    fileDropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0 && files[0].type.startsWith('audio/')) {
            audioFileInput.files = files;
            const event = new Event('change');
            audioFileInput.dispatchEvent(event);
        } else {
            alert('Please upload an audio file.');
        }
    }
});