# Openai Whisper (Unofficial)

This is a Node.js app that transcribes audio files using openai whisper.

## Installation
To install the app and its dependencies, run:

```js
npm install openai-whisper
```

## Usage
To transcribe an audio file
```js
const { transcribeAudioFile } = require('openai-whisper');

const filePath = '/path/to/audio/file.mp3';

transcribeAudioFile(filePath)
  .then(transcription => {
    console.log(transcription);
  })
  .catch(error => {
    console.error(error);
  });

```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<p align="center"><br>
<img src="https://visit-counter.vercel.app/counter.png?page=https%3A%2F%Fgithu.com%2Famoayomide05%2Fchatgpt-whatsapp-bot&s=80&c=00ff00&bg=00000000&no=5&ff=digi" alt="visits">
</p>

# Developed by [amosayomide05](https://github.com/amosayomide05)
