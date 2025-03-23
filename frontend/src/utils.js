//sve funkcije koje se cesto koritste
import API from "./variables.js";
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

export const fetchCurrentUserData = async () => {
    const id = await fetchIdAndTypeOfUser();
    try {
        const response = await axios.get(`${API}/api/client/${id.id}/`)

        return ({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            username: response.data.username,
            email: response.data.email,
            profile_picture: response.data.profile_picture ? API + response.data.profile_picture : null,
        })
    }
    catch (error) {
        console.error('Error fetching data: ', error);
        //alert('Error 404');
    };
}

const isUserRegistered = async () => {
    const id = await fetchIdAndTypeOfUser();
    if (id.id !== -1)
        return true;
    return false;
}

export const isUserClient = async () => {
    const id = await fetchIdAndTypeOfUser();
    if (id.id !== -1 && id.type === "Client")
        return true;
    return false;

}