"use client";
import Image from "next/image";
import { useState } from "react";
import ytScrapper from "@/assets/yt-scrapers.png";
import { toast } from "react-toastify";

// Function to fetch channel info
async function fetchChannel(body) {
  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Check if the response is successful
    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }
}

// Main Home component
export default function Home() {
  const [url, setURL] = useState("");
  const [query, setQuery] = useState("");
  const [option, setOption] = useState("video");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (url.length === 0) {
      toast.error("Please enter a URL");
      return;
    }

    const body = {
      url,
      searchTerms: query,
      destination,
      option,
    };

    setLoading(true);

    try {
      const data = await fetchChannel(body);
      setLoading(false);
      if (data) {
        setURL("");
        toast.success("Downloaded Successfully!");
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Download failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300 p-5 text-black">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        YouTube Channel Scraper
      </h1>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg space-y-6"
      >
        {/* URL Input */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="url" className="text-gray-700 font-semibold">
            URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={url}
            placeholder="Enter YouTube Video, Playlist, or Channel URL"
            onChange={(e) => setURL(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
            required
          />
        </div>

        {/* Options for playlist, channel, or single video */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="video-option"
              name="download-option"
              onChange={() => setOption("video")}
              checked={option === "video"}
            />
            <label
              htmlFor="video-option"
              className="text-gray-700 font-semibold cursor-pointer"
            >
              Video
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="playlist-option"
              name="download-option"
              onChange={() => setOption("playlist")}
              checked={option === "playlist"}
            />
            <label
              htmlFor="playlist-option"
              className="text-gray-700 font-semibold cursor-pointer"
            >
              Playlist
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="channel-option"
              name="download-option"
              onChange={() => setOption("channel")}
              checked={option === "channel"}
            />
            <label
              htmlFor="channel-option"
              className="text-gray-700 font-semibold cursor-pointer"
            >
              Channel
            </label>
          </div>
        </div>

        {/* Query Terms Input */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="query" className="text-gray-700 font-semibold">
            Query Terms (Optional)
          </label>
          <input
            type="text"
            id="query"
            name="query"
            value={query}
            placeholder="Enter Search Terms"
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
          />
        </div>

        {/* Folder Input */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="destination" className="text-gray-700 font-semibold">
            Select Destination
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={destination}
            placeholder="Enter Destination"
            onChange={(e) => setDestination(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Loading..." : "Scrape Channel Info"}
        </button>
      </form>

      {/* Decorative Image */}
      <Image
        src={ytScrapper}
        alt="YouTube Logo"
        width={150}
        height={150}
        className="mt-10 opacity-75"
      />
    </div>
  );
}
