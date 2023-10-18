// import { exec } from 'child_process';
// import fs from 'fs';
// import path from 'path';

// export default function download(req, res) {
//   if (req.method === 'POST') {
//     const { url, format } = req.body;

//     if (!url || !format) {
//       return res.status(400).json({ error: 'Both URL and format are required.' });
//     }

//     // Define the appropriate content types for each format
//     const contentTypes = {
//       mp3: 'audio/mpeg',
//       wav: 'audio/wav',
//       aiff: 'audio/aiff',
//       mp4: 'video/mp4',
//       // Add more formats if needed
//     };

//     if (!contentTypes[format]) {
//       return res.status(400).json({ error: 'Unsupported format.' });
//     }

//     const downloadCommand = `youtube-dl --extract-audio --audio-format ${format} "${url}" -o "./public/audio/%(title)s.${format}"`;

//     exec(downloadCommand, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return res.status(500).json({ error: 'Failed to download.' });
//       }

//       const filename = stdout.split('\n').find(line => line.includes('[download] Destination:')).split(': ')[1];
//       const filePath = path.resolve(`./public/audio/${filename}`);

//       res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
//       res.setHeader('Content-Type', contentTypes[format]);

//       const fileStream = fs.createReadStream(filePath);
//       fileStream.pipe(res);
//     });
//   } else {
//     res.status(405).json({ error: 'Method not allowed.' });
//   }
// };

import { spawn } from 'child_process';

export default function download(req, res) {
  if (req.method === 'POST') {
    const { url, format } = req.body;

    if (!url || !format) {
      return res.status(400).json({ error: 'Both URL and format are required.' });
    }

    // Define the appropriate content types for each format
    const contentTypes = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aiff: 'audio/aiff',
      mp4: 'video/mp4',
      // Add more formats if needed
    };

    if (!contentTypes[format]) {
      return res.status(400).json({ error: 'Unsupported format.' });
    }

    // Use youtube-dl to stream the download
    const youtubeDl = spawn('youtube-dl', [
      '--extract-audio',
      '--audio-format', format,
      '-o',
      // `-`, // This sends the output to stdout
      '-.%(ext)s', 
      url,
      '--verbose',
    ]);

    // Set headers for the download
    res.setHeader('Content-Disposition', `attachment; filename=download.${format}`);
    res.setHeader('Content-Type', contentTypes[format]);

    // Pipe the youtube-dl stdout (data) directly to the response object.
    youtubeDl.stdout.pipe(res);

    // Error handling
    youtubeDl.stderr.on('data', (data) => {
      console.error(`youtube-dl error: ${data}`);
    });

    youtubeDl.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to download.' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
};

