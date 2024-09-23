import { ApiError } from "next/dist/server/api-utils";
import { Innertube, UniversalCache } from "youtubei.js";


export const extractIdFromUrl = async (userName) => {

	const URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${userName}&key=${process.env.GOOGLE_API_KEY}`;
	try {
		const response = await fetch(URL);
		const data = await response.json();
		console.log(data)
		if (data.items && data.items.length > 0) {
			const channelId = data.items[0].id.channelId; // Extract the channel ID
			return channelId;
		} else {
			throw new ApiError(404, "Channel not found.");
		}
	} catch (err) {
		throw new ApiError(
			err.statusCode || 500,
			err.message || "Error while extracting channelId from handle."
		);
	}
};


const getYtChannelInfo = async (userName) => {
	try {
		// Extract channel ID from handle
		const channelId = await extractIdFromUrl(userName);
		console.log("Resolved Channel ID:", channelId);

	
		const yt = await Innertube.create({
			cache: new UniversalCache(false),
			generate_session_locally: true,
		});

		// Fetch channel info using the resolved channel ID
		const channel = await yt.getChannel(channelId);
		console.info('Viewing channel:', channel?.header);
		return channel;
	} catch (error) {
		console.error("Error in getYtChannelInfo:", error);
		throw new ApiError(error.statusCode || 500, error.message || "An unexpected error occurred.");
	}
};

export default getYtChannelInfo;
