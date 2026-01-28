import axios from 'axios'

const API_URL = 'http://localhost:8000'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchRoadmap = async (concept) => {
    try {
        const response = await api.post("/roadmap", { concept })
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

export const fetchRecentRoadmaps = async () => {
    try {
        const response = await api.get("/roadmap/trending")
        return response.data
    } catch (error) {
        console.error("API Error:", error)
        return []
    }
}
