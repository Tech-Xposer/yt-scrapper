"use client";
import Image from "next/image";
import { useState } from "react";
import ytScrapper from "@/assets/yt-scrapers.png";
import { toast } from "react-toastify";

// Function to fetch channel info
async function fetchChannel(body) {
  const res = await fetch("/api/channel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  return data;
}

// Main Home component
export default function Home() {
  const [url, setURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (url.length === 0) {
      alert("Please enter a URL");
      return;
    }
    console.log("Submitting form with URL:", url);

    const body = {
      url,
    };

    const res = await fetchChannel(body);
    if (res) {
      setLoading(false);
      console.log(res);
      setData(res.data);

      return toast("Scrapped Successfully!");
    }
    console.log(res);
  };

  // Handle folder selection

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300 p-5">
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
            Channel URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={url}
            placeholder="Enter YouTube Channel URL"
            onChange={(e) => setURL(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full"
            required
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
        <div className="flex flex-col">
          {" "}
          <div>
            <span className="font-bold">
              Channel Name: {data && data.channelName}
            </span>
          </div>
          <span className="font-bold">
            Total Videos Scrapped: {data && data.length}
          </span>
        </div>
      </form>

      {/* Decorative Image (Optional) */}
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
