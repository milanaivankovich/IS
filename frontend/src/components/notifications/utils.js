import axios from "axios";
import API from "../../variables";

export const getNotificationsPreferences = async (user_id, user_type) => {
    try {
        const request = await axios.get(`${API}/api/notifications/preferences/${user_type}/${user_id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        return request?.data;
    }
    catch (error) {
        console.error("Error: ", error);
    }
};

