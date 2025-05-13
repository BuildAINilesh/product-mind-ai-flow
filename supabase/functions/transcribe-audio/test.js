// A simple test script for the transcribe-audio edge function
// Usage: node test.js <audio-file-path> <supabase-token>

const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testTranscribeAudio() {
  if (process.argv.length < 4) {
    console.error('Usage: node test.js <audio-file-path> <supabase-token>');
    process.exit(1);
  }

  const audioFilePath = process.argv[2];
  const supabaseToken = process.argv[3];

  if (!fs.existsSync(audioFilePath)) {
    console.error(`Audio file ${audioFilePath} does not exist`);
    process.exit(1);
  }

  console.log(`Testing transcribe-audio with file: ${audioFilePath}`);

  // Create a FormData object with the audio file
  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioFilePath));
  formData.append('model', 'whisper-1');

  try {
    // Use the actual URL of your deployed edge function
    const response = await fetch('https://nbjajaafqswspkytekun.supabase.co/functions/v1/transcribe-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseToken}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log('Transcription result:');
    console.log(result);
  } catch (error) {
    console.error('Error testing edge function:', error);
    process.exit(1);
  }
}

testTranscribeAudio(); 