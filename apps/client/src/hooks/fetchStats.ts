export const fetchStats = async () => {
    const API_URL = import.meta.env.VITE_APIURL;
    if (!API_URL) throw new Error('API URL is not configured');

    const res = await fetch(`${API_URL}/stat`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const message = await res.json();
        throw new Error(message.message || 'Failed to fetch stats');
    }

    return await res.json();
};
