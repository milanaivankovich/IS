//sve funkcije koje se cesto koritste
import api from "./variables.js"
import axios from "axios";

export const fetchIdAndTypeOfUser = async () => {
    try {
        const request = await axios.get(`${api}/api/get-user-type-and-id/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })

        return { id: request.data.id, type: request.data.type };
    }
    catch (error) {
        console.error("Error: ", error);
        return { id: -1, type: "" };
    }
};

