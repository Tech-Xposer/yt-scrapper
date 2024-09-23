# YouTube Video/Playlist/Channel Downloader

This project allows users to download YouTube videos, playlists, and entire channels by scraping the necessary data and processing it with FFmpeg. Built using [Next.js](https://nextjs.org/), it provides an easy-to-use interface for YouTube content downloads.

## Features

- Download individual YouTube videos.
- Download entire playlists or channels.
- Set custom search terms for targeted video retrieval.
- Specify a destination folder for downloads.

## Setup

To get started with the project, follow these steps to install dependencies:

```bash
npm install
```

## Configuration

## Install FFmpeg

### For Windows

install ffmpeg with `brew install ffmpeg` and `yarn add ffmpeg`

<!-- windows user - download ffmpeg package and extract it in c drive or any other location and set it in PATH  -->

## FFmpeg Setup

### Windows

1. Download the [FFmpeg package](https://ffmpeg.org/download.html) for Windows.
2. Extract the contents to `C:\ffmpeg` or another directory of your choice.
3. Add `C:\ffmpeg\bin` to your `PATH` environment variable:
   - Right-click `This PC` > `Properties`.
   - Click `Advanced system settings`.
   - Under `System Properties`, go to `Environment Variables`.
   - Find `PATH` in the list and click `Edit`.
   - Add the path to the `bin` folder where you extracted FFmpeg (e.g., `C:\ffmpeg\bin`).

### Linux

Install FFmpeg with the following command:

```bash
sudo apt-get install ffmpeg
```

## Setting up environment variables

<!-- mongodb and api key -->

```
MONGODB_URI = 'mongodb connection string'
GOOGLE_API_KEY=" google api key"
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
